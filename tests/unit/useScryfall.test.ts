import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCache = {
  match: vi.fn(),
  put: vi.fn(),
}

const mockCaches = {
  open: vi.fn().mockResolvedValue(mockCache),
}

vi.stubGlobal('caches', mockCaches)

describe('useScryfall', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-set open implementation because vi.restoreAllMocks() resets vi.fn() impls
    mockCaches.open.mockResolvedValue(mockCache)
    mockCache.match.mockResolvedValue(null)
    mockCache.put.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns cached data without fetching on cache hit', async () => {
    const cachedCard = {
      id: 'abc',
      name: 'Spellseeker',
      type_line: 'Creature — Human Wizard',
      artist: 'Test Artist',
    }
    mockCache.match.mockResolvedValueOnce({
      json: () => Promise.resolve(cachedCard),
    })

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { fetchFromScryfallOrCache } = await import('../../src/composables/useScryfall')

    const result = await fetchFromScryfallOrCache('Spellseeker')
    expect(result).toEqual(cachedCard)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches from API on cache miss and caches the result', async () => {
    const cardData = {
      id: 'xyz',
      name: 'Spellseeker',
      type_line: 'Creature — Human Wizard',
      artist: 'Test Artist',
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(cardData),
    } as Response)

    const { fetchFromScryfallOrCache } = await import('../../src/composables/useScryfall')
    const result = await fetchFromScryfallOrCache('Spellseeker')

    expect(result).toEqual(cardData)
    expect(mockCache.put).toHaveBeenCalled()
  })

  it('throws on non-OK Scryfall response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const { fetchFromScryfallOrCache } = await import('../../src/composables/useScryfall')
    await expect(fetchFromScryfallOrCache('nonexistent card xyz')).rejects.toThrow()
  })

  it('delay resolves after the given milliseconds', async () => {
    const { delay } = await import('../../src/composables/useScryfall')
    vi.useFakeTimers()
    const p = delay(75)
    vi.advanceTimersByTime(75)
    await expect(p).resolves.toBeUndefined()
    vi.useRealTimers()
  })

  it('useScryfall returns expected functions', async () => {
    const { useScryfall } = await import('../../src/composables/useScryfall')
    const composable = useScryfall()
    expect(typeof composable.enqueue).toBe('function')
    expect(typeof composable.getCardImage).toBe('function')
    expect(typeof composable.getArtCropUrl).toBe('function')
    expect(typeof composable.getNormalUrl).toBe('function')
  })
})
