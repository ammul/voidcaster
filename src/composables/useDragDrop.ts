import { useGameStore } from '../stores/gameStore'
import type { Zone } from '../types'

export function useDragDrop() {
  const game = useGameStore()

  function onCardDropped(cardInstanceId: string, targetZone: Zone) {
    const card = game.allCards.find(c => c.instanceId === cardInstanceId)
    if (!card) return
    game.moveCard(cardInstanceId, targetZone)
  }

  return { onCardDropped }
}
