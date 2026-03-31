export type Scenario = 'spellseeker' | 'breach' | 'consultation'
export type SimulatorMode = 'tutorial' | 'freeplay'
export type Zone = 'command' | 'hand' | 'battlefield' | 'stack' | 'graveyard' | 'exile' | 'library'
export type ManaType = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
export type Step =
  | 'untap'
  | 'upkeep'
  | 'draw'
  | 'main1'
  | 'begin-combat'
  | 'declare-attackers'
  | 'declare-blockers'
  | 'combat-damage'
  | 'end-combat'
  | 'main2'
  | 'end'
  | 'cleanup'

export type Phase = 'beginning' | 'main1' | 'combat' | 'main2' | 'ending'

export interface ScryfallCard {
  id: string
  name: string
  oracle_text?: string
  mana_cost?: string
  type_line: string
  image_uris?: {
    art_crop: string
    normal: string
  }
  artist: string
  card_faces?: Array<{
    image_uris?: {
      art_crop: string
      normal: string
    }
    artist?: string
  }>
}

export interface GameCard {
  instanceId: string
  name: string
  scryfallData: ScryfallCard | null
  artCropUrl: string | null
  normalImageUrl: string | null
  isLoading: boolean
  isToken: boolean
  tapped: boolean
  zone: Zone
  position?: { x: number; y: number }
  markedForExile: boolean
  highlightedInTutorial: boolean
  isEtbTrigger?: boolean
  triggerDescription?: string
  pendingInallaTrigger?: { wizardInstanceId: string; wizardName: string }
}

export interface ComboStep {
  stepNumber: number
  action: string
  highlightCards: string[]
  manaChange?: Partial<Record<ManaType, number>>
  lifeChange?: number
  cardMoves?: Array<{ card: string; from: string; to: string }>
  validate?: (state: {
    hand: { name: string }[]
    battlefield: { name: string }[]
    graveyard: { name: string }[]
    exile: { name: string }[]
    manaPool?: Partial<Record<ManaType, number>>
  }) => boolean
}

export interface ComboDefinition {
  id: string
  name: string
  description: string
  prerequisites: string
  steps: ComboStep[]
}

export interface StackItem {
  id: string
  type: 'spell' | 'ability' | 'inalla-trigger'
  description: string
  sourceCardName?: string
  cardInstanceId?: string
  pendingInallaTrigger?: {
    wizardInstanceId: string
    wizardName: string
  }
}
