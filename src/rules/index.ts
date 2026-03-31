import { RulesEngine } from './RulesEngine'
import { CARD_REGISTRY } from './cards/index'

/** Singleton — stateless, safe to import anywhere in the app */
export const rulesEngine = new RulesEngine(CARD_REGISTRY)

export type { CardDefinition, ManaCost, ValidationResult, RulesGameState, AdditionalCost, Ability, Effect } from './types'
export { RulesEngine } from './RulesEngine'
export { CARD_REGISTRY, lookupCard } from './cards/index'
