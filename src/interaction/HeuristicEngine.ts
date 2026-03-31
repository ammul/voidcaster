import type { InteractionEngine, GameAction, InteractionDecision, GameState } from './InteractionEngine'
import type { OpponentArchetype } from '../data/archetypes'
import { KEY_WIZARDS } from '../data/archetypes'
import type { RulesEngine } from '../rules/RulesEngine'
import type { Scenario } from '../types'

// Counter priority order — highest priority first
const COUNTER_PRIORITY = [
  'Mana Drain',
  'Force of Will',
  'Fierce Guardianship',
  'Deflecting Swat',
  'Pact of Negation',
  'Counterspell',
  'Swan Song',
  'Flusterstorm',
  'Pyroblast',
  'Red Elemental Blast',
]

function pickHighestPriorityCounter(pkg: string[]): string | undefined {
  for (const c of COUNTER_PRIORITY) {
    if (pkg.includes(c)) return c
  }
  return pkg[0]
}

function reasoningFor(
  type: InteractionDecision['interactionType'],
  commanderName: string,
  cardUsed?: string,
  cardName?: string
): string {
  switch (type) {
    case 'counter':
      return `${commanderName} holds up ${cardUsed} — a win attempt this early can't be allowed to resolve.`
    case 'removal':
      return `${commanderName} uses ${cardUsed} to remove ${cardName} before it generates value.`
    case 'stax':
      return `${commanderName} drops ${cardUsed} — slowing the table is the game plan.`
    case 'politics':
      return `${commanderName} sees more value in a deal than spending resources here.`
    default:
      return `${commanderName} passes priority. Not worth the resources yet.`
  }
}

export class HeuristicEngine implements InteractionEngine {
  private rng: () => number
  private rules: RulesEngine | undefined

  constructor(rng: () => number, rules?: RulesEngine) {
    this.rng = rng
    this.rules = rules
  }

  async evaluate(
    action: GameAction,
    _gameState: GameState,
    opponent: OpponentArchetype
  ): Promise<InteractionDecision> {
    const roll = this.rng()
    const commanderName = opponent.commanderNames[0]

    // Branch 1: Win attempt — try to counter, then fall through to politics on pass
    if (action.isWinAttempt) {
      if (roll < opponent.threatThreshold && opponent.counterPackage.length > 0) {
        const cardUsed = pickHighestPriorityCounter(opponent.counterPackage)
        return {
          interacts: true,
          interactionType: 'counter',
          cardUsed,
          reasoning: reasoningFor('counter', commanderName, cardUsed),
        }
      }
      // Intentional fall-through: opponent passed on countering — politics may still fire below
    }

    // Branch 2: Key wizard creature — possible removal
    if (
      action.cardType?.includes('Creature') &&
      action.cardName &&
      KEY_WIZARDS.has(action.cardName) &&
      opponent.removalPackage.length > 0
    ) {
      const removalRoll = this.rng()
      if (removalRoll < 0.4) {
        const cardUsed = opponent.removalPackage[0]
        return {
          interacts: true,
          interactionType: 'removal',
          cardUsed,
          reasoning: reasoningFor('removal', commanderName, cardUsed, action.cardName),
        }
      }
      return {
        interacts: false,
        interactionType: 'pass',
        reasoning: reasoningFor('pass', commanderName),
      }
    }

    // Branch 3: Enchantment/Artifact → stax deployment
    if (
      (action.cardType?.includes('Enchantment') || action.cardType?.includes('Artifact')) &&
      opponent.speedProfile === 'stax' &&
      opponent.staxPieces.length > 0
    ) {
      const staxRoll = this.rng()
      if (staxRoll < 0.3) {
        const cardUsed = opponent.staxPieces[0]
        return {
          interacts: true,
          interactionType: 'stax',
          cardUsed,
          reasoning: reasoningFor('stax', commanderName, cardUsed),
        }
      }
    }

    // Branch 4: Graveyard hate — deploy archetype hate for active Breach line
    if (action.activeComboLine && this.rules) {
      const comboLine = action.activeComboLine as Scenario
      const hateCards = this.rules.getHateCards(comboLine, opponent)
      if (hateCards.length > 0) {
        const hateRoll = this.rng()
        if (hateRoll < 0.6) {
          const cardUsed = hateCards[0]
          return {
            interacts: true,
            interactionType: 'stax',
            cardUsed,
            reasoning: `${commanderName} drops ${cardUsed} — the ${comboLine} line can't resolve through this.`,
          }
        }
      }
    }

    // Branch 5: Active combo chain — Flusterstorm
    // Uses spellsThisTurn (combo-chain awareness) with stackDepth as fallback for legacy callers
    if (
      (action.spellsThisTurn ?? action.stackDepth) > 2 &&
      opponent.counterPackage.includes('Flusterstorm')
    ) {
      const flusterRoll = this.rng()
      if (flusterRoll < 0.5) {
        return {
          interacts: true,
          interactionType: 'counter',
          cardUsed: 'Flusterstorm',
          reasoning: reasoningFor('counter', commanderName, 'Flusterstorm'),
        }
      }
    }

    // Branch 6: Politics — fires on win attempts when opponent would rather deal than counter
    if (
      action.isWinAttempt &&
      opponent.politicsProfile.willDeal &&
      opponent.politicsTemplates.length > 0
    ) {
      const politicsRoll = this.rng()
      if (politicsRoll < 0.2) {
        return {
          interacts: false,
          interactionType: 'politics',
          reasoning: reasoningFor('politics', commanderName),
        }
      }
    }

    // Default: PASS
    return {
      interacts: false,
      interactionType: 'pass',
      reasoning: reasoningFor('pass', commanderName),
    }
  }
}
