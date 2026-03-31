import type { Zone, ManaType, Scenario, Phase, Step } from '../types'

export type CardType = 'Creature' | 'Instant' | 'Sorcery' | 'Enchantment' | 'Artifact' | 'Land' | 'Planeswalker' | 'Battle'
export type SuperType = 'Legendary' | 'Basic' | 'Snow' | 'World'

export interface ManaCost {
  generic: number
  variable: boolean
  colored: Partial<Record<ManaType, number>>
  cmc: number
}

export type AdditionalCostKind =
  | 'sacrifice_self'
  | 'sacrifice_creature'
  | 'sacrifice_permanent'
  | 'discard_hand'
  | 'exile_from_graveyard'
  | 'pay_life'
  | 'tap_self'

export interface AdditionalCost {
  kind: AdditionalCostKind
  count?: number
  lifeAmount?: number
  escapeCount?: number
}

export type CastingTiming = 'sorcery' | 'instant' | 'special'

export type TriggerEvent =
  | 'etb'
  | 'wizard_etb'
  | 'spell_cast'
  | 'creature_dies'
  | 'discard'
  | 'phase_end'

export type EffectKind =
  | 'tutor_to_hand'
  | 'mill_self'
  | 'draw'
  | 'add_mana'
  | 'create_token'
  | 'cast_from_graveyard'
  | 'win_game'
  | 'exile_library'
  | 'return_to_hand'
  | 'reanimate'
  | 'deal_damage'
  | 'gain_life'
  | 'counter_spell'
  | 'bounce'
  | 'put_in_graveyard'
  | 'other'

export interface Effect {
  kind: EffectKind
  constraint?: string
  count?: number
}

export type AbilityKind = 'triggered' | 'activated' | 'static' | 'replacement'

export interface Ability {
  kind: AbilityKind
  trigger?: TriggerEvent
  activationCost?: ManaCost
  activationAdditionalCosts?: AdditionalCost[]
  effects: Effect[]
  isEminence?: boolean
  requiresZone?: Zone
}

export interface CardDefinition {
  name: string
  superTypes: SuperType[]
  types: CardType[]
  subTypes: string[]
  manaCost: ManaCost | null
  castingTiming: CastingTiming
  additionalCosts?: AdditionalCost[]
  abilities: Ability[]
  comboRole?: {
    lines: Scenario[]
    role: 'engine' | 'enabler' | 'payoff' | 'hate'
  }
  /** Maps hate card name → tooltip explaining the interaction */
  countersTo?: Record<string, string>
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  blocking: 'hard' | 'timing' | 'none'
}

export interface RulesGameState {
  manaPool: Record<ManaType, number>
  phase: Phase
  step: Step
  stackDepth: number
  lifeTotal: number
  zones: {
    hand: string[]
    battlefield: string[]
    graveyard: string[]
    exile: string[]
    library: string[]
    stack?: string[]
  }
  spellsThisTurn: number
  activeComboLine?: Scenario
}
