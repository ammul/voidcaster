import type { CardDefinition } from '../types'
import { parseManaCost } from '../manaCostParser'

// Alias for brevity — called once at module init, not at runtime
const mc = parseManaCost

// ── Commander ────────────────────────────────────────────────────────────────

const INALLA: CardDefinition = {
  name: 'Inalla, Archmage Ritualist',
  superTypes: ['Legendary'],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{3}{U}{B}{R}'),
  castingTiming: 'sorcery',
  abilities: [
    {
      kind: 'triggered',
      trigger: 'wizard_etb',
      isEminence: true,
      requiresZone: 'command',
      effects: [{ kind: 'create_token', constraint: 'haste copy of that wizard, exile at end of turn' }],
    },
    {
      kind: 'activated',
      activationCost: mc('{1}'),
      activationAdditionalCosts: [{ kind: 'tap_self' }],
      effects: [{ kind: 'other', constraint: 'tap target wizard, it deals damage equal to its power to target player' }],
    },
  ],
}

// ── Lands ────────────────────────────────────────────────────────────────────

function land(name: string, subTypes: string[] = []): CardDefinition {
  return {
    name,
    superTypes: [],
    types: ['Land'],
    subTypes,
    manaCost: null,
    castingTiming: 'special',
    abilities: [{ kind: 'activated', effects: [{ kind: 'add_mana' }] }],
  }
}

const LANDS: CardDefinition[] = [
  land('Ancient Tomb'),
  land('Arid Mesa'),
  land('Badlands', ['Swamp', 'Mountain']),
  land('Blood Crypt', ['Swamp', 'Mountain']),
  land('Bloodstained Mire'),
  land('City of Brass'),
  land('City of Traitors'),
  land('Command Tower'),
  land('Flooded Strand'),
  land('Forbidden Orchard'),
  land('Gemstone Caverns'),
  land('Mana Confluence'),
  land('Marsh Flats'),
  land('Misty Rainforest'),
  land('Otawara, Soaring City'),
  land('Peat Bog'),
  land('Phyrexian Tower'),
  land('Polluted Delta'),
  land('Scalding Tarn'),
  land('Starting Town'),
  land('Tarnished Citadel'),
  land('Undercity Sewers'),
  land('Underground Sea', ['Island', 'Swamp']),
  land('Verdant Catacombs'),
  land('Volcanic Island', ['Island', 'Mountain']),
  land('Watery Grave', ['Island', 'Swamp']),
  land('Wooded Foothills'),
]

// ── Mana Acceleration ────────────────────────────────────────────────────────

const ARCANE_SIGNET: CardDefinition = {
  name: 'Arcane Signet',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{2}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', activationCost: mc('{0}'), activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'add_mana' }] }],
}

const CHROME_MOX: CardDefinition = {
  name: 'Chrome Mox',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'other' } as never],
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'add_mana', constraint: 'one mana of imprinted card\'s colors' }] }],
}

const GRIM_MONOLITH: CardDefinition = {
  name: 'Grim Monolith',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{2}'),
  castingTiming: 'sorcery',
  abilities: [
    { kind: 'activated', activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'add_mana', constraint: 'CCC' }] },
    { kind: 'activated', activationCost: mc('{4}'), effects: [{ kind: 'other', constraint: 'untap Grim Monolith' }] },
  ],
}

const JEWELED_AMULET: CardDefinition = {
  name: 'Jeweled Amulet',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', effects: [{ kind: 'add_mana', constraint: 'store or spend charge counters' }] }],
}

const LIONS_EYE_DIAMOND: CardDefinition = {
  name: "Lion's Eye Diamond",
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'discard_hand' }],
  abilities: [
    {
      kind: 'activated',
      activationAdditionalCosts: [{ kind: 'sacrifice_self' }, { kind: 'discard_hand' }],
      effects: [{ kind: 'add_mana', constraint: 'BBB, RRR, or UUU' }],
    },
  ],
  comboRole: { lines: ['breach'], role: 'engine' },
}

const LOTUS_PETAL: CardDefinition = {
  name: 'Lotus Petal',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'sacrifice_self' }], effects: [{ kind: 'add_mana', constraint: 'any color' }] }],
}

const MANA_VAULT: CardDefinition = {
  name: 'Mana Vault',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{1}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'add_mana', constraint: 'CCC' }] }],
}

const MOX_DIAMOND: CardDefinition = {
  name: 'Mox Diamond',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'add_mana', constraint: 'any color' }] }],
}

const SIMIAN_SPIRIT_GUIDE: CardDefinition = {
  name: 'Simian Spirit Guide',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Ape', 'Spirit'],
  manaCost: mc('{2}{R}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'exile_from_graveyard' }],
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'exile_from_graveyard' }], effects: [{ kind: 'add_mana', constraint: 'R' }] }],
}

const SOL_RING: CardDefinition = {
  name: 'Sol Ring',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{1}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'add_mana', constraint: 'CC' }] }],
}

// ── Rituals ──────────────────────────────────────────────────────────────────

const CABAL_RITUAL: CardDefinition = {
  name: 'Cabal Ritual',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'BBB (or BBBBB with threshold)' }] }],
}

const DARK_RITUAL: CardDefinition = {
  name: 'Dark Ritual',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'BBB' }] }],
}

const RAIN_OF_FILTH: CardDefinition = {
  name: 'Rain of Filth',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  additionalCosts: [{ kind: 'sacrifice_permanent', count: 0 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'B for each land sacrificed' }] }],
}

const RITE_OF_FLAME: CardDefinition = {
  name: 'Rite of Flame',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{R}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'RR (+ R per Rite of Flame in graveyard)' }] }],
}

// ── Tutors ───────────────────────────────────────────────────────────────────

const BESEECH_THE_MIRROR: CardDefinition = {
  name: 'Beseech the Mirror',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{2}{B}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'any card; if bargained, cast it for free' }] }],
}

const DEMONIC_TUTOR: CardDefinition = {
  name: 'Demonic Tutor',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'any card' }] }],
}

const ENTOMB: CardDefinition = {
  name: 'Entomb',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'put_in_graveyard', constraint: 'any card from library' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

const GAMBLE: CardDefinition = {
  name: 'Gamble',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{R}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'any card, then discard at random' }] }],
}

const IMPERIAL_SEAL: CardDefinition = {
  name: 'Imperial Seal',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'any card, put on top of library' }] }],
}

const INTUITION: CardDefinition = {
  name: 'Intuition',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{2}{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'search for 3 cards, opponent chooses 1 for hand, rest go to graveyard' }] }],
}

const LIM_DULS_VAULT: CardDefinition = {
  name: "Lim-Dûl's Vault",
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'arrange top 5, repeat paying 1 life until found' }] }],
}

const MYSTICAL_TUTOR: CardDefinition = {
  name: 'Mystical Tutor',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'instant or sorcery to top of library' }] }],
}

const UNMARKED_GRAVE: CardDefinition = {
  name: 'Unmarked Grave',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'put_in_graveyard', constraint: 'nonlegendary card from library' }] }],
}

const VAMPIRIC_TUTOR: CardDefinition = {
  name: 'Vampiric Tutor',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  additionalCosts: [{ kind: 'pay_life', lifeAmount: 2 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'tutor_to_hand', constraint: 'any card to top of library' }] }],
}

const WISHCLAW_TALISMAN: CardDefinition = {
  name: 'Wishclaw Talisman',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'activated', effects: [{ kind: 'tutor_to_hand', constraint: 'any card, then give talisman to opponent' }] }],
}

// ── Draw / Card Advantage ────────────────────────────────────────────────────

const FAITHLESS_LOOTING: CardDefinition = {
  name: 'Faithless Looting',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{R}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'draw', count: 2 }, { kind: 'other', constraint: 'discard 2' }] }],
}

const GHOSTLY_PILFERER: CardDefinition = {
  name: 'Ghostly Pilferer',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Spirit'],
  manaCost: mc('{2}{U}'),
  castingTiming: 'sorcery',
  abilities: [
    { kind: 'triggered', trigger: 'discard', effects: [{ kind: 'draw', count: 1 }] },
    { kind: 'activated', activationCost: mc('{3}{U}'), activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'draw', count: 1 }] },
  ],
}

const MYSTIC_REMORA: CardDefinition = {
  name: 'Mystic Remora',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'triggered', trigger: 'spell_cast', effects: [{ kind: 'draw', count: 1 }] }],
}

const NECROPOTENCE: CardDefinition = {
  name: 'Necropotence',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{B}{B}{B}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'pay_life', lifeAmount: 1 }],
  abilities: [{ kind: 'activated', activationAdditionalCosts: [{ kind: 'pay_life', lifeAmount: 1 }], effects: [{ kind: 'draw', count: 1 }] }],
}

const RHYSTIC_STUDY: CardDefinition = {
  name: 'Rhystic Study',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{2}{U}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'triggered', trigger: 'spell_cast', effects: [{ kind: 'draw', count: 1, constraint: 'if opponent doesn\'t pay {1}' }] }],
}

// ── Interaction / Protection ─────────────────────────────────────────────────

const AN_OFFER_YOU_CANT_REFUSE: CardDefinition = {
  name: "An Offer You Can't Refuse",
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'counter_spell', constraint: 'noncreature spell; opponent gets 2 treasures' }] }],
}

const CHAIN_OF_VAPOR: CardDefinition = {
  name: 'Chain of Vapor',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'bounce', constraint: 'target nonland permanent' }] }],
}

const DAZE: CardDefinition = {
  name: 'Daze',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{1}{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'counter_spell', constraint: 'unless opponent pays 1; can bounce Island instead of paying mana cost' }] }],
}

const FLUSTERSTORM: CardDefinition = {
  name: 'Flusterstorm',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'instant',
  abilities: [
    { kind: 'static', effects: [{ kind: 'counter_spell', constraint: 'instant or sorcery unless its controller pays {1}' }] },
    { kind: 'static', effects: [{ kind: 'other', constraint: 'storm — copies for each spell cast before it this turn' }] },
  ],
}

const FORCE_OF_WILL: CardDefinition = {
  name: 'Force of Will',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{3}{U}{U}'),
  castingTiming: 'instant',
  additionalCosts: [{ kind: 'pay_life', lifeAmount: 1 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'counter_spell', constraint: 'any spell; can cast by pitching blue card instead of mana cost' }] }],
}

const MENTAL_MISSTEP: CardDefinition = {
  name: 'Mental Misstep',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'counter_spell', constraint: 'spell with CMC 1; can cast by paying 2 life instead of mana cost' }] }],
}

const PACT_OF_NEGATION: CardDefinition = {
  name: 'Pact of Negation',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'counter_spell', constraint: 'any spell; pay {3}{U}{U} at next upkeep or lose the game' }] }],
}

const SLAUGHTER_PACT: CardDefinition = {
  name: 'Slaughter Pact',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{0}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'deal_damage', constraint: 'destroy target nonblack creature; pay {2}{B} at next upkeep' }] }],
}

// ── Reanimation ──────────────────────────────────────────────────────────────

const ANIMATE_DEAD: CardDefinition = {
  name: 'Animate Dead',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: ['Aura'],
  manaCost: mc('{1}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'target creature in any graveyard, -1/-0' }] }],
}

const CORPSE_DANCE: CardDefinition = {
  name: 'Corpse Dance',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{2}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'top creature of your graveyard with haste, exile at cleanup' }] }],
}

const DANCE_OF_THE_DEAD: CardDefinition = {
  name: 'Dance of the Dead',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: ['Aura'],
  manaCost: mc('{1}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'target creature in any graveyard, -1/-0' }] }],
}

const NECROMANCY: CardDefinition = {
  name: 'Necromancy',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{2}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'target creature in any graveyard' }] }],
}

const PERSIST: CardDefinition = {
  name: 'Persist',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'target creature from your graveyard, exile at cleanup' }] }],
}

const REANIMATE: CardDefinition = {
  name: 'Reanimate',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'pay_life', lifeAmount: 0 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'any creature in any graveyard; pay life equal to its CMC' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

const SHALLOW_GRAVE: CardDefinition = {
  name: 'Shallow Grave',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'top creature of your graveyard with haste, exile at cleanup' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

const UNEARTH: CardDefinition = {
  name: 'Unearth',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'target creature with CMC 3 or less from your graveyard, haste, exile at cleanup' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

// ── Creatures / Wizards ──────────────────────────────────────────────────────

const BLOODLINE_NECROMANCER: CardDefinition = {
  name: 'Bloodline Necromancer',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Vampire', 'Wizard'],
  manaCost: mc('{4}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'triggered', trigger: 'etb', effects: [{ kind: 'reanimate', constraint: 'target Vampire or Wizard from your graveyard' }] }],
}

const FATESTITCHER: CardDefinition = {
  name: 'Fatestitcher',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Zombie', 'Wizard'],
  manaCost: mc('{3}{U}'),
  castingTiming: 'sorcery',
  abilities: [
    { kind: 'activated', activationAdditionalCosts: [{ kind: 'tap_self' }], effects: [{ kind: 'other', constraint: 'tap or untap target permanent' }] },
    { kind: 'activated', activationAdditionalCosts: [{ kind: 'exile_from_graveyard' }], effects: [{ kind: 'other', constraint: 'unearth {U}' }] },
  ],
}

const HOARDING_BROODLORD: CardDefinition = {
  name: 'Hoarding Broodlord',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Dragon'],
  manaCost: mc('{5}{B}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'triggered', trigger: 'etb', effects: [{ kind: 'tutor_to_hand', constraint: 'any card, put in exile face down (can cast it)' }] }],
}

const KEFKA: CardDefinition = {
  name: 'Kefka, Court Mage',
  superTypes: ['Legendary'],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{1}{U}{R}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'triggered', trigger: 'etb', effects: [{ kind: 'other', constraint: 'choose mode — copy spell on stack, or copy target instant/sorcery in graveyard' }] }],
}

const OVEREAGER_APPRENTICE: CardDefinition = {
  name: 'Overeager Apprentice',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{2}{B}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'discard_hand' }],
  abilities: [
    { kind: 'activated', activationAdditionalCosts: [{ kind: 'sacrifice_self' }, { kind: 'discard_hand' }], effects: [{ kind: 'add_mana', constraint: 'BBB' }] },
  ],
}

const RAGAVAN: CardDefinition = {
  name: 'Ragavan, Nimble Pilferer',
  superTypes: ['Legendary'],
  types: ['Creature'],
  subTypes: ['Monkey', 'Pirate'],
  manaCost: mc('{R}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'triggered', trigger: 'etb', effects: [{ kind: 'other', constraint: 'on combat damage: exile top card of defending player\'s library, create Treasure' }] }],
}

const RUTHLESS_TECHNOMANCER: CardDefinition = {
  name: 'Ruthless Technomancer',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{3}{B}'),
  castingTiming: 'sorcery',
  abilities: [
    { kind: 'triggered', trigger: 'etb', effects: [{ kind: 'other', constraint: 'create X Treasure tokens where X is difference in artifact count' }] },
    { kind: 'activated', activationAdditionalCosts: [{ kind: 'sacrifice_permanent', count: 2 }], effects: [{ kind: 'reanimate', constraint: 'target creature from your graveyard' }] },
  ],
}

const SCHOLAR_OF_THE_AGES: CardDefinition = {
  name: 'Scholar of the Ages',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{5}{U}{U}'),
  castingTiming: 'sorcery',
  abilities: [
    {
      kind: 'triggered',
      trigger: 'etb',
      effects: [{ kind: 'return_to_hand', constraint: 'up to two target instants and/or sorceries from your graveyard', count: 2 }],
    },
  ],
  comboRole: { lines: ['spellseeker'], role: 'engine' },
  countersTo: {
    'Torpor Orb': 'Prevents ETB — Scholar cannot return spells, killing the loop',
  },
}

const SPELLSEEKER: CardDefinition = {
  name: 'Spellseeker',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{2}{U}'),
  castingTiming: 'sorcery',
  abilities: [
    {
      kind: 'triggered',
      trigger: 'etb',
      effects: [{ kind: 'tutor_to_hand', constraint: 'instant or sorcery with CMC 2 or less' }],
    },
  ],
  comboRole: { lines: ['spellseeker'], role: 'engine' },
  countersTo: {
    'Torpor Orb': 'Prevents ETB — Spellseeker cannot tutor, killing the chain',
    'Rule of Law': 'Limits to one spell per turn — entire Spellseeker chain is impossible',
    'Deafening Silence': 'Stops noncreature spells after first — kills the Culling the Weak window',
    'Drannith Magistrate': 'Stops casting spells from anywhere but hand — kills Unearth/Finale lines',
  },
}

const VEDALKEN_AETHERMAGE: CardDefinition = {
  name: 'Vedalken Aethermage',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Vedalken', 'Wizard'],
  manaCost: mc('{1}{U}'),
  castingTiming: 'sorcery',
  abilities: [
    { kind: 'triggered', trigger: 'etb', effects: [{ kind: 'other', constraint: 'flash — can be cast at instant speed' }] },
    { kind: 'activated', activationCost: mc('{2}{U}'), effects: [{ kind: 'tutor_to_hand', constraint: 'Wizard card to top of library' }] },
  ],
}

// ── Combo Pieces & Utility ───────────────────────────────────────────────────

const BRAIN_FREEZE: CardDefinition = {
  name: 'Brain Freeze',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{1}{U}'),
  castingTiming: 'instant',
  abilities: [
    { kind: 'static', effects: [{ kind: 'mill_self', constraint: 'target player mills 3 (storm copies each mill 3 more)' }] },
  ],
  comboRole: { lines: ['breach'], role: 'engine' },
  countersTo: {
    "Grafdigger's Cage": 'Prevents casting spells from graveyard — stops Breach escape loop',
  },
}

const BURIED_ALIVE: CardDefinition = {
  name: 'Buried Alive',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{2}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'put_in_graveyard', constraint: 'up to three creature cards from library' }] }],
}

const BURNT_OFFERING: CardDefinition = {
  name: 'Burnt Offering',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  additionalCosts: [{ kind: 'sacrifice_creature', count: 1 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'B or R for each mana in sacrificed creature\'s CMC' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

const CULLING_THE_WEAK: CardDefinition = {
  name: 'Culling the Weak',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  additionalCosts: [{ kind: 'sacrifice_creature', count: 1 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'BBBB' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

const DEMONIC_CONSULTATION: CardDefinition = {
  name: 'Demonic Consultation',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'exile_library', constraint: 'name a card; exile cards from top until found, exile all if not found' }] }],
  comboRole: { lines: ['consultation'], role: 'engine' },
}

const ESSENCE_FLUX: CardDefinition = {
  name: 'Essence Flux',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{U}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'bounce', constraint: 'flicker target creature you control (return at end of step)' }] }],
}

const FINAL_FORTUNE: CardDefinition = {
  name: 'Final Fortune',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{R}{R}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'take an extra turn; lose the game at end of that turn' }] }],
}

const FINALE_OF_PROMISE: CardDefinition = {
  name: 'Finale of Promise',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{X}{R}{R}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'cast_from_graveyard', constraint: 'cast instant CMC<=X and sorcery CMC<=X from graveyard for free (if X>=10, return all instants/sorceries)' }] }],
  comboRole: { lines: ['spellseeker'], role: 'enabler' },
}

const GRIEF: CardDefinition = {
  name: 'Grief',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Elemental', 'Nightmare'],
  manaCost: mc('{3}{B}'),
  castingTiming: 'sorcery',
  abilities: [
    { kind: 'triggered', trigger: 'etb', effects: [{ kind: 'other', constraint: 'target opponent reveals hand, you choose nonland card, they discard it' }] },
    { kind: 'static', effects: [{ kind: 'other', constraint: 'evoke by exiling a black card (cast for free, sacrifice at resolution)' }] },
  ],
}

const LIVELY_DIRGE: CardDefinition = {
  name: 'Lively Dirge',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{2}{B}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'reanimate', constraint: 'create token copies of any number of creatures in your graveyard' }] }],
}

const SACRIFICE_SPELL: CardDefinition = {
  name: 'Sacrifice',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{B}'),
  castingTiming: 'instant',
  additionalCosts: [{ kind: 'sacrifice_creature', count: 1 }],
  abilities: [{ kind: 'static', effects: [{ kind: 'add_mana', constraint: 'B for each sacrificed creature\'s CMC; draw a card' }] }],
}

const SAW_IN_HALF: CardDefinition = {
  name: 'Saw in Half',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{2}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'destroy target creature; owner creates two token copies with each stat halved' }] }],
}

const STEP_THROUGH: CardDefinition = {
  name: 'Step Through',
  superTypes: [],
  types: ['Sorcery'],
  subTypes: [],
  manaCost: mc('{3}{U}'),
  castingTiming: 'sorcery',
  additionalCosts: [{ kind: 'sacrifice_creature', count: 1 }],
  abilities: [
    { kind: 'static', effects: [{ kind: 'other', constraint: 'sacrifice a Wizard; search for two Wizard cards' }] },
    { kind: 'activated', activationAdditionalCosts: [{ kind: 'exile_from_graveyard' }], effects: [{ kind: 'tutor_to_hand', constraint: 'Wizard card' }] },
  ],
}

const TAINTED_PACT: CardDefinition = {
  name: 'Tainted Pact',
  superTypes: [],
  types: ['Instant'],
  subTypes: [],
  manaCost: mc('{1}{B}'),
  castingTiming: 'instant',
  abilities: [{ kind: 'static', effects: [{ kind: 'exile_library', constraint: 'exile cards from top until you find one to keep or exile two of the same name' }] }],
  comboRole: { lines: ['consultation'], role: 'engine' },
}

const THASSOS_ORACLE: CardDefinition = {
  name: "Thassa's Oracle",
  superTypes: [],
  types: ['Creature'],
  subTypes: ['God', 'Wizard'],
  manaCost: mc('{U}{U}'),
  castingTiming: 'sorcery',
  abilities: [
    {
      kind: 'triggered',
      trigger: 'etb',
      effects: [
        { kind: 'win_game', constraint: 'if devotion to blue >= cards in library, win; otherwise scry equal to devotion' },
      ],
    },
  ],
  comboRole: { lines: ['spellseeker', 'breach', 'consultation'], role: 'payoff' },
  countersTo: {
    'Torpor Orb': 'Prevents ETB — Oracle resolves as a 1/3 with no effect, cannot win',
    "Teferi, Time Raveler": 'Prevents casting at instant speed — cannot respond to Consultation with Oracle',
  },
}

const UNDERWORLD_BREACH: CardDefinition = {
  name: 'Underworld Breach',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{1}{R}'),
  castingTiming: 'sorcery',
  abilities: [
    {
      kind: 'static',
      effects: [
        { kind: 'cast_from_graveyard', constraint: 'each instant/sorcery in your graveyard has escape (exile 3 cards)' },
      ],
    },
    {
      kind: 'triggered',
      trigger: 'phase_end',
      effects: [{ kind: 'other', constraint: 'sacrifice Underworld Breach at beginning of your end step' }],
    },
  ],
  comboRole: { lines: ['breach'], role: 'engine' },
  countersTo: {
    "Grafdigger's Cage": "Prevents casting spells from graveyard — shuts down escape entirely",
    'Rest in Peace': 'Exiles graveyard continuously — no escape fodder for the loop',
    'Leyline of the Void': 'Cards go to exile instead of graveyard — loop impossible',
  },
}

// ── Opponent Hate Cards (not in Inalla deck, but in archetypes) ──────────────
// Defined here so registry lookups in getHateCards work properly.

const GRAFDIGGERS_CAGE: CardDefinition = {
  name: "Grafdigger's Cage",
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{1}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'creatures can\'t enter the battlefield from graveyards or libraries; players can\'t cast spells from graveyards or libraries' }] }],
  comboRole: { lines: ['breach', 'spellseeker', 'consultation'], role: 'hate' },
}

const REST_IN_PEACE: CardDefinition = {
  name: 'Rest in Peace',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{1}{W}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'replacement', effects: [{ kind: 'other', constraint: 'cards that would go to any graveyard are exiled instead' }] }],
  comboRole: { lines: ['breach', 'spellseeker'], role: 'hate' },
}

const TORPOR_ORB: CardDefinition = {
  name: 'Torpor Orb',
  superTypes: [],
  types: ['Artifact'],
  subTypes: [],
  manaCost: mc('{2}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'creatures don\'t trigger when they enter the battlefield' }] }],
  comboRole: { lines: ['spellseeker', 'consultation'], role: 'hate' },
}

const DRANNITH_MAGISTRATE: CardDefinition = {
  name: 'Drannith Magistrate',
  superTypes: [],
  types: ['Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{1}{W}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'opponents can\'t cast spells from anywhere other than their hand' }] }],
  comboRole: { lines: ['spellseeker', 'breach'], role: 'hate' },
}

const RULE_OF_LAW: CardDefinition = {
  name: 'Rule of Law',
  superTypes: [],
  types: ['Enchantment'],
  subTypes: [],
  manaCost: mc('{2}{W}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'each player can cast only one spell per turn' }] }],
  comboRole: { lines: ['spellseeker', 'breach'], role: 'hate' },
}

const ETHERSWORN_CANONIST: CardDefinition = {
  name: 'Ethersworn Canonist',
  superTypes: [],
  types: ['Artifact', 'Creature'],
  subTypes: ['Human', 'Wizard'],
  manaCost: mc('{1}{W}'),
  castingTiming: 'sorcery',
  abilities: [{ kind: 'static', effects: [{ kind: 'other', constraint: 'each player who has cast a nonartifact spell this turn can\'t cast additional nonartifact spells' }] }],
  comboRole: { lines: ['spellseeker', 'breach'], role: 'hate' },
}

// ── Export ───────────────────────────────────────────────────────────────────

export const INALLA_DECK_DEFINITIONS: CardDefinition[] = [
  INALLA,
  ...LANDS,
  // Mana acceleration
  ARCANE_SIGNET, CHROME_MOX, GRIM_MONOLITH, JEWELED_AMULET, LIONS_EYE_DIAMOND,
  LOTUS_PETAL, MANA_VAULT, MOX_DIAMOND, SIMIAN_SPIRIT_GUIDE, SOL_RING,
  // Rituals
  CABAL_RITUAL, DARK_RITUAL, RAIN_OF_FILTH, RITE_OF_FLAME,
  // Tutors
  BESEECH_THE_MIRROR, DEMONIC_TUTOR, ENTOMB, GAMBLE, IMPERIAL_SEAL,
  INTUITION, LIM_DULS_VAULT, MYSTICAL_TUTOR, UNMARKED_GRAVE, VAMPIRIC_TUTOR, WISHCLAW_TALISMAN,
  // Draw
  FAITHLESS_LOOTING, GHOSTLY_PILFERER, MYSTIC_REMORA, NECROPOTENCE, RHYSTIC_STUDY,
  // Interaction
  AN_OFFER_YOU_CANT_REFUSE, CHAIN_OF_VAPOR, DAZE, FLUSTERSTORM, FORCE_OF_WILL,
  MENTAL_MISSTEP, PACT_OF_NEGATION, SLAUGHTER_PACT,
  // Reanimation
  ANIMATE_DEAD, CORPSE_DANCE, DANCE_OF_THE_DEAD, NECROMANCY, PERSIST,
  REANIMATE, SHALLOW_GRAVE, UNEARTH,
  // Creatures
  BLOODLINE_NECROMANCER, FATESTITCHER, HOARDING_BROODLORD, KEFKA,
  OVEREAGER_APPRENTICE, RAGAVAN, RUTHLESS_TECHNOMANCER, SCHOLAR_OF_THE_AGES,
  SPELLSEEKER, VEDALKEN_AETHERMAGE,
  // Combo pieces & utility
  BRAIN_FREEZE, BURIED_ALIVE, BURNT_OFFERING, CULLING_THE_WEAK, DEMONIC_CONSULTATION,
  ESSENCE_FLUX, FINAL_FORTUNE, FINALE_OF_PROMISE, GRIEF, LIVELY_DIRGE,
  SACRIFICE_SPELL, SAW_IN_HALF, STEP_THROUGH, TAINTED_PACT, THASSOS_ORACLE,
  UNDERWORLD_BREACH,
  // Opponent hate cards (for getHateCards registry lookups)
  GRAFDIGGERS_CAGE, REST_IN_PEACE, TORPOR_ORB, DRANNITH_MAGISTRATE, RULE_OF_LAW,
  ETHERSWORN_CANONIST,
]
