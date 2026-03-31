import type { CardDefinition } from '../types'
import { INALLA_DECK_DEFINITIONS } from './inalla-deck'

export const CARD_REGISTRY: Map<string, CardDefinition> = new Map(
  INALLA_DECK_DEFINITIONS.map(def => [def.name, def])
)

export function lookupCard(name: string): CardDefinition | null {
  return CARD_REGISTRY.get(name) ?? null
}

// To add a new commander/deck:
// 1. Create src/rules/cards/[commander].ts
// 2. Import and spread its definitions here, e.g.:
//    import { OTHER_DECK_DEFINITIONS } from './other-commander'
//    const ALL = [...INALLA_DECK_DEFINITIONS, ...OTHER_DECK_DEFINITIONS]
