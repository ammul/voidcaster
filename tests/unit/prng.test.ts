import { describe, it, expect } from 'vitest'
import { mulberry32 } from '../../src/interaction/prng'

describe('mulberry32 PRNG', () => {
  it('produces values in [0, 1)', () => {
    const rng = mulberry32(42)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('same seed produces identical 1000-value sequence', () => {
    const a = mulberry32(0xdeadbeef)
    const b = mulberry32(0xdeadbeef)
    for (let i = 0; i < 1000; i++) {
      expect(a()).toBe(b())
    }
  })

  it('different seeds produce different sequences', () => {
    const a = mulberry32(1)
    const b = mulberry32(2)
    let same = 0
    for (let i = 0; i < 50; i++) {
      if (a() === b()) same++
    }
    expect(same).toBeLessThan(50) // overwhelmingly unlikely to be identical
  })

  it('seed 0 still produces valid output', () => {
    const rng = mulberry32(0)
    const v = rng()
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThan(1)
  })
})
