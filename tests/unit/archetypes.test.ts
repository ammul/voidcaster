import { describe, it, expect } from 'vitest'
import { ARCHETYPES, ARCHETYPES_BY_ID } from '../../src/data/archetypes'

describe('archetypes data', () => {
  it('exports exactly 8 archetypes', () => {
    expect(ARCHETYPES).toHaveLength(8)
  })

  it('all archetypes have non-empty commanderNames', () => {
    for (const a of ARCHETYPES) {
      expect(a.commanderNames.length).toBeGreaterThan(0)
      for (const name of a.commanderNames) {
        expect(name.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('threatThreshold in [0.0, 1.0] for all archetypes', () => {
    for (const a of ARCHETYPES) {
      expect(a.threatThreshold).toBeGreaterThanOrEqual(0)
      expect(a.threatThreshold).toBeLessThanOrEqual(1)
    }
  })

  it('no duplicate cards within any single package', () => {
    for (const a of ARCHETYPES) {
      const pkgs = [a.counterPackage, a.removalPackage, a.staxPieces]
      for (const pkg of pkgs) {
        const unique = new Set(pkg)
        expect(unique.size).toBe(pkg.length)
      }
    }
  })

  it('stax-profile archetypes have non-empty staxPieces', () => {
    const staxArchetypes = ARCHETYPES.filter(a => a.speedProfile === 'stax')
    expect(staxArchetypes.length).toBeGreaterThan(0)
    for (const a of staxArchetypes) {
      expect(a.staxPieces.length).toBeGreaterThan(0)
    }
  })

  it('willDeal:true archetypes have non-empty politicsTemplates', () => {
    for (const a of ARCHETYPES) {
      if (a.politicsProfile.willDeal) {
        expect(a.politicsTemplates.length).toBeGreaterThan(0)
      }
    }
  })

  it('all card name strings are non-empty and trimmed', () => {
    for (const a of ARCHETYPES) {
      const allCards = [...a.counterPackage, ...a.removalPackage, ...a.staxPieces]
      for (const name of allCards) {
        expect(name.trim()).toBe(name)
        expect(name.length).toBeGreaterThan(0)
      }
    }
  })

  it('ARCHETYPES_BY_ID keys match id fields', () => {
    for (const a of ARCHETYPES) {
      expect(ARCHETYPES_BY_ID[a.id]).toBe(a)
    }
  })

  it.skipIf(!process.env.RUN_SLOW_TESTS)('(@slow) all package card names resolve on Scryfall', async () => {
    const { fetchFromScryfallOrCache } = await import('../../src/composables/useScryfall')
    const cardNames = new Set<string>()
    for (const a of ARCHETYPES) {
      ;[...a.counterPackage, ...a.removalPackage, ...a.staxPieces].forEach(n => cardNames.add(n))
    }
    for (const name of cardNames) {
      const data = await fetchFromScryfallOrCache(name)
      expect(data).toBeDefined()
      expect(data.name).toBeTruthy()
    }
  }, 120_000)
})
