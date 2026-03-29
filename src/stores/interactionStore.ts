import { defineStore } from 'pinia'
import { ref } from 'vue'
import { HeuristicEngine } from '../interaction/HeuristicEngine'
import type { GameAction, InteractionDecision, PoliticsEvent } from '../interaction/InteractionEngine'
import type { OpponentArchetype } from '../data/archetypes'
import { ARCHETYPES_BY_ID } from '../data/archetypes'
import { useSettingsStore } from './settingsStore'
import { useGameStore } from './gameStore'

export interface InteractionStackItem {
  id: string
  seatIndex: 0 | 1 | 2
  archetype: OpponentArchetype
  decision: InteractionDecision
}

export type PoliticsToastItem = PoliticsEvent & { id: string; seatIndex: 0 | 1 | 2 }

let _idCounter = 0
function nextId() { return `interaction-${++_idCounter}` }

export const useInteractionStore = defineStore('interaction', () => {
  const items = ref<InteractionStackItem[]>([])
  const politicsToasts = ref<PoliticsToastItem[]>([])

  function dismissToast(id: string) {
    const idx = politicsToasts.value.findIndex(t => t.id === id)
    if (idx !== -1) politicsToasts.value.splice(idx, 1)
  }

  function removeItem(id: string) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) items.value.splice(idx, 1)
  }

  async function evaluateAction(action: GameAction) {
    const settings = useSettingsStore()
    if (!settings.interactionEnabled) return

    const game = useGameStore()
    const gameState = {
      turn: game.turn,
      stackDepth: game.stack.length,
      lifeTotal: game.lifeTotal,
    }

    const rng = settings.getPrng()
    const engine = new HeuristicEngine(rng)

    const seats: Array<0 | 1 | 2> = [0, 1, 2]

    // Evaluate all 3 seats concurrently
    const archetypeIds = seats.map(i => settings.getEffectiveArchetypeId(i))
    const archetypes = archetypeIds.map(id => ARCHETYPES_BY_ID[id] ?? Object.values(ARCHETYPES_BY_ID)[0])

    const decisions = await Promise.all(
      archetypes.map(archetype => engine.evaluate(action, gameState, archetype))
    )

    // Reveal sequentially with 600ms stagger
    for (let i = 0; i < seats.length; i++) {
      const seatIndex = seats[i]
      const archetype = archetypes[i]
      const decision = decisions[i]

      await new Promise<void>(resolve => setTimeout(resolve, i === 0 ? 0 : 600))

      if (decision.interactionType === 'politics') {
        // Sample a politics template via the same PRNG
        const templates = archetype.politicsTemplates
        const idx = Math.floor(rng() * templates.length)
        const message = templates[idx] ?? ''
        const proposal: PoliticsEvent['proposal'] =
          archetype.politicsProfile.dealPreference === 'stop_the_leader'
            ? 'stop_the_leader'
            : archetype.politicsProfile.dealPreference === 'draw_first'
            ? 'let_me_go_first'
            : 'non_aggression'

        politicsToasts.value.push({
          id: nextId(),
          seatIndex,
          from: archetype,
          message,
          proposal,
        })
      } else if (decision.interacts) {
        items.value.unshift({
          id: nextId(),
          seatIndex,
          archetype,
          decision,
        })
      }
    }
  }

  function clear() {
    items.value = []
    politicsToasts.value = []
  }

  return {
    items,
    politicsToasts,
    evaluateAction,
    removeItem,
    dismissToast,
    clear,
  }
})
