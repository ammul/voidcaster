import type { Scenario } from '../types'

// All hands use cards that exist in the actual Wizard's Chess decklist.
// No basic lands — the deck runs none.

export const EXAMPLE_HANDS: Record<Scenario, string[]> = {
  // Needs 1U + 1B + 2 generic to go off T1/T2
  spellseeker: [
    'Underground Sea',
    'Polluted Delta',
    'Dark Ritual',
    'Lotus Petal',
    'Spellseeker',
    'Pact of Negation',
    'Cabal Ritual',
  ],
  // Classic Breach pile — all three pieces plus protection
  breach: [
    'Underworld Breach',
    "Lion's Eye Diamond",
    'Brain Freeze',
    "Thassa's Oracle",
    'Underground Sea',
    'Volcanic Island',
    'Force of Will',
  ],
  // Two-card instant win
  consultation: [
    "Thassa's Oracle",
    'Demonic Consultation',
    'Underground Sea',
    'Dark Ritual',
    'Lotus Petal',
    'Pact of Negation',
    'Flusterstorm',
  ],
}
