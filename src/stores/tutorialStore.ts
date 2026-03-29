import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Scenario, ManaType } from '../types'
import { ALL_COMBOS, type ComboDefinition, type ComboStep } from '../data/combos'
import { useGameStore } from './gameStore'

export const useTutorialStore = defineStore('tutorial', () => {
  const currentCombo = ref<ComboDefinition | null>(null)
  const currentStepIndex = ref(0)

  const currentStep = computed<ComboStep | null>(() => {
    if (!currentCombo.value) return null
    return currentCombo.value.steps[currentStepIndex.value] ?? null
  })

  const totalSteps = computed(() => currentCombo.value?.steps.length ?? 0)
  const isComplete = computed(() => currentStepIndex.value >= totalSteps.value)

  const canAdvance = computed<boolean>(() => {
    if (isComplete.value) return false
    const step = currentStep.value
    if (!step?.validate) return true
    const game = useGameStore()
    const snap = (arr: typeof game.hand) => arr.map(c => ({ name: c.name }))
    return step.validate({
      hand: snap(game.hand),
      battlefield: snap(game.battlefield),
      graveyard: snap(game.graveyard),
      exile: snap(game.exile),
    })
  })

  function loadCombo(scenario: Scenario) {
    currentCombo.value = ALL_COMBOS.find(c => c.id === scenario) ?? null
    currentStepIndex.value = 0
  }

  function nextStep() {
    if (!canAdvance.value) return
    const game = useGameStore()
    if (currentStep.value?.highlightCards) {
      game.highlightCards(currentStep.value.highlightCards)
    }
    if (currentStep.value?.lifeChange) {
      game.adjustLife(currentStep.value.lifeChange)
    }
    if (currentStep.value?.manaChange) {
      for (const [type, delta] of Object.entries(currentStep.value.manaChange)) {
        game.adjustMana(type as ManaType, delta as number)
      }
    }
    currentStepIndex.value++
  }

  function reset() {
    currentStepIndex.value = 0
    const game = useGameStore()
    game.clearHighlights()
  }

  return {
    currentCombo,
    currentStepIndex,
    currentStep,
    totalSteps,
    isComplete,
    canAdvance,
    loadCombo,
    nextStep,
    reset,
  }
})
