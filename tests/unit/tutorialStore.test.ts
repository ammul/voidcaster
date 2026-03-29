import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTutorialStore } from '../../src/stores/tutorialStore'
import { useGameStore } from '../../src/stores/gameStore'
import { ALL_COMBOS } from '../../src/data/combos'

describe('tutorialStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('each combo has at least one defined step', () => {
    for (const combo of ALL_COMBOS) {
      expect(combo.steps.length).toBeGreaterThan(0)
    }
  })

  it('loadCombo sets current combo and resets step index', () => {
    const tutorial = useTutorialStore()
    tutorial.loadCombo('spellseeker')
    expect(tutorial.currentCombo?.id).toBe('spellseeker')
    expect(tutorial.currentStepIndex).toBe(0)
  })

  it('nextStep advances step index', () => {
    const tutorial = useTutorialStore()
    const game = useGameStore()
    tutorial.loadCombo('spellseeker')
    // Step 1 validates that Spellseeker is on battlefield
    game.addCardToZone(game.createCard('Spellseeker', 'battlefield'), 'battlefield')
    tutorial.nextStep()
    expect(tutorial.currentStepIndex).toBe(1)
  })

  it('step index cannot exceed total steps', () => {
    const tutorial = useTutorialStore()
    tutorial.loadCombo('consultation')
    const total = tutorial.totalSteps
    for (let i = 0; i < total + 5; i++) {
      tutorial.nextStep()
    }
    expect(tutorial.currentStepIndex).toBeLessThanOrEqual(total)
  })

  it('reset returns to step 0', () => {
    const tutorial = useTutorialStore()
    tutorial.loadCombo('breach')
    tutorial.nextStep()
    tutorial.nextStep()
    tutorial.reset()
    expect(tutorial.currentStepIndex).toBe(0)
  })

  it('isComplete is true when all steps are done', () => {
    const tutorial = useTutorialStore()
    const game = useGameStore()
    tutorial.loadCombo('consultation')

    // Step 1: validate bf("Thassa's Oracle")
    game.addCardToZone(game.createCard("Thassa's Oracle", 'battlefield'), 'battlefield')
    tutorial.nextStep()

    // Step 2: validate gy("Demonic Consultation")
    game.addCardToZone(game.createCard('Demonic Consultation', 'graveyard'), 'graveyard')
    tutorial.nextStep()

    // Steps 3–4: no validators
    tutorial.nextStep()
    tutorial.nextStep()

    expect(tutorial.isComplete).toBe(true)
  })

  it('currentStep is null when no combo loaded', () => {
    const tutorial = useTutorialStore()
    expect(tutorial.currentStep).toBeNull()
  })
})
