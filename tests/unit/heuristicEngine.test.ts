import { describe, it, expect } from 'vitest'
import { HeuristicEngine } from '../../src/interaction/HeuristicEngine'
import { ARCHETYPES_BY_ID } from '../../src/data/archetypes'
import type { GameAction, GameState } from '../../src/interaction/InteractionEngine'
import { rulesEngine } from '../../src/rules'

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return { turn: 1, stackDepth: 0, lifeTotal: 40, spellsThisTurn: 0, ...overrides }
}

function makeAction(overrides: Partial<GameAction> = {}): GameAction {
  return {
    type: 'cast_spell',
    cardName: "Thassa's Oracle",
    cardType: ['Creature'],
    isWinAttempt: false,
    isTutorable: false,
    stackDepth: 0,
    spellsThisTurn: 0,
    ...overrides,
  }
}

// Deterministic rng that always returns a fixed value
function fixedRng(value: number) {
  return () => value
}

// Deterministic rng returning a sequence of values (cycles when exhausted)
function sequenceRng(...values: number[]) {
  let i = 0
  return () => values[i++ % values.length]
}

describe('HeuristicEngine', () => {
  const kraum = ARCHETYPES_BY_ID['kraum_tymna']
  const kinnan = ARCHETYPES_BY_ID['kinnan']
  const sisay = ARCHETYPES_BY_ID['sisay']
  const etali = ARCHETYPES_BY_ID['etali']
  const thrasiosTymna = ARCHETYPES_BY_ID['thrasios_tymna']

  describe('win attempt branch', () => {
    it('returns interacts:true when roll < threatThreshold and counter available', async () => {
      // kraum threatThreshold = 0.85, roll = 0.5 → should counter
      const engine = new HeuristicEngine(fixedRng(0.5))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        kraum
      )
      expect(decision.interacts).toBe(true)
      expect(decision.interactionType).toBe('counter')
      expect(decision.cardUsed).toBeTruthy()
    })

    it('returns interacts:false when roll >= threatThreshold and no politics', async () => {
      // kinnan threatThreshold = 0.60, willDeal=false, roll = 0.9 → should pass (no politics)
      const engine = new HeuristicEngine(fixedRng(0.9))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        kinnan
      )
      expect(decision.interacts).toBe(false)
    })

    it('picks highest-priority counter per defined order', async () => {
      // rograkh_thrasios has Mana Drain (highest priority) in its counter package
      const rograkh = ARCHETYPES_BY_ID['rograkh_thrasios']
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        rograkh
      )
      expect(decision.cardUsed).toBe('Mana Drain')
    })

    it('returns PASS when no counter package (Etali) even on win attempt', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        etali
      )
      expect(decision.interacts).toBe(false)
    })
  })

  describe('removal branch', () => {
    it('deploys removal on key wizard when roll < 0.4', async () => {
      // First rng call is the main `roll` (always at top). Second call is the removalRoll.
      const engine = new HeuristicEngine(sequenceRng(0.5, 0.3))
      const decision = await engine.evaluate(
        makeAction({ cardName: 'Spellseeker', cardType: ['Creature', 'Wizard'] }),
        makeGameState(),
        kraum
      )
      expect(decision.interacts).toBe(true)
      expect(decision.interactionType).toBe('removal')
    })

    it('does not remove when roll >= 0.4', async () => {
      const engine = new HeuristicEngine(fixedRng(0.9))
      const decision = await engine.evaluate(
        makeAction({ cardName: 'Spellseeker', cardType: ['Creature', 'Wizard'] }),
        makeGameState(),
        kraum
      )
      expect(decision.interacts).toBe(false)
    })
  })

  describe('stax branch', () => {
    it('fires stax for stax-profile opponent on artifact at roll < 0.3', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ cardType: ['Artifact'], isWinAttempt: false, cardName: 'Sol Ring' }),
        makeGameState(),
        sisay
      )
      expect(decision.interacts).toBe(true)
      expect(decision.interactionType).toBe('stax')
    })

    it('does not deploy stax for non-stax opponent', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ cardType: ['Artifact'], isWinAttempt: false }),
        makeGameState(),
        kraum  // kraum has no staxPieces
      )
      expect(decision.interactionType).not.toBe('stax')
    })
  })

  describe('graveyard hate branch (Branch 4)', () => {
    it('deploys graveyard hate for breach line when opponent has relevant pieces and roll < 0.6', async () => {
      // sisay has Drannith Magistrate + Rule of Law (both registered as breach hate)
      // Sequence: roll(0.5, main roll) → skip non-matching branches → hateRoll(0.3) < 0.6 → stax fires
      const engine = new HeuristicEngine(sequenceRng(0.5, 0.3), rulesEngine)
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Enchantment'], activeComboLine: 'breach' }),
        makeGameState(),
        sisay
      )
      // sisay stax branch fires first (roll 0.5 >= 0.3 → misses), then hate branch fires (0.3 < 0.6)
      // Actually: stax branch checks `staxRoll = this.rng()` after branch 3 condition passes.
      // Branch 3: Enchantment, stax profile, staxPieces → staxRoll = 0.5 (second call) >= 0.3 → misses
      // Branch 4: activeComboLine='breach', rulesEngine → hateRoll = 0.3 (third call from sequenceRng cycle) < 0.6 → fires
      expect(decision.interacts).toBe(true)
      expect(decision.interactionType).toBe('stax')
      expect(decision.cardUsed).toBeTruthy()
    })

    it('skips graveyard hate when no rules engine is provided', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))  // no rules engine
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Sorcery'], activeComboLine: 'breach' }),
        makeGameState(),
        sisay
      )
      expect(decision.interactionType).not.toBe('stax')
    })

    it('skips graveyard hate when no activeComboLine', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1), rulesEngine)
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Sorcery'] }), // no activeComboLine
        makeGameState(),
        sisay
      )
      expect(decision.interactionType).not.toBe('stax')
    })
  })

  describe('Flusterstorm branch (Branch 5)', () => {
    it('counters with Flusterstorm when spellsThisTurn > 2 and roll < 0.5', async () => {
      // thrasios_tymna has Flusterstorm; spellsThisTurn=3 triggers the branch
      // Sequence: roll(0.95, main roll, not used) → skip branches → flusterRoll(0.3) < 0.5 → fires
      const engine = new HeuristicEngine(sequenceRng(0.95, 0.3))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Instant'], spellsThisTurn: 3 }),
        makeGameState(),
        thrasiosTymna
      )
      expect(decision.interacts).toBe(true)
      expect(decision.cardUsed).toBe('Flusterstorm')
    })

    it('falls back to stackDepth when spellsThisTurn is not provided', async () => {
      // Legacy caller: spellsThisTurn undefined, stackDepth=3 → branch fires via fallback
      const engine = new HeuristicEngine(sequenceRng(0.95, 0.3))
      const action = makeAction({ isWinAttempt: false, cardType: ['Instant'], stackDepth: 3 })
      delete (action as Partial<GameAction>).spellsThisTurn
      const decision = await engine.evaluate(action, makeGameState(), thrasiosTymna)
      expect(decision.interacts).toBe(true)
      expect(decision.cardUsed).toBe('Flusterstorm')
    })

    it('does not fire Flusterstorm when spellsThisTurn <= 2', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Instant'], spellsThisTurn: 2 }),
        makeGameState(),
        thrasiosTymna
      )
      expect(decision.cardUsed).not.toBe('Flusterstorm')
    })
  })

  describe('politics branch (Branch 6)', () => {
    it('emits politics on win attempt when willDeal=true and roll passes counter threshold', async () => {
      // thrasiosTymna: willDeal=true, threatThreshold=0.90
      // Main roll must be >= 0.90 to skip countering, then politicsRoll < 0.2 to fire politics
      // Sequence: roll(0.95) → skips counter → no other branches → politicsRoll(0.1) < 0.2 → fires
      const engine = new HeuristicEngine(sequenceRng(0.95, 0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        thrasiosTymna
      )
      expect(decision.interactionType).toBe('politics')
      expect(decision.interacts).toBe(false)
    })

    it('does not emit politics for non-win attempts', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Sorcery'] }),
        makeGameState(),
        thrasiosTymna
      )
      expect(decision.interactionType).not.toBe('politics')
    })

    it('does not emit politics when willDeal=false', async () => {
      // kinnan: willDeal=false
      const engine = new HeuristicEngine(sequenceRng(0.95, 0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        kinnan
      )
      expect(decision.interactionType).not.toBe('politics')
    })
  })

  describe('Etali — no packages', () => {
    it('returns PASS with no interaction when all packages empty', async () => {
      const engine = new HeuristicEngine(fixedRng(0.01))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false }),
        makeGameState(),
        etali
      )
      expect(decision.interacts).toBe(false)
      expect(decision.interactionType).toBe('pass')
    })
  })

  describe('reasoning field', () => {
    it('always returns a non-empty reasoning string', async () => {
      const opponents = Object.values(ARCHETYPES_BY_ID)
      for (const opp of opponents) {
        const engine = new HeuristicEngine(fixedRng(0.5))
        const decision = await engine.evaluate(makeAction(), makeGameState(), opp)
        expect(decision.reasoning).toBeTruthy()
        expect(decision.reasoning.length).toBeGreaterThan(0)
      }
    })

    it('counter reasoning includes card name', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        kraum
      )
      expect(decision.reasoning).toContain(decision.cardUsed!)
    })
  })
})
