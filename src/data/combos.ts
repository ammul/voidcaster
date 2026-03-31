import type { ManaType, ComboStep, ComboDefinition } from '../types'
import { rulesEngine, RulesEngine } from '../rules'

// Re-export so existing imports from this module keep working
export type { ComboStep, ComboDefinition }

// StepState is the runtime view passed into validate() closures.
// manaPool is optional for backward compat; when present (Phase 4+),
// derivedValidator will enforce affordability before allowing advancement.
type StepState = {
  hand: { name: string }[]
  battlefield: { name: string }[]
  graveyard: { name: string }[]
  exile: { name: string }[]
  manaPool?: Partial<Record<ManaType, number>>
}

/**
 * Returns a post-condition validator derived from step.cardMoves.
 *
 * Zone check: every moved card must appear in its destination zone.
 * Mana check (Phase 4): when state.manaPool is provided, the primary
 *   card being cast from hand must be affordable; steps that cast from
 *   graveyard (escape), tutor, or are narrative-only are skipped.
 *
 * Returns () => true for steps with no cardMoves.
 */
function derivedValidator(step: ComboStep): (state: StepState) => boolean {
  const moves = step.cardMoves
  return (state: StepState) => {
    // 1. Post-condition: all moved cards must be in their destination zones
    if (moves?.length) {
      const allInDest = moves.every(m => {
        const zone = state[m.to as keyof StepState] as { name: string }[] | undefined
        return zone?.some(c => c.name === m.card) ?? false
      })
      if (!allInDest) return false
    }

    // 2. Mana check: primary card cast from hand must be affordable
    if (state.manaPool) {
      const primaryCard = step.highlightCards[0]
      const isCastFromHand = moves?.some(m => m.from === 'hand' && m.card === primaryCard)
      if (primaryCard && isCastFromHand) {
        const def = rulesEngine.getDefinition(primaryCard)
        if (def?.manaCost && !def.manaCost.variable) {
          if (!RulesEngine.canAfford(def.manaCost, state.manaPool as Record<ManaType, number>)) {
            return false
          }
        }
      }
    }

    return true
  }
}

export const SPELLSEEKER_COMBO: ComboDefinition = {
  id: 'spellseeker',
  name: 'Spellseeker Line',
  description: "A 30-step combo using Spellseeker to chain tutors and generate infinite mana, winning with Thassa's Oracle.",
  prerequisites: '1U, 1B, 2C available · More than 7 life',
  steps: [
    {
      stepNumber: 1,
      action: 'Cast Spellseeker. Stack ETB trigger (Spellseeker) above Inalla trigger.',
      highlightCards: ['Spellseeker'],
      cardMoves: [{ card: 'Spellseeker', from: 'hand', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 2,
      action: 'Resolve Spellseeker ETB — tutor Culling the Weak to hand. (Use Search Library)',
      highlightCards: ['Spellseeker', 'Culling the Weak'],
      cardMoves: [{ card: 'Culling the Weak', from: 'library', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 3,
      action: 'Cast Culling the Weak, sacrificing Spellseeker. Generate BBBB mana.',
      highlightCards: ['Culling the Weak', 'Spellseeker'],
      manaChange: { B: 4 },
      cardMoves: [{ card: 'Spellseeker', from: 'battlefield', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 4,
      action: 'Resolve Inalla trigger — create a haste token copy of Spellseeker.',
      highlightCards: ['Inalla, Archmage Ritualist'],
    },
    {
      stepNumber: 5,
      action: 'Resolve token Spellseeker ETB — tutor Unearth to hand.',
      highlightCards: ['Spellseeker', 'Unearth'],
      cardMoves: [{ card: 'Unearth', from: 'library', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 6,
      action: 'Cast Unearth targeting Spellseeker in graveyard. Stack ETB + Inalla trigger.',
      highlightCards: ['Unearth', 'Spellseeker'],
      cardMoves: [{ card: 'Spellseeker', from: 'graveyard', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 7,
      action: 'Resolve Spellseeker ETB — tutor Burnt Offering to hand.',
      highlightCards: ['Spellseeker', 'Burnt Offering'],
      cardMoves: [{ card: 'Burnt Offering', from: 'library', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 8,
      action: 'Resolve Inalla trigger — create haste token copy of Spellseeker.',
      highlightCards: ['Inalla, Archmage Ritualist', 'Spellseeker'],
    },
    {
      stepNumber: 9,
      action: 'Resolve token Spellseeker ETB — tutor Finale of Promise to hand.',
      highlightCards: ['Spellseeker', 'Finale of Promise'],
      cardMoves: [{ card: 'Finale of Promise', from: 'library', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 10,
      action: 'Cast Burnt Offering sacrificing Spellseeker. Generate mana.',
      highlightCards: ['Burnt Offering', 'Spellseeker'],
      cardMoves: [{ card: 'Spellseeker', from: 'battlefield', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 11,
      action: 'Cast Finale of Promise X=1, targeting Culling the Weak and Unearth.',
      highlightCards: ['Finale of Promise', 'Culling the Weak', 'Unearth'],
    },
    {
      stepNumber: 12,
      action: 'Free-cast Unearth targeting Spellseeker. Stack ETB + Inalla trigger.',
      highlightCards: ['Unearth', 'Spellseeker'],
      cardMoves: [{ card: 'Spellseeker', from: 'graveyard', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 13,
      action: 'Resolve Spellseeker ETB — tutor Entomb to hand.',
      highlightCards: ['Spellseeker', 'Entomb'],
      cardMoves: [{ card: 'Entomb', from: 'library', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 14,
      action: 'Resolve Inalla trigger — create token Spellseeker.',
      highlightCards: ['Inalla, Archmage Ritualist', 'Spellseeker'],
    },
    {
      stepNumber: 15,
      action: 'Resolve token ETB — tutor Reanimate to hand.',
      highlightCards: ['Spellseeker', 'Reanimate'],
      cardMoves: [{ card: 'Reanimate', from: 'library', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 16,
      action: 'Cast Entomb — put Scholar of the Ages into graveyard.',
      highlightCards: ['Entomb', 'Scholar of the Ages'],
      cardMoves: [{ card: 'Scholar of the Ages', from: 'library', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 17,
      action: 'Cast Reanimate targeting Scholar of the Ages. Pay 7 life.',
      highlightCards: ['Reanimate', 'Scholar of the Ages'],
      lifeChange: -7,
      cardMoves: [{ card: 'Scholar of the Ages', from: 'graveyard', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 18,
      action: 'Resolve Scholar ETB — return Burnt Offering and Entomb to hand.',
      highlightCards: ['Scholar of the Ages', 'Burnt Offering', 'Entomb'],
      cardMoves: [
        { card: 'Burnt Offering', from: 'graveyard', to: 'hand' },
        { card: 'Entomb', from: 'graveyard', to: 'hand' },
      ],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 19,
      action: 'Cast Burnt Offering sacrificing Scholar of the Ages.',
      highlightCards: ['Burnt Offering', 'Scholar of the Ages'],
      cardMoves: [{ card: 'Scholar of the Ages', from: 'battlefield', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 20,
      action: 'Cast Entomb — put Shallow Grave into graveyard.',
      highlightCards: ['Entomb', 'Shallow Grave'],
      cardMoves: [{ card: 'Shallow Grave', from: 'library', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 21,
      action: 'Resolve Inalla trigger — create token Scholar of the Ages.',
      highlightCards: ['Inalla, Archmage Ritualist', 'Scholar of the Ages'],
    },
    {
      stepNumber: 22,
      action: 'Resolve token Scholar ETB — return Burnt Offering and Shallow Grave to hand.',
      highlightCards: ['Scholar of the Ages', 'Burnt Offering', 'Shallow Grave'],
      cardMoves: [
        { card: 'Burnt Offering', from: 'graveyard', to: 'hand' },
        { card: 'Shallow Grave', from: 'graveyard', to: 'hand' },
      ],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 23,
      action: 'Cast Burnt Offering sacrificing Scholar of the Ages.',
      highlightCards: ['Burnt Offering', 'Scholar of the Ages'],
      cardMoves: [{ card: 'Scholar of the Ages', from: 'battlefield', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 24,
      action: 'Cast Shallow Grave — return Scholar of the Ages. Two triggers on stack.',
      highlightCards: ['Shallow Grave', 'Scholar of the Ages'],
      cardMoves: [{ card: 'Scholar of the Ages', from: 'graveyard', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 25,
      action: '[Loop begins] Resolve Scholar ETB — return Burnt Offering and Entomb.',
      highlightCards: ['Scholar of the Ages', 'Burnt Offering', 'Entomb'],
      cardMoves: [
        { card: 'Burnt Offering', from: 'graveyard', to: 'hand' },
        { card: 'Entomb', from: 'graveyard', to: 'hand' },
      ],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 26,
      action: 'Cast Burnt Offering sacrificing Scholar.',
      highlightCards: ['Burnt Offering', 'Scholar of the Ages'],
      cardMoves: [{ card: 'Scholar of the Ages', from: 'battlefield', to: 'graveyard' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 27,
      action: 'Resolve Inalla trigger — token Scholar.',
      highlightCards: ['Inalla, Archmage Ritualist', 'Scholar of the Ages'],
    },
    {
      stepNumber: 28,
      action: 'Resolve token Scholar ETB — return Shallow Grave + any instant/sorcery.',
      highlightCards: ['Scholar of the Ages', 'Shallow Grave'],
      cardMoves: [{ card: 'Shallow Grave', from: 'graveyard', to: 'hand' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 29,
      action: 'Repeat loop — generate infinite mana, Entomb any cards needed.',
      highlightCards: [],
    },
    {
      stepNumber: 30,
      action: "WIN: Cast Thassa's Oracle with empty library.",
      highlightCards: ["Thassa's Oracle"],
      cardMoves: [{ card: "Thassa's Oracle", from: 'hand', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
  ],
}

export const BREACH_COMBO: ComboDefinition = {
  id: 'breach',
  name: 'Underworld Breach Loop',
  description: "Use Underworld Breach + Lion's Eye Diamond + Brain Freeze to mill your library, then win with Thassa's Oracle.",
  prerequisites: "Underworld Breach + Lion's Eye Diamond + Brain Freeze in hand/graveyard",
  steps: [
    {
      stepNumber: 1,
      action: 'Cast Underworld Breach.',
      highlightCards: ['Underworld Breach'],
      cardMoves: [{ card: 'Underworld Breach', from: 'hand', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 2,
      action: "Cast Lion's Eye Diamond.",
      highlightCards: ["Lion's Eye Diamond"],
      cardMoves: [{ card: "Lion's Eye Diamond", from: 'hand', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      stepNumber: 3,
      action: 'Activate LED — add BBB/RRR/UUU, discard hand.',
      highlightCards: ["Lion's Eye Diamond"],
    },
    {
      // Brain Freeze is escape-cast FROM the graveyard; this validate is a pre-condition
      // (Brain Freeze must be in GY before escape). derivedValidator checks destinations,
      // so it can't replicate this. Kept as a direct inline closure.
      stepNumber: 4,
      action: 'Cast Brain Freeze from graveyard (escape, exile 3). Target self.',
      highlightCards: ['Brain Freeze'],
      cardMoves: [{ card: 'Brain Freeze', from: 'graveyard', to: 'exile' }],
      validate: s => s.graveyard.some(c => c.name === 'Brain Freeze'),
    },
    {
      stepNumber: 5,
      action: "Cast Lion's Eye Diamond from graveyard (escape, exile 3).",
      highlightCards: ["Lion's Eye Diamond"],
    },
    {
      stepNumber: 6,
      action: 'Repeat until library is empty.',
      highlightCards: [],
    },
    {
      stepNumber: 7,
      action: "WIN: Cast Thassa's Oracle.",
      highlightCards: ["Thassa's Oracle"],
      cardMoves: [{ card: "Thassa's Oracle", from: 'hand', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
  ],
}

export const CONSULTATION_COMBO: ComboDefinition = {
  id: 'consultation',
  name: "Thassa's Oracle + Consultation",
  description: "A 2-card instant-win: cast Thassa's Oracle, then in response exile your library with Demonic Consultation or Tainted Pact.",
  prerequisites: "Thassa's Oracle + Demonic Consultation or Tainted Pact in hand",
  steps: [
    {
      stepNumber: 1,
      action: "Cast Thassa's Oracle. Hold priority.",
      highlightCards: ["Thassa's Oracle"],
      cardMoves: [{ card: "Thassa's Oracle", from: 'hand', to: 'battlefield' }],
      get validate() { return derivedValidator(this) },
    },
    {
      // OR condition: player may have used either Consultation or Tainted Pact.
      // derivedValidator only supports AND across all moves, so kept as inline closure.
      stepNumber: 2,
      action: 'In response, cast Demonic Consultation / Tainted Pact.',
      highlightCards: ['Demonic Consultation', 'Tainted Pact'],
      cardMoves: [{ card: 'Demonic Consultation', from: 'hand', to: 'graveyard' }],
      validate: s =>
        s.graveyard.some(c => c.name === 'Demonic Consultation') ||
        s.graveyard.some(c => c.name === 'Tainted Pact'),
    },
    {
      stepNumber: 3,
      action: 'Exile library.',
      highlightCards: [],
    },
    {
      stepNumber: 4,
      action: "Resolve Oracle ETB trigger — win the game.",
      highlightCards: ["Thassa's Oracle"],
    },
  ],
}

export const ALL_COMBOS: ComboDefinition[] = [SPELLSEEKER_COMBO, BREACH_COMBO, CONSULTATION_COMBO]
