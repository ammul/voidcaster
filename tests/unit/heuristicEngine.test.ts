import { describe, it, expect } from 'vitest'
import { HeuristicEngine } from '../../src/interaction/HeuristicEngine'
import { ARCHETYPES_BY_ID } from '../../src/data/archetypes'
import type { GameAction, GameState } from '../../src/interaction/InteractionEngine'

function makeGameState(overrides: Partial<GameState> = {}): GameState {
  return { turn: 1, stackDepth: 0, lifeTotal: 40, ...overrides }
}

function makeAction(overrides: Partial<GameAction> = {}): GameAction {
  return {
    type: 'cast_spell',
    cardName: 'Thassa\'s Oracle',
    cardType: ['Creature'],
    isWinAttempt: false,
    isTutorable: false,
    stackDepth: 0,
    ...overrides,
  }
}

// Deterministic rng that always returns a fixed value
function fixedRng(value: number) {
  return () => value
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

    it('returns interacts:false when roll >= threatThreshold', async () => {
      // kraum threatThreshold = 0.85, roll = 0.9 → should pass
      const engine = new HeuristicEngine(fixedRng(0.9))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: true }),
        makeGameState(),
        kraum
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
      // First roll for win-attempt check (irrelevant since isWinAttempt=false),
      // second roll used for removal: we chain two values
      let callCount = 0
      const engine = new HeuristicEngine(() => {
        callCount++
        return callCount === 1 ? 0.3 : 0.3  // second call: 0.3 < 0.4 → removal
      })
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
      let callCount = 0
      const engine = new HeuristicEngine(() => {
        callCount++
        return 0.1  // all rolls 0.1 — stax fires
      })
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

  describe('politics branch', () => {
    it('emits politics event after turn 3 when willDeal=true and roll < 0.2', async () => {
      // thrasios_tymna willDeal=true, politicsTemplates non-empty
      // We need roll < 0.2 and turn > 3
      // The politics roll is the last one checked; make all calls return 0.1
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Sorcery'] }),
        makeGameState({ turn: 5 }),
        thrasiosTymna
      )
      expect(decision.interactionType).toBe('politics')
      expect(decision.interacts).toBe(false)
    })

    it('does not emit politics before turn 3', async () => {
      const engine = new HeuristicEngine(fixedRng(0.1))
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Sorcery'] }),
        makeGameState({ turn: 2 }),
        thrasiosTymna
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

  describe('Flusterstorm deep stack', () => {
    it('counters with Flusterstorm when stackDepth > 2 and roll < 0.5', async () => {
      // thrasios_tymna has Flusterstorm
      let callCount = 0
      const engine = new HeuristicEngine(() => {
        callCount++
        // First: win attempt check (0.95 > 0.9 → pass win check)
        // Second: no creature branch, no stax branch, then stackDepth > 2 branch → roll 0.3 < 0.5
        return callCount === 1 ? 0.95 : 0.3
      })
      const decision = await engine.evaluate(
        makeAction({ isWinAttempt: false, cardType: ['Instant'], stackDepth: 3 }),
        makeGameState(),
        thrasiosTymna
      )
      expect(decision.interacts).toBe(true)
      expect(decision.cardUsed).toBe('Flusterstorm')
    })
  })
})
