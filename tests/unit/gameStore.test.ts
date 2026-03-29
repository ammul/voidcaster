import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '../../src/stores/gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initial state has empty zones and default values', () => {
    const game = useGameStore()
    expect(game.allCards).toHaveLength(0)
    expect(game.lifeTotal).toBe(40)
    expect(game.stormCount).toBe(0)
    expect(game.manaPool).toEqual({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
  })

  it('addCardToZone places Inalla in command zone', () => {
    const game = useGameStore()
    const card = game.createCard('Inalla, Archmage Ritualist', 'command')
    game.addCardToZone(card, 'command')
    expect(game.commandZone).toHaveLength(1)
    expect(game.commandZone[0].name).toBe('Inalla, Archmage Ritualist')
  })

  it('moveCard from hand to battlefield updates both zones', () => {
    const game = useGameStore()
    const card = game.createCard('Spellseeker', 'hand')
    game.addCardToZone(card, 'hand')
    expect(game.hand).toHaveLength(1)

    game.moveCard(card.instanceId, 'battlefield')
    expect(game.hand).toHaveLength(0)
    expect(game.battlefield).toHaveLength(1)
  })

  it('moveCard to graveyard removes card from battlefield', () => {
    const game = useGameStore()
    const card = game.createCard('Spellseeker', 'battlefield')
    game.addCardToZone(card, 'battlefield')

    game.moveCard(card.instanceId, 'graveyard')
    expect(game.battlefield).toHaveLength(0)
    expect(game.graveyard).toHaveLength(1)
  })

  it('tapCard toggles tapped flag', () => {
    const game = useGameStore()
    const card = game.createCard('Island', 'battlefield')
    game.addCardToZone(card, 'battlefield')
    expect(card.tapped).toBe(false)

    game.tapCard(card.instanceId)
    expect(card.tapped).toBe(true)

    game.tapCard(card.instanceId)
    expect(card.tapped).toBe(false)
  })

  it('incrementStorm increases stormCount', () => {
    const game = useGameStore()
    expect(game.stormCount).toBe(0)
    game.incrementStorm()
    game.incrementStorm()
    expect(game.stormCount).toBe(2)
  })

  it('adjustMana changes mana pool correctly', () => {
    const game = useGameStore()
    game.adjustMana('B', 4)
    expect(game.manaPool.B).toBe(4)
    game.adjustMana('B', -2)
    expect(game.manaPool.B).toBe(2)
  })

  it('mana does not go below 0', () => {
    const game = useGameStore()
    game.adjustMana('U', -5)
    expect(game.manaPool.U).toBe(0)
  })

  it('resetState clears all game data', () => {
    const game = useGameStore()
    const card = game.createCard('Spellseeker', 'hand')
    game.addCardToZone(card, 'hand')
    game.adjustMana('B', 3)
    game.adjustLife(-5)
    game.incrementStorm()

    game.resetState()
    expect(game.allCards).toHaveLength(0)
    expect(game.lifeTotal).toBe(40)
    expect(game.stormCount).toBe(0)
    expect(game.manaPool.B).toBe(0)
  })
})
