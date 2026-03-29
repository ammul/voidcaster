import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../src/stores/gameStore'
import { useInallaToken } from '../../src/composables/useInallaToken'
import type { GameCard } from '../../src/types'

function makeCard(overrides: Partial<GameCard> = {}): GameCard {
  return {
    instanceId: 'test-id-' + Math.random(),
    name: 'Spellseeker',
    scryfallData: {
      id: 'scryfall-x',
      name: 'Spellseeker',
      type_line: 'Creature — Human Wizard',
      artist: 'Test Artist',
    },
    artCropUrl: null,
    normalImageUrl: null,
    isLoading: false,
    isToken: false,
    tapped: false,
    zone: 'battlefield',
    position: { x: 0, y: 0 },
    markedForExile: false,
    highlightedInTutorial: false,
    ...overrides,
  }
}

function addInalla(game: ReturnType<typeof useGameStore>) {
  const inalla = game.createCard('Inalla, Archmage Ritualist', 'command')
  game.addCardToZone(inalla, 'command')
}

describe('useInallaToken', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('entering a nontoken wizard spawns an Inalla ETB trigger card on the battlefield', () => {
    const game = useGameStore()
    addInalla(game)
    const { checkInallaTrigger } = useInallaToken()
    const card = makeCard({ isToken: false })
    game.addCardToZone(card, 'battlefield')

    checkInallaTrigger(card)

    const trigger = game.battlefield.find(c => c.isEtbTrigger && c.pendingInallaTrigger)
    expect(trigger).toBeDefined()
    expect(trigger?.pendingInallaTrigger?.wizardName).toBe('Spellseeker')
  })

  it('entering a token does NOT spawn Inalla trigger', () => {
    const game = useGameStore()
    addInalla(game)
    const { checkInallaTrigger } = useInallaToken()
    const card = makeCard({ isToken: true })
    checkInallaTrigger(card)
    expect(game.battlefield.filter(c => c.isEtbTrigger).length).toBe(0)
  })

  it('non-wizard card does NOT spawn Inalla trigger', () => {
    const game = useGameStore()
    addInalla(game)
    const { checkInallaTrigger } = useInallaToken()
    const card = makeCard({
      name: 'Dark Ritual',
      scryfallData: {
        id: 'dark-ritual',
        name: 'Dark Ritual',
        type_line: 'Instant',
        artist: 'Test Artist',
      },
    })
    checkInallaTrigger(card)
    expect(game.battlefield.filter(c => c.isEtbTrigger).length).toBe(0)
  })

  it('declining the trigger removes ETB trigger card without creating a token', () => {
    const game = useGameStore()
    addInalla(game)
    const { checkInallaTrigger, resolveInallaTrigger } = useInallaToken()
    const card = makeCard()
    game.addCardToZone(card, 'battlefield')
    checkInallaTrigger(card)

    const trigger = game.battlefield.find(c => c.isEtbTrigger && c.pendingInallaTrigger)
    expect(trigger).toBeDefined()
    resolveInallaTrigger(trigger!.instanceId, false)

    expect(game.battlefield.filter(c => c.isEtbTrigger).length).toBe(0)
    expect(game.battlefield.filter(c => c.isToken).length).toBe(0)
  })

  it('paying {1} creates a token copy on the battlefield', () => {
    const game = useGameStore()
    addInalla(game)
    game.adjustMana('C', 5)
    const { checkInallaTrigger, resolveInallaTrigger } = useInallaToken()
    const card = makeCard()
    game.addCardToZone(card, 'battlefield')
    checkInallaTrigger(card)

    const trigger = game.battlefield.find(c => c.isEtbTrigger && c.pendingInallaTrigger)
    resolveInallaTrigger(trigger!.instanceId, true)

    const tokens = game.battlefield.filter(c => c.isToken)
    expect(tokens.length).toBe(1)
    expect(game.battlefield.filter(c => c.isEtbTrigger).length).toBe(0)
  })

  it('token is marked for exile at end of turn', () => {
    const game = useGameStore()
    addInalla(game)
    game.adjustMana('C', 5)
    const { checkInallaTrigger, resolveInallaTrigger } = useInallaToken()
    const card = makeCard()
    game.addCardToZone(card, 'battlefield')
    checkInallaTrigger(card)

    const trigger = game.battlefield.find(c => c.isEtbTrigger && c.pendingInallaTrigger)
    resolveInallaTrigger(trigger!.instanceId, true)

    const token = game.battlefield.find(c => c.isToken)
    expect(token?.markedForExile).toBe(true)
  })
})
