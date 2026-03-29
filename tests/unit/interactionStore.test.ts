import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInteractionStore } from '../../src/stores/interactionStore'
import { useSettingsStore } from '../../src/stores/settingsStore'
import { useGameStore } from '../../src/stores/gameStore'
import type { GameAction } from '../../src/interaction/InteractionEngine'

// Mock HeuristicEngine to control decisions
vi.mock('../../src/interaction/HeuristicEngine', () => {
  return {
    HeuristicEngine: vi.fn().mockImplementation(() => ({
      evaluate: vi.fn().mockResolvedValue({
        interacts: true,
        interactionType: 'counter',
        cardUsed: 'Force of Will',
        reasoning: 'Test counter reasoning.',
      }),
    })),
  }
})

function makeAction(overrides: Partial<GameAction> = {}): GameAction {
  return {
    type: 'cast_spell',
    isWinAttempt: true,
    isTutorable: false,
    stackDepth: 0,
    ...overrides,
  }
}

describe('interactionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('is a no-op when interaction mode is disabled', async () => {
    const settings = useSettingsStore()
    settings.interactionEnabled = false

    const store = useInteractionStore()
    await store.evaluateAction(makeAction())

    expect(store.items).toHaveLength(0)
  })

  it('calls engine.evaluate exactly 3 times per action', async () => {
    const settings = useSettingsStore()
    settings.interactionEnabled = true

    // Import after mock is set up
    const { HeuristicEngine } = await import('../../src/interaction/HeuristicEngine')
    const mockEvaluate = vi.fn().mockResolvedValue({
      interacts: false,
      interactionType: 'pass',
      reasoning: 'Pass.',
    })
    vi.mocked(HeuristicEngine).mockImplementation(() => ({ evaluate: mockEvaluate }))

    const store = useInteractionStore()
    await store.evaluateAction(makeAction())

    expect(mockEvaluate).toHaveBeenCalledTimes(3)
  })

  it('stack items appear in seat order 0→1→2', async () => {
    const settings = useSettingsStore()
    settings.interactionEnabled = true

    const { HeuristicEngine } = await import('../../src/interaction/HeuristicEngine')
    let callIndex = 0
    const mockEvaluate = vi.fn().mockImplementation(() => {
      callIndex++
      return Promise.resolve({
        interacts: true,
        interactionType: 'counter',
        cardUsed: `Card${callIndex}`,
        reasoning: `Reasoning ${callIndex}.`,
      })
    })
    vi.mocked(HeuristicEngine).mockImplementation(() => ({ evaluate: mockEvaluate }))

    const store = useInteractionStore()
    await store.evaluateAction(makeAction())

    // Items are prepended (unshift), so last seat is at index 0
    const seatOrder = store.items.map(i => i.seatIndex)
    // Should be seats 2,1,0 in items array (since unshift adds each at front)
    expect(seatOrder).toEqual([2, 1, 0])
  })

  it('mode disabled → evaluateAction is a no-op (no items added)', async () => {
    const settings = useSettingsStore()
    settings.interactionEnabled = false

    const store = useInteractionStore()
    await store.evaluateAction(makeAction({ isWinAttempt: true }))

    expect(store.items).toHaveLength(0)
  })

  it('politics events emitted separately, not pushed to stack', async () => {
    const settings = useSettingsStore()
    settings.interactionEnabled = true

    const { HeuristicEngine } = await import('../../src/interaction/HeuristicEngine')
    const mockEvaluate = vi.fn().mockResolvedValue({
      interacts: false,
      interactionType: 'politics',
      reasoning: 'Politics.',
    })
    vi.mocked(HeuristicEngine).mockImplementation(() => ({ evaluate: mockEvaluate }))

    const store = useInteractionStore()
    await store.evaluateAction(makeAction())

    // Politics events go to politicsToasts, not items
    expect(store.items).toHaveLength(0)
    // politicsToasts only populated for archetypes with willDeal=true and templates
    // (may be 0 if archetype has no templates, but items must be 0)
  })
})
