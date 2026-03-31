import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameCard, Zone, StackItem, ManaType, Phase, Step } from '../types'
import { v4 as uuid } from '../utils/uuid'
import type { GameAction } from '../interaction/InteractionEngine'

// Action event bus — interactionStore subscribes to this
type ActionListener = (action: GameAction) => void
const _actionListeners: ActionListener[] = []

export function onGameAction(fn: ActionListener) {
  _actionListeners.push(fn)
  return () => {
    const i = _actionListeners.indexOf(fn)
    if (i !== -1) _actionListeners.splice(i, 1)
  }
}

function emitGameAction(action: GameAction) {
  for (const fn of _actionListeners) fn(action)
}

export const useGameStore = defineStore('game', () => {
  const allCards = ref<GameCard[]>([])
  const stack = ref<StackItem[]>([])
  const lifeTotal = ref(40)
  const stormCount = ref(0)
  const spellsThisTurn = ref(0)
  const manaPool = ref<Record<ManaType, number>>({ W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 })
  const currentStep = ref<Step>('main1')
  const quickCombat = ref(false)
  const quickBeginPhase = ref(false)

  const STEP_ORDER: Step[] = [
    'untap', 'upkeep', 'draw', 'main1',
    'begin-combat', 'declare-attackers', 'declare-blockers', 'combat-damage', 'end-combat',
    'main2', 'end', 'cleanup',
  ]

  const STEP_TO_PHASE: Record<Step, Phase> = {
    untap: 'beginning', upkeep: 'beginning', draw: 'beginning',
    main1: 'main1',
    'begin-combat': 'combat', 'declare-attackers': 'combat', 'declare-blockers': 'combat',
    'combat-damage': 'combat', 'end-combat': 'combat',
    main2: 'main2',
    end: 'ending', cleanup: 'ending',
  }

  const currentPhase = computed<Phase>(() => STEP_TO_PHASE[currentStep.value])
  const turn = ref(1)
  const mulliganCount = ref(0)

  // ── Computed zones ───────────────────────────────────────────────────────────
  const commandZone = computed(() => allCards.value.filter(c => c.zone === 'command'))
  const hand        = computed(() => allCards.value.filter(c => c.zone === 'hand'))
  const battlefield = computed(() => allCards.value.filter(c => c.zone === 'battlefield'))
  const graveyard   = computed(() => allCards.value.filter(c => c.zone === 'graveyard'))
  const exile       = computed(() => allCards.value.filter(c => c.zone === 'exile'))
  // Library order = order in allCards array among zone=library cards (index 0 = top)
  const library     = computed(() => allCards.value.filter(c => c.zone === 'library'))

  // ── Card creation ────────────────────────────────────────────────────────────
  function createCard(name: string, zone: Zone, isToken = false): GameCard {
    return {
      instanceId: uuid(),
      name,
      scryfallData: null,
      artCropUrl: null,
      normalImageUrl: null,
      isLoading: true,
      isToken,
      tapped: false,
      zone,
      markedForExile: false,
      highlightedInTutorial: false,
    }
  }

  function addCardToZone(card: GameCard, zone: Zone) {
    card.zone = zone
    allCards.value.push(card)
  }

  function moveCard(instanceId: string, toZone: Zone) {
    const card = allCards.value.find(c => c.instanceId === instanceId)
    if (!card) return
    card.zone = toZone
    card.tapped = false
    if (toZone === 'battlefield') {
      card.position ??= { x: Math.random() * 300, y: 0 }
      // Emit action so interaction engine can evaluate
      if (!card.isToken && !card.isEtbTrigger) {
        const typeLine = card.scryfallData?.type_line ?? ''
        if (!typeLine.includes('Land')) {
          emitGameAction({
            type: 'etb',
            cardName: card.name,
            cardType: typeLine ? typeLine.split(' ') : undefined,
            isWinAttempt: card.name === "Thassa's Oracle",
            isTutorable: false,
            stackDepth: stack.value.length,
          })
        }
      }
    }
  }

  function removeCard(instanceId: string) {
    const idx = allCards.value.findIndex(c => c.instanceId === instanceId)
    if (idx !== -1) allCards.value.splice(idx, 1)
  }

  function spawnEtbTrigger(
    label: string,
    options?: { x?: number; y?: number; pendingInallaTrigger?: { wizardInstanceId: string; wizardName: string } }
  ) {
    const trigger: import('../types').GameCard = {
      instanceId: uuid(),
      name: label,
      scryfallData: null,
      artCropUrl: null,
      normalImageUrl: null,
      isLoading: false,
      isToken: false,
      isEtbTrigger: true,
      triggerDescription: label,
      pendingInallaTrigger: options?.pendingInallaTrigger,
      tapped: false,
      zone: 'battlefield',
      position: { x: options?.x ?? 20, y: options?.y ?? 20 },
      markedForExile: false,
      highlightedInTutorial: false,
    }
    allCards.value.push(trigger)
  }

  function tapCard(instanceId: string) {
    const card = allCards.value.find(c => c.instanceId === instanceId)
    if (card) card.tapped = !card.tapped
  }

  // ── Library / deck operations ────────────────────────────────────────────────
  /** Fisher-Yates shuffle of all library cards, preserving their relative position in allCards. */
  function shuffleLibrary() {
    const libCards = allCards.value.filter(c => c.zone === 'library')
    for (let i = libCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[libCards[i], libCards[j]] = [libCards[j], libCards[i]]
    }
    // Rebuild allCards: non-library first, then shuffled library order
    const rest = allCards.value.filter(c => c.zone !== 'library')
    allCards.value = [...rest, ...libCards]
  }

  /** Draw the top card of the library to hand. Returns the card or null if empty. */
  function drawCard(): GameCard | null {
    const lib = allCards.value.filter(c => c.zone === 'library')
    if (!lib.length) return null
    lib[0].zone = 'hand'
    return lib[0]
  }

  function drawCards(n: number): GameCard[] {
    const drawn: GameCard[] = []
    for (let i = 0; i < n; i++) {
      const c = drawCard()
      if (!c) break
      drawn.push(c)
    }
    return drawn
  }

  /** Put a library card on the bottom. */
  function putOnBottom(instanceId: string) {
    const idx = allCards.value.findIndex(c => c.instanceId === instanceId)
    if (idx === -1) return
    const card = allCards.value.splice(idx, 1)[0]
    allCards.value.push(card)
  }

  /** London Mulligan — return hand to library, shuffle, draw 7. */
  function doMulligan() {
    allCards.value.filter(c => c.zone === 'hand').forEach(c => { c.zone = 'library' })
    mulliganCount.value++
    shuffleLibrary()
    drawCards(7)
  }

  function resetMulliganCount() {
    mulliganCount.value = 0
  }

  // ── Stack ────────────────────────────────────────────────────────────────────
  /** Emit a game action to the interaction engine (if enabled). */
  function emitAction(action: GameAction) {
    if (action.type === 'cast_spell') spellsThisTurn.value++
    emitGameAction(action)
  }

  function pushToStack(item: StackItem) {
    stack.value.unshift(item)
  }

  function removeFromStack(id: string) {
    const idx = stack.value.findIndex(s => s.id === id)
    if (idx !== -1) stack.value.splice(idx, 1)
  }

  // ── Trackers ─────────────────────────────────────────────────────────────────
  function adjustMana(type: ManaType, delta: number) {
    manaPool.value[type] = Math.max(0, manaPool.value[type] + delta)
  }

  function adjustLife(delta: number) {
    lifeTotal.value += delta
  }

  function incrementStorm() {
    stormCount.value++
  }

  function advanceStep() {
    const idx = STEP_ORDER.indexOf(currentStep.value)
    const isLast = idx >= STEP_ORDER.length - 1

    if (isLast) {
      turn.value++
      currentStep.value = 'untap'
    } else {
      currentStep.value = STEP_ORDER[idx + 1]
    }

    // Auto-actions on entering a step
    switch (currentStep.value) {
      case 'untap':
        allCards.value.filter(c => c.zone === 'battlefield').forEach(c => { c.tapped = false })
        stormCount.value = 0
        spellsThisTurn.value = 0
        manaPool.value = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
        if (quickBeginPhase.value) {
          drawCard()
          currentStep.value = 'main1'
        }
        break
      case 'draw':
        drawCard()
        break
      case 'begin-combat':
        if (quickCombat.value) {
          currentStep.value = 'main2'
        }
        break
    }
  }

  // ── Tutorial helpers ──────────────────────────────────────────────────────────
  function highlightCards(cardNames: string[]) {
    allCards.value.forEach(c => {
      c.highlightedInTutorial = cardNames.includes(c.name)
    })
  }

  function clearHighlights() {
    allCards.value.forEach(c => { c.highlightedInTutorial = false })
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────
  function resetState() {
    allCards.value = []
    stack.value = []
    lifeTotal.value = 40
    stormCount.value = 0
    spellsThisTurn.value = 0
    manaPool.value = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }
    currentStep.value = 'untap'
    turn.value = 1
    mulliganCount.value = 0
  }

  return {
    allCards,
    stack,
    lifeTotal,
    stormCount,
    spellsThisTurn,
    manaPool,
    currentStep,
    quickCombat,
    quickBeginPhase,
    currentPhase,
    turn,
    mulliganCount,
    commandZone,
    hand,
    battlefield,
    graveyard,
    exile,
    library,
    createCard,
    addCardToZone,
    moveCard,
    removeCard,
    spawnEtbTrigger,
    tapCard,
    shuffleLibrary,
    drawCard,
    drawCards,
    putOnBottom,
    doMulligan,
    resetMulliganCount,
    pushToStack,
    removeFromStack,
    adjustMana,
    adjustLife,
    incrementStorm,
    advanceStep,
    highlightCards,
    clearHighlights,
    resetState,
    emitAction,
  }
})
