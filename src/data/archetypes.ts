export interface OpponentArchetype {
  id: string
  commanderNames: string[]
  colors: ('W' | 'U' | 'B' | 'R' | 'G')[]
  metaSharePercent: number
  speedProfile: 'turbo' | 'midrange' | 'stax'
  threatThreshold: number
  counterPackage: string[]
  removalPackage: string[]
  staxPieces: string[]
  politicsProfile: {
    willDeal: boolean
    dealPreference: 'let_me_win_later' | 'stop_the_leader' | 'draw_first'
    threatAssessmentBias: 'combo' | 'stax' | 'aggro'
  }
  politicsTemplates: string[]
}

export const ARCHETYPES: OpponentArchetype[] = [
  {
    id: 'kraum_tymna',
    commanderNames: ['Kraum, Ludevic\'s Opus', 'Tymna the Weaver'],
    colors: ['W', 'U', 'B', 'R'],
    metaSharePercent: 10.19,
    speedProfile: 'midrange',
    threatThreshold: 0.85,
    counterPackage: ['Force of Will', 'Pact of Negation', 'Counterspell', 'Flusterstorm', 'Pyroblast', 'Red Elemental Blast'],
    removalPackage: ['Swords to Plowshares', 'Path to Exile', 'Toxic Deluge'],
    staxPieces: [],
    politicsProfile: { willDeal: true, dealPreference: 'stop_the_leader', threatAssessmentBias: 'combo' },
    politicsTemplates: [
      "I'll let this resolve if you leave me alone this turn.",
      "Deal — I won't counter this if you don't attack me.",
      "Let's both stand down and focus on the real threats.",
    ],
  },
  {
    id: 'kinnan',
    commanderNames: ['Kinnan, Bonder Prodigy'],
    colors: ['U', 'G'],
    metaSharePercent: 7.48,
    speedProfile: 'turbo',
    threatThreshold: 0.60,
    counterPackage: ['Force of Will', 'Pact of Negation', 'Swan Song'],
    removalPackage: ["Nature's Claim", 'Abrupt Decay'],
    staxPieces: [],
    politicsProfile: { willDeal: false, dealPreference: 'let_me_win_later', threatAssessmentBias: 'combo' },
    politicsTemplates: [],
  },
  {
    id: 'rograkh_thrasios',
    commanderNames: ['Rograkh, Son of Rohgahh', 'Thrasios, Triton Hero'],
    colors: ['U', 'B', 'R', 'G'],
    metaSharePercent: 5.34,
    speedProfile: 'turbo',
    threatThreshold: 0.90,
    counterPackage: ['Force of Will', 'Fierce Guardianship', 'Mana Drain', 'Pact of Negation', 'Swan Song', 'Deflecting Swat', 'Counterspell'],
    removalPackage: ['Swords to Plowshares', 'Toxic Deluge', 'Chain of Vapor'],
    staxPieces: [],
    politicsProfile: { willDeal: true, dealPreference: 'stop_the_leader', threatAssessmentBias: 'combo' },
    politicsTemplates: [
      "I pass — but only if you let me untap next turn.",
      "We both benefit from stopping the leader first.",
    ],
  },
  {
    id: 'rograkh_silas',
    commanderNames: ['Rograkh, Son of Rohgahh', 'Silas Renn, Seeker Adept'],
    colors: ['U', 'B', 'R'],
    metaSharePercent: 4.26,
    speedProfile: 'midrange',
    threatThreshold: 0.75,
    counterPackage: ['Force of Will', 'Pact of Negation', 'Deflecting Swat', 'Pyroblast'],
    removalPackage: ['Abrupt Decay', "Assassin's Trophy", 'Wear // Tear'],
    staxPieces: [],
    politicsProfile: { willDeal: true, dealPreference: 'stop_the_leader', threatAssessmentBias: 'combo' },
    politicsTemplates: [
      "I'll hold my counter — but remember this.",
      "You're not the most dangerous thing on the table. Not yet.",
    ],
  },
  {
    id: 'sisay',
    commanderNames: ['Sisay, Weatherlight Captain'],
    colors: ['W', 'U', 'B', 'R', 'G'],
    metaSharePercent: 3.68,
    speedProfile: 'stax',
    threatThreshold: 0.70,
    counterPackage: ['Force of Will', 'Counterspell', 'Fierce Guardianship'],
    removalPackage: ['Swords to Plowshares', 'Path to Exile'],
    staxPieces: ['Drannith Magistrate', 'Rule of Law', 'Collector Ouphe', "Kataki, War's Wage", 'Ethersworn Canonist'],
    politicsProfile: { willDeal: false, dealPreference: 'let_me_win_later', threatAssessmentBias: 'stax' },
    politicsTemplates: [],
  },
  {
    id: 'etali',
    commanderNames: ['Etali, Primal Conqueror'],
    colors: ['R', 'G'],
    metaSharePercent: 2.87,
    speedProfile: 'turbo',
    threatThreshold: 0.40,
    counterPackage: [],
    removalPackage: ['Blasphemous Act', 'Chaos Warp'],
    staxPieces: [],
    politicsProfile: { willDeal: false, dealPreference: 'let_me_win_later', threatAssessmentBias: 'aggro' },
    politicsTemplates: [],
  },
  {
    id: 'thrasios_tymna',
    commanderNames: ['Thrasios, Triton Hero', 'Tymna the Weaver'],
    colors: ['W', 'U', 'B', 'G'],
    metaSharePercent: 2.72,
    speedProfile: 'midrange',
    threatThreshold: 0.90,
    counterPackage: ['Force of Will', 'Mana Drain', 'Fierce Guardianship', 'Pact of Negation', 'Counterspell', 'Swan Song', 'Flusterstorm', 'Deflecting Swat'],
    removalPackage: ['Swords to Plowshares', 'Toxic Deluge', 'Path to Exile'],
    staxPieces: [],
    politicsProfile: { willDeal: true, dealPreference: 'stop_the_leader', threatAssessmentBias: 'combo' },
    politicsTemplates: [
      "I have the counter, but I'd rather make a deal.",
      "Pass — for now. Don't make me regret it.",
    ],
  },
  {
    id: 'ral',
    commanderNames: ['Ral, Monsoon Mage'],
    colors: ['U', 'R'],
    metaSharePercent: 2.06,
    speedProfile: 'turbo',
    threatThreshold: 0.55,
    counterPackage: ['Force of Will', 'Pact of Negation', 'Swan Song', 'Pyroblast'],
    removalPackage: ['Lightning Bolt', 'Chaos Warp'],
    staxPieces: [],
    politicsProfile: { willDeal: false, dealPreference: 'let_me_win_later', threatAssessmentBias: 'combo' },
    politicsTemplates: [],
  },
]

export const ARCHETYPES_BY_ID: Record<string, OpponentArchetype> = Object.fromEntries(
  ARCHETYPES.map(a => [a.id, a])
)

// Key wizard names used in removal heuristic
export const KEY_WIZARDS = new Set([
  'Spellseeker',
  'Scholar of the Ages',
  'Naru Meha, Master Wizard',
  'Dualcaster Mage',
  'Wanderwine Prophets',
])
