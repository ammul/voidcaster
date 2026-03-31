import type { ManaCost, CardDefinition, ValidationResult, RulesGameState } from './types'
import type { ComboStep } from '../types'
import type { OpponentArchetype } from '../data/archetypes'
import type { Scenario, ManaType, Step } from '../types'
import { parseManaCost } from './manaCostParser'

const SORCERY_STEPS: Step[] = ['main1', 'main2']

// Fallback hate maps for cards not in the registry
const FALLBACK_HATE: Record<Scenario, string[]> = {
  breach:       ["Grafdigger's Cage", 'Rest in Peace', 'Leyline of the Void', "Tormod's Crypt"],
  spellseeker:  ['Torpor Orb', 'Rule of Law', 'Deafening Silence', 'Drannith Magistrate'],
  consultation: ['Torpor Orb', "Teferi, Time Raveler", 'Cursed Totem'],
}

export class RulesEngine {
  private registry: Map<string, CardDefinition>

  constructor(registry: Map<string, CardDefinition>) {
    this.registry = registry
  }

  getDefinition(cardName: string): CardDefinition | null {
    return this.registry.get(cardName) ?? null
  }

  /**
   * Checks whether a card can legally be cast given the current game state.
   *
   * Validates in order:
   * 1. Zone presence (hand for normal, graveyard for escape)
   * 2. Mana cost vs. mana pool
   * 3. Additional cost feasibility (sacrifice, pay life, escape exile count)
   * 4. Timing (sorcery speed requires main phase + empty stack)
   *
   * Returns valid: true for unregistered cards (graceful degradation).
   */
  canCast(cardName: string, state: RulesGameState): ValidationResult {
    const def = this.getDefinition(cardName)
    if (!def) return { valid: true, blocking: 'none' }

    // Lands use "play" rules, not cast
    if (def.types.includes('Land')) return { valid: true, blocking: 'none' }

    // 1. Zone presence
    const hasEscapeCost = def.additionalCosts?.some(c => c.kind === 'exile_from_graveyard')
    if (hasEscapeCost) {
      if (!state.zones.graveyard.includes(cardName)) {
        return {
          valid: false,
          reason: `${cardName} must be in your graveyard to escape.`,
          blocking: 'hard',
        }
      }
    } else if (def.castingTiming !== 'special') {
      if (!state.zones.hand.includes(cardName)) {
        return {
          valid: false,
          reason: `${cardName} must be in hand to cast.`,
          blocking: 'hard',
        }
      }
    }

    // 2. Mana cost
    if (def.manaCost && !def.manaCost.variable) {
      if (!RulesEngine.canAfford(def.manaCost, state.manaPool)) {
        return {
          valid: false,
          reason: `Not enough mana to cast ${cardName} (needs ${def.manaCost.cmc} mana).`,
          blocking: 'hard',
        }
      }
    }

    // 3. Additional cost feasibility
    for (const cost of def.additionalCosts ?? []) {
      if (cost.kind === 'sacrifice_creature') {
        const hasCreature = state.zones.battlefield.length > 0
        if (!hasCreature) {
          return {
            valid: false,
            reason: `${cardName} requires sacrificing a creature — none on battlefield.`,
            blocking: 'hard',
          }
        }
      }
      if (cost.kind === 'pay_life' && cost.lifeAmount) {
        if (state.lifeTotal <= cost.lifeAmount) {
          return {
            valid: false,
            reason: `Not enough life to pay for ${cardName} (need more than ${cost.lifeAmount}).`,
            blocking: 'hard',
          }
        }
      }
      if (cost.kind === 'exile_from_graveyard' && cost.escapeCount) {
        const escapeFodder = state.zones.graveyard.filter(n => n !== cardName).length
        if (escapeFodder < cost.escapeCount) {
          return {
            valid: false,
            reason: `${cardName} requires exiling ${cost.escapeCount} cards from graveyard (have ${escapeFodder}).`,
            blocking: 'hard',
          }
        }
      }
    }

    // 4. Timing
    if (def.castingTiming === 'sorcery') {
      const inMainPhase = SORCERY_STEPS.includes(state.step)
      if (!inMainPhase || state.stackDepth > 0) {
        return {
          valid: false,
          reason: `${cardName} can only be cast during your main phase with an empty stack.`,
          blocking: 'timing',
        }
      }
    }

    return { valid: true, blocking: 'none' }
  }

  /**
   * Derives a ValidationResult for a combo step.
   *
   * Checks that all cards listed as sources in step.cardMoves exist in the declared
   * from-zones. If the primary card (highlightCards[0]) is being cast from hand,
   * also validates it via canCast.
   *
   * Returns valid: true for narrative-only steps with no cardMoves.
   */
  validateStep(step: ComboStep, state: RulesGameState): ValidationResult {
    for (const move of step.cardMoves ?? []) {
      const zoneKey = move.from as keyof typeof state.zones
      const zoneCards = (state.zones[zoneKey] ?? []) as string[]
      if (!zoneCards.includes(move.card)) {
        return {
          valid: false,
          reason: `${move.card} must be in ${move.from} to proceed.`,
          blocking: 'hard',
        }
      }
    }

    // Mana validation for the primary card being cast from hand
    const primaryCard = step.highlightCards[0]
    if (
      primaryCard &&
      step.cardMoves?.some(m => m.from === 'hand' && m.card === primaryCard)
    ) {
      const castResult = this.canCast(primaryCard, state)
      if (!castResult.valid) return castResult
    }

    return { valid: true, blocking: 'none' }
  }

  /**
   * Infers which combo line is active from current zone contents.
   * Returns null when ambiguous.
   *
   * Detection priority:
   *   1. 'breach'       — Underworld Breach is on battlefield
   *   2. 'consultation' — Thassa's Oracle is on battlefield/stack, or Oracle + Consultation/Pact in hand
   *   3. 'spellseeker'  — Spellseeker in graveyard, or Scholar present on bf/gy
   */
  detectActiveComboLine(state: RulesGameState): Scenario | null {
    const bf   = state.zones.battlefield
    const gy   = state.zones.graveyard
    const hand = state.zones.hand
    const stack = state.zones.stack ?? []

    if (bf.includes('Underworld Breach')) return 'breach'

    if (
      bf.includes("Thassa's Oracle") ||
      stack.includes("Thassa's Oracle") ||
      (hand.includes("Thassa's Oracle") &&
        (hand.includes('Demonic Consultation') || hand.includes('Tainted Pact')))
    ) {
      return 'consultation'
    }

    if (
      gy.includes('Spellseeker') ||
      bf.includes('Scholar of the Ages') ||
      gy.includes('Scholar of the Ages')
    ) {
      return 'spellseeker'
    }

    return null
  }

  /**
   * Returns archetype-specific hate cards for a given combo line, ordered
   * by impact (most impactful first).
   *
   * Checks the archetype's staxPieces and counterPackage against:
   * 1. Registry-based lookup: card.countersTo keys that are combo-line engines
   * 2. card.comboRole.role === 'hate' for the matching line
   * 3. Fallback hardcoded map for cards not in the registry
   */
  getHateCards(comboLine: Scenario, archetype: OpponentArchetype): string[] {
    const pool = [...archetype.staxPieces, ...archetype.counterPackage]
    const results: string[] = []

    for (const hateCardName of pool) {
      const def = this.registry.get(hateCardName)

      if (def) {
        // Registry path: check if any countersTo target is a combo engine for this line
        const hatesLine = def.countersTo
          ? Object.keys(def.countersTo).some(targeted => {
              const targetDef = this.registry.get(targeted)
              return targetDef?.comboRole?.lines.includes(comboLine)
            })
          : false
        const isHatePiece = def.comboRole?.role === 'hate' && def.comboRole.lines.includes(comboLine)

        if ((hatesLine || isHatePiece) && !results.includes(hateCardName)) {
          results.push(hateCardName)
        }
      } else {
        // Fallback path: check hardcoded lists
        if (FALLBACK_HATE[comboLine].includes(hateCardName) && !results.includes(hateCardName)) {
          results.push(hateCardName)
        }
      }
    }

    return results
  }

  /**
   * Checks whether a mana pool can pay for a given cost.
   * Colored requirements are satisfied first (1:1 from matching color), then
   * generic is paid from any remaining mana in any order.
   */
  static canAfford(cost: ManaCost, pool: Record<string, number>): boolean {
    const remaining: Record<string, number> = { ...pool }

    // Pay colored pips
    for (const [color, pips] of Object.entries(cost.colored) as [ManaType, number][]) {
      const available = remaining[color] ?? 0
      if (available < pips) return false
      remaining[color] = available - pips
    }

    // Pay generic from any remaining color
    let generic = cost.generic
    for (const color of Object.keys(remaining)) {
      if (generic <= 0) break
      const use = Math.min(generic, remaining[color])
      generic -= use
      remaining[color] -= use
    }

    return generic <= 0
  }

  static parseManaCost(scryfallString: string): ManaCost {
    return parseManaCost(scryfallString)
  }
}
