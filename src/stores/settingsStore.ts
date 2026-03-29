import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mulberry32 } from '../interaction/prng'

export type MetaProfile = 'balanced' | 'turbo' | 'reactive' | 'stax' | 'blind'

export const META_PROFILES: { id: MetaProfile; label: string; description: string }[] = [
  { id: 'balanced',  label: 'Balanced',      description: 'Realistic tournament mix' },
  { id: 'turbo',     label: 'Turbo Meta',     description: 'All opponents race; minimal interaction' },
  { id: 'reactive',  label: 'Reactive Meta',  description: 'Maximum counterspell density' },
  { id: 'stax',      label: 'Stax Meta',      description: 'Hate pieces early; slowed pace' },
  { id: 'blind',     label: 'Blind Bracket',  description: 'No meaningful interaction; everyone races' },
]

// Archetype IDs preferred per meta profile
const META_ARCHETYPE_MAP: Record<MetaProfile, string[]> = {
  balanced:  ['kraum_tymna', 'kinnan', 'rograkh_thrasios'],
  turbo:     ['kinnan', 'etali', 'ral'],
  reactive:  ['thrasios_tymna', 'rograkh_thrasios', 'kraum_tymna'],
  stax:      ['sisay', 'rograkh_silas', 'kraum_tymna'],
  blind:     ['etali', 'etali', 'etali'],
}

function generateSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}

function seedToHex(seed: number): string {
  return (seed >>> 0).toString(16).padStart(8, '0')
}

function hexToSeed(hex: string): number {
  const n = parseInt(hex, 16)
  return isNaN(n) ? 0 : n >>> 0
}

export const useSettingsStore = defineStore('settings', () => {
  // ── Interaction Mode ──────────────────────────────────────────────────────────
  const interactionEnabled = ref(false)
  const showReasoning       = ref(true)
  const politicsEnabled     = ref(true)

  // ── PRNG seed ─────────────────────────────────────────────────────────────────
  const seed        = ref<number>(generateSeed())
  const seedHex     = computed({
    get: () => seedToHex(seed.value),
    set: (hex: string) => { seed.value = hexToSeed(hex) },
  })

  function rerollSeed() {
    seed.value = generateSeed()
  }

  function getPrng() {
    return mulberry32(seed.value)
  }

  // ── Meta Profile ──────────────────────────────────────────────────────────────
  const metaProfile = ref<MetaProfile>('balanced')

  // ── Seat configuration ────────────────────────────────────────────────────────
  // null = "Auto" (follows meta profile)
  const seatArchetypes = ref<[string | null, string | null, string | null]>([null, null, null])

  function getEffectiveArchetypeId(seatIndex: 0 | 1 | 2): string {
    const pinned = seatArchetypes.value[seatIndex]
    if (pinned !== null) return pinned
    const pool = META_ARCHETYPE_MAP[metaProfile.value]
    return pool[seatIndex] ?? pool[0]
  }

  function setSeatArchetype(seatIndex: 0 | 1 | 2, archetypeId: string | null) {
    seatArchetypes.value[seatIndex] = archetypeId
  }

  function setMetaProfile(profile: MetaProfile) {
    metaProfile.value = profile
    // Reset auto seats (pinned seats stay)
    // No reset needed — auto seats re-derive from the map
  }

  // ── Display ───────────────────────────────────────────────────────────────────
  const starBackground = ref(true)
  const cardBloom      = ref(true)
  const reducedMotion  = ref(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  return {
    interactionEnabled,
    showReasoning,
    politicsEnabled,
    seed,
    seedHex,
    rerollSeed,
    getPrng,
    metaProfile,
    seatArchetypes,
    getEffectiveArchetypeId,
    setSeatArchetype,
    setMetaProfile,
    starBackground,
    cardBloom,
    reducedMotion,
    META_ARCHETYPE_MAP,
  }
})
