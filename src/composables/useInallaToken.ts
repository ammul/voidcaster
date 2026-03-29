import { useGameStore } from '../stores/gameStore'
import type { GameCard } from '../types'
import { v4 as uuid } from '../utils/uuid'

export function useInallaToken() {
  const game = useGameStore()

  function isWizard(card: GameCard): boolean {
    return card.scryfallData?.type_line?.includes('Wizard') ?? false
  }

  function checkInallaTrigger(card: GameCard) {
    if (card.isToken) return
    if (!isWizard(card)) return
    const inallaPresent = game.allCards.some(
      c => c.zone === 'command' && c.name === 'Inalla, Archmage Ritualist'
    )
    if (!inallaPresent) return

    const px = (card.position?.x ?? 0) + 90
    const py = card.position?.y ?? 30

    game.spawnEtbTrigger(`Inalla — Pay {1}: token ${card.name}`, {
      x: px,
      y: py,
      pendingInallaTrigger: {
        wizardInstanceId: card.instanceId,
        wizardName: card.name,
      },
    })
  }

  function resolveInallaTrigger(triggerInstanceId: string, pay: boolean) {
    const trigger = game.allCards.find(c => c.instanceId === triggerInstanceId)
    if (!trigger?.pendingInallaTrigger) return

    if (pay) {
      const original = game.allCards.find(
        c => c.instanceId === trigger.pendingInallaTrigger!.wizardInstanceId
      )
      if (original) {
        const token: GameCard = {
          instanceId: uuid(),
          name: original.name,
          scryfallData: original.scryfallData,
          artCropUrl: original.artCropUrl,
          normalImageUrl: original.normalImageUrl,
          isLoading: false,
          isToken: true,
          tapped: false,
          zone: 'battlefield',
          position: {
            x: (original.position?.x ?? 0) + 90,
            y: (original.position?.y ?? 80),
          },
          markedForExile: true,
          highlightedInTutorial: false,
        }
        game.addCardToZone(token, 'battlefield')
        game.adjustMana('C', -1)
      }
    }

    game.removeCard(triggerInstanceId)
  }

  return { checkInallaTrigger, resolveInallaTrigger }
}
