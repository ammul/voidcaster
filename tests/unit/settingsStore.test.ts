import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSettingsStore } from '../../src/stores/settingsStore'
import { mulberry32 } from '../../src/interaction/prng'

describe('settingsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('seed is generated on store init (non-zero)', () => {
    const settings = useSettingsStore()
    expect(settings.seed).toBeGreaterThan(0)
  })

  it('"Reroll" generates a new seed', () => {
    const settings = useSettingsStore()
    const original = settings.seed
    // Reroll a few times; each should differ (with astronomically high probability)
    let different = false
    for (let i = 0; i < 10; i++) {
      settings.rerollSeed()
      if (settings.seed !== original) { different = true; break }
    }
    expect(different).toBe(true)
  })

  it('same seedHex string → same PRNG sequence', () => {
    const settings = useSettingsStore()
    settings.seedHex = 'deadbeef'
    const seedValue = settings.seed

    const rng1 = mulberry32(seedValue)
    const rng2 = mulberry32(seedValue)
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2())
    }
  })

  it('seedHex is an 8-character hex string', () => {
    const settings = useSettingsStore()
    expect(settings.seedHex).toMatch(/^[0-9a-f]{8}$/)
  })

  it('meta profile change is reflected', () => {
    const settings = useSettingsStore()
    expect(settings.metaProfile).toBe('balanced')
    settings.setMetaProfile('stax')
    expect(settings.metaProfile).toBe('stax')
  })

  it('meta profile change updates auto seats', () => {
    const settings = useSettingsStore()
    settings.setMetaProfile('stax')
    // Stax meta should assign stax archetypes to auto seats
    const id = settings.getEffectiveArchetypeId(0)
    expect(id).toBe('sisay')
  })

  it('pinned seat unchanged after meta profile switch', () => {
    const settings = useSettingsStore()
    settings.setSeatArchetype(1, 'kinnan')
    settings.setMetaProfile('stax')
    expect(settings.seatArchetypes[1]).toBe('kinnan')
    expect(settings.getEffectiveArchetypeId(1)).toBe('kinnan')
  })

  it('reducedMotion defaults to prefers-reduced-motion value', () => {
    // jsdom environment: prefers-reduced-motion typically returns false
    const settings = useSettingsStore()
    expect(typeof settings.reducedMotion).toBe('boolean')
  })

  it('getPrng returns a function that produces [0,1) values', () => {
    const settings = useSettingsStore()
    const rng = settings.getPrng()
    for (let i = 0; i < 50; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})
