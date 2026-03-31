import type { OpponentArchetype } from '../data/archetypes'

export interface GameAction {
  type: 'cast_spell' | 'activate_ability' | 'etb' | 'trigger' | 'phase_change'
  cardName?: string
  cardType?: string[]
  isWinAttempt: boolean
  isTutorable: boolean
  stackDepth: number
  /** Which of the 3 combo lines is currently active (detected from zone state) */
  activeComboLine?: import('../types').Scenario
  /** Number of spells cast this turn — used for Flusterstorm branch (replaces stackDepth heuristic) */
  spellsThisTurn?: number
}

export interface InteractionDecision {
  interacts: boolean
  interactionType?: 'counter' | 'removal' | 'stax' | 'politics' | 'pass'
  cardUsed?: string
  reasoning: string
}

export interface PoliticsEvent {
  from: OpponentArchetype
  message: string
  proposal: 'non_aggression' | 'stop_the_leader' | 'let_me_go_first'
}

export interface GameState {
  turn: number
  stackDepth: number
  lifeTotal: number
  spellsThisTurn: number
}

export interface InteractionEngine {
  evaluate(
    action: GameAction,
    gameState: GameState,
    opponent: OpponentArchetype
  ): Promise<InteractionDecision>
}
