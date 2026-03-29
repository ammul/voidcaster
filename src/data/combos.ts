import type { ManaType } from '../types'

type ZoneCard = { name: string }

type StepState = {
  hand: ZoneCard[]
  battlefield: ZoneCard[]
  graveyard: ZoneCard[]
  exile: ZoneCard[]
}

export interface ComboStep {
  stepNumber: number
  action: string
  highlightCards: string[]
  manaChange?: Partial<Record<ManaType, number>>
  lifeChange?: number
  cardMoves?: Array<{ card: string; from: string; to: string }>
  validate?: (state: StepState) => boolean
}

export interface ComboDefinition {
  id: string
  name: string
  description: string
  prerequisites: string
  steps: ComboStep[]
}

const bf   = (name: string) => (s: StepState) => s.battlefield.some(c => c.name === name)
const gy   = (name: string) => (s: StepState) => s.graveyard.some(c => c.name === name)
const inHand = (name: string) => (s: StepState) => s.hand.some(c => c.name === name)

export const SPELLSEEKER_COMBO: ComboDefinition = {
  id: 'spellseeker',
  name: 'Spellseeker Line',
  description: "A 30-step combo using Spellseeker to chain tutors and generate infinite mana, winning with Thassa's Oracle.",
  prerequisites: '1U, 1B, 2C available · More than 7 life',
  steps: [
    { stepNumber: 1,  action: 'Cast Spellseeker. Stack ETB trigger (Spellseeker) above Inalla trigger.', highlightCards: ['Spellseeker'], validate: bf('Spellseeker') },
    { stepNumber: 2,  action: 'Resolve Spellseeker ETB — tutor Culling the Weak to hand. (Use Search Library)', highlightCards: ['Spellseeker', 'Culling the Weak'], validate: inHand('Culling the Weak') },
    { stepNumber: 3,  action: 'Cast Culling the Weak, sacrificing Spellseeker. Generate BBBB mana.', highlightCards: ['Culling the Weak', 'Spellseeker'], manaChange: { B: 4 }, validate: gy('Spellseeker') },
    { stepNumber: 4,  action: 'Resolve Inalla trigger — create a haste token copy of Spellseeker.', highlightCards: ['Inalla, Archmage Ritualist'] },
    { stepNumber: 5,  action: 'Resolve token Spellseeker ETB — tutor Unearth to hand.', highlightCards: ['Spellseeker', 'Unearth'], validate: inHand('Unearth') },
    { stepNumber: 6,  action: 'Cast Unearth targeting Spellseeker in graveyard. Stack ETB + Inalla trigger.', highlightCards: ['Unearth', 'Spellseeker'], validate: bf('Spellseeker') },
    { stepNumber: 7,  action: 'Resolve Spellseeker ETB — tutor Burnt Offering to hand.', highlightCards: ['Spellseeker', 'Burnt Offering'], validate: inHand('Burnt Offering') },
    { stepNumber: 8,  action: 'Resolve Inalla trigger — create haste token copy of Spellseeker.', highlightCards: ['Inalla, Archmage Ritualist', 'Spellseeker'] },
    { stepNumber: 9,  action: 'Resolve token Spellseeker ETB — tutor Finale of Promise to hand.', highlightCards: ['Spellseeker', 'Finale of Promise'], validate: inHand('Finale of Promise') },
    { stepNumber: 10, action: 'Cast Burnt Offering sacrificing Spellseeker. Generate mana.', highlightCards: ['Burnt Offering', 'Spellseeker'], validate: gy('Spellseeker') },
    { stepNumber: 11, action: 'Cast Finale of Promise X=1, targeting Culling the Weak and Unearth.', highlightCards: ['Finale of Promise', 'Culling the Weak', 'Unearth'] },
    { stepNumber: 12, action: 'Free-cast Unearth targeting Spellseeker. Stack ETB + Inalla trigger.', highlightCards: ['Unearth', 'Spellseeker'], validate: bf('Spellseeker') },
    { stepNumber: 13, action: 'Resolve Spellseeker ETB — tutor Entomb to hand.', highlightCards: ['Spellseeker', 'Entomb'], validate: inHand('Entomb') },
    { stepNumber: 14, action: 'Resolve Inalla trigger — create token Spellseeker.', highlightCards: ['Inalla, Archmage Ritualist', 'Spellseeker'] },
    { stepNumber: 15, action: 'Resolve token ETB — tutor Reanimate to hand.', highlightCards: ['Spellseeker', 'Reanimate'], validate: inHand('Reanimate') },
    { stepNumber: 16, action: 'Cast Entomb — put Scholar of the Ages into graveyard.', highlightCards: ['Entomb', 'Scholar of the Ages'], validate: gy('Scholar of the Ages') },
    { stepNumber: 17, action: 'Cast Reanimate targeting Scholar of the Ages. Pay 7 life.', highlightCards: ['Reanimate', 'Scholar of the Ages'], lifeChange: -7, validate: bf('Scholar of the Ages') },
    { stepNumber: 18, action: 'Resolve Scholar ETB — return Burnt Offering and Entomb to hand.', highlightCards: ['Scholar of the Ages', 'Burnt Offering', 'Entomb'], validate: s => inHand('Burnt Offering')(s) && inHand('Entomb')(s) },
    { stepNumber: 19, action: 'Cast Burnt Offering sacrificing Scholar of the Ages.', highlightCards: ['Burnt Offering', 'Scholar of the Ages'], validate: gy('Scholar of the Ages') },
    { stepNumber: 20, action: 'Cast Entomb — put Shallow Grave into graveyard.', highlightCards: ['Entomb', 'Shallow Grave'], validate: gy('Shallow Grave') },
    { stepNumber: 21, action: 'Resolve Inalla trigger — create token Scholar of the Ages.', highlightCards: ['Inalla, Archmage Ritualist', 'Scholar of the Ages'] },
    { stepNumber: 22, action: 'Resolve token Scholar ETB — return Burnt Offering and Shallow Grave to hand.', highlightCards: ['Scholar of the Ages', 'Burnt Offering', 'Shallow Grave'], validate: s => inHand('Burnt Offering')(s) && inHand('Shallow Grave')(s) },
    { stepNumber: 23, action: 'Cast Burnt Offering sacrificing Scholar of the Ages.', highlightCards: ['Burnt Offering', 'Scholar of the Ages'], validate: gy('Scholar of the Ages') },
    { stepNumber: 24, action: 'Cast Shallow Grave — return Scholar of the Ages. Two triggers on stack.', highlightCards: ['Shallow Grave', 'Scholar of the Ages'], validate: bf('Scholar of the Ages') },
    { stepNumber: 25, action: '[Loop begins] Resolve Scholar ETB — return Burnt Offering and Entomb.', highlightCards: ['Scholar of the Ages', 'Burnt Offering', 'Entomb'], validate: s => inHand('Burnt Offering')(s) && inHand('Entomb')(s) },
    { stepNumber: 26, action: 'Cast Burnt Offering sacrificing Scholar.', highlightCards: ['Burnt Offering', 'Scholar of the Ages'], validate: gy('Scholar of the Ages') },
    { stepNumber: 27, action: 'Resolve Inalla trigger — token Scholar.', highlightCards: ['Inalla, Archmage Ritualist', 'Scholar of the Ages'] },
    { stepNumber: 28, action: 'Resolve token Scholar ETB — return Shallow Grave + any instant/sorcery.', highlightCards: ['Scholar of the Ages', 'Shallow Grave'], validate: inHand('Shallow Grave') },
    { stepNumber: 29, action: 'Repeat loop — generate infinite mana, Entomb any cards needed.', highlightCards: [] },
    { stepNumber: 30, action: "WIN: Cast Thassa's Oracle with empty library.", highlightCards: ["Thassa's Oracle"], validate: bf("Thassa's Oracle") },
  ],
}

export const BREACH_COMBO: ComboDefinition = {
  id: 'breach',
  name: 'Underworld Breach Loop',
  description: "Use Underworld Breach + Lion's Eye Diamond + Brain Freeze to mill your library, then win with Thassa's Oracle.",
  prerequisites: "Underworld Breach + Lion's Eye Diamond + Brain Freeze in hand/graveyard",
  steps: [
    { stepNumber: 1, action: 'Cast Underworld Breach.', highlightCards: ['Underworld Breach'], validate: bf('Underworld Breach') },
    { stepNumber: 2, action: "Cast Lion's Eye Diamond.", highlightCards: ["Lion's Eye Diamond"], validate: bf("Lion's Eye Diamond") },
    { stepNumber: 3, action: 'Activate LED — add BBB/RRR/UUU, discard hand.', highlightCards: ["Lion's Eye Diamond"] },
    { stepNumber: 4, action: 'Cast Brain Freeze from graveyard (escape, exile 3). Target self.', highlightCards: ['Brain Freeze'], validate: gy('Brain Freeze') },
    { stepNumber: 5, action: "Cast Lion's Eye Diamond from graveyard (escape, exile 3).", highlightCards: ["Lion's Eye Diamond"] },
    { stepNumber: 6, action: 'Repeat until library is empty.', highlightCards: [] },
    { stepNumber: 7, action: "WIN: Cast Thassa's Oracle.", highlightCards: ["Thassa's Oracle"], validate: bf("Thassa's Oracle") },
  ],
}

export const CONSULTATION_COMBO: ComboDefinition = {
  id: 'consultation',
  name: "Thassa's Oracle + Consultation",
  description: "A 2-card instant-win: cast Thassa's Oracle, then in response exile your library with Demonic Consultation or Tainted Pact.",
  prerequisites: "Thassa's Oracle + Demonic Consultation or Tainted Pact in hand",
  steps: [
    { stepNumber: 1, action: "Cast Thassa's Oracle. Hold priority.", highlightCards: ["Thassa's Oracle"], validate: bf("Thassa's Oracle") },
    { stepNumber: 2, action: 'In response, cast Demonic Consultation / Tainted Pact.', highlightCards: ['Demonic Consultation', 'Tainted Pact'], validate: s => gy('Demonic Consultation')(s) || gy('Tainted Pact')(s) },
    { stepNumber: 3, action: 'Exile library.', highlightCards: [] },
    { stepNumber: 4, action: "Resolve Oracle ETB trigger — win the game.", highlightCards: ["Thassa's Oracle"] },
  ],
}

export const ALL_COMBOS: ComboDefinition[] = [SPELLSEEKER_COMBO, BREACH_COMBO, CONSULTATION_COMBO]
