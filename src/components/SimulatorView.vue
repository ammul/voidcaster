<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, watch } from 'vue'
import type { Scenario, SimulatorMode } from '../types'
import { useGameStore, onGameAction } from '../stores/gameStore'
import { useTutorialStore } from '../stores/tutorialStore'
import { useScryfallStore } from '../stores/scryfallStore'
import { useInteractionStore } from '../stores/interactionStore'
import { useSettingsStore } from '../stores/settingsStore'
import { EXAMPLE_HANDS } from '../data/exampleHands'
import { DECKLIST } from '../data/decklist'
import CommandZone from './zones/CommandZone.vue'
import HandZone from './zones/HandZone.vue'
import BattlefieldZone from './zones/BattlefieldZone.vue'
import GraveyardZone from './zones/GraveyardZone.vue'
import ExileZone from './zones/ExileZone.vue'
import LibraryZone from './zones/LibraryZone.vue'
import LifeTotal from './ui/LifeTotal.vue'
import StormCounter from './ui/StormCounter.vue'
import PhaseTracker from './ui/PhaseTracker.vue'
import TutorialSidebar from './ui/TutorialSidebar.vue'
import MulliganModal from './ui/MulliganModal.vue'
import LibrarySearchModal from './ui/LibrarySearchModal.vue'
import CombosModal from './ui/CombosModal.vue'
import OpponentSeat from './interaction/OpponentSeat.vue'
import InteractionNotifications from './interaction/InteractionNotifications.vue'
import PoliticsToast from './interaction/PoliticsToast.vue'

const props = defineProps<{
  scenario: Scenario
  mode?: SimulatorMode
}>()

const emit = defineEmits<{ back: [] }>()

const game = useGameStore()
const tutorial = useTutorialStore()
const scryfallStore = useScryfallStore()
const interaction = useInteractionStore()
const settings = useSettingsStore()

const isTutorialMode = computed(() => props.mode !== 'freeplay')
const showMulligan = ref(false)
const showSearch = ref(false)
const showCombos = ref(false)

// ── Watch hand/battlefield: load full card data ────────────────────────────
watch(
  () => game.hand.map(c => c.instanceId),
  (newIds, oldIds = []) => {
    for (const id of newIds.filter(id => !oldIds.includes(id))) {
      const card = game.allCards.find(c => c.instanceId === id)
      if (card && !card.normalImageUrl) scryfallStore.loadCardData(id, card.name)
    }
  }
)

watch(
  () => game.battlefield.map(c => c.instanceId),
  (newIds, oldIds = []) => {
    for (const id of newIds.filter(id => !oldIds.includes(id))) {
      const card = game.allCards.find(c => c.instanceId === id)
      if (card && !card.normalImageUrl && !card.isEtbTrigger) scryfallStore.loadCardData(id, card.name)
    }
  }
)

// ── Initialization ────────────────────────────────────────────────────────
async function initializeScenario() {
  game.resetState()
  interaction.clear()

  const inalla = game.createCard('Inalla, Archmage Ritualist', 'command')
  game.addCardToZone(inalla, 'command')
  scryfallStore.loadCardData(inalla.instanceId, inalla.name)

  const handNames = EXAMPLE_HANDS[props.scenario]

  if (isTutorialMode.value) {
    // Fixed example hand
    for (const cardName of handNames) {
      const card = game.createCard(cardName, 'hand')
      game.addCardToZone(card, 'hand')
      scryfallStore.loadCardData(card.instanceId, cardName)
    }
    // Fill library with remaining deck cards (not already in hand)
    const handSet = new Set(handNames)
    const deckCards = DECKLIST.filter(
      name => name !== 'Inalla, Archmage Ritualist' && !handSet.has(name)
    )
    for (const cardName of deckCards) {
      const card = game.createCard(cardName, 'library')
      card.isLoading = false
      game.addCardToZone(card, 'library')
    }
    game.shuffleLibrary()
    tutorial.loadCombo(props.scenario)
  } else {
    // Free play: full 99-card deck → shuffle → draw 7
    const deckCards = DECKLIST.filter(name => name !== 'Inalla, Archmage Ritualist')
    for (const cardName of deckCards) {
      const card = game.createCard(cardName, 'library')
      card.isLoading = false
      game.addCardToZone(card, 'library')
    }
    game.shuffleLibrary()
    const drawn = game.drawCards(7)
    for (const card of drawn) scryfallStore.loadCardData(card.instanceId, card.name)
    showMulligan.value = true
  }
}

function onMulliganDone() { showMulligan.value = false }

function onKeyDown(e: KeyboardEvent) {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (showMulligan.value || showSearch.value || showCombos.value) return
  if (e.code === 'Space') { e.preventDefault(); game.advanceStep() }
}

let removeActionListener: (() => void) | null = null

onMounted(() => {
  initializeScenario()
  document.addEventListener('keydown', onKeyDown)
  removeActionListener = onGameAction(action => interaction.evaluateAction(action))
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  removeActionListener?.()
})
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Top bar -->
    <div
      class="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0 flex-wrap"
      style="background: rgba(10,8,30,0.8); border-color: rgba(120,80,255,0.15); min-height: 3rem;"
    >
      <button
        class="font-mono text-slate-500 hover:text-slate-200 text-xs tracking-widest uppercase transition-colors flex-shrink-0"
        @click="emit('back')"
      >← Back</button>

      <span class="font-display text-violet-300 text-sm tracking-wide flex-shrink-0">{{ scenario }}</span>
      <span class="font-mono text-xs text-slate-600 flex-shrink-0">{{ mode === 'freeplay' ? 'Free Play' : 'Tutorial' }}</span>

      <!-- Free play actions -->
      <template v-if="!isTutorialMode">
        <div class="h-4 border-l border-slate-700 mx-0.5 flex-shrink-0" />
        <button
          class="font-mono text-xs px-2 py-1 rounded-lg transition-all flex-shrink-0"
          style="border: 1px solid rgba(255,80,80,0.25); color: rgba(255,120,120,0.7);"
          @click="initializeScenario()"
        >Restart</button>
        <button
          class="font-mono text-xs px-2 py-1 rounded-lg transition-all flex-shrink-0"
          style="border: 1px solid rgba(0,220,255,0.25); color: rgba(0,220,255,0.7);"
          :disabled="!game.library.length"
          @click="game.drawCards(1)"
        >Draw</button>
        <button
          class="font-mono text-xs px-2 py-1 rounded-lg transition-all flex-shrink-0"
          style="border: 1px solid rgba(120,80,255,0.25); color: rgba(180,140,255,0.7);"
          @click="showSearch = true"
        >Search</button>
        <button
          class="font-mono text-xs px-2 py-1 rounded-lg transition-all flex-shrink-0"
          style="border: 1px solid rgba(80,180,255,0.25); color: rgba(80,180,255,0.7);"
          @click="showCombos = true"
        >Combos</button>
      </template>

      <!-- Quick phase toggles -->
      <div class="h-4 border-l border-slate-700 mx-0.5 flex-shrink-0" />

      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          class="font-mono text-xs px-2 py-1 rounded-lg transition-all"
          :style="game.quickBeginPhase
            ? 'border: 1px solid rgba(250,200,80,0.6); color: rgba(250,200,80,1); background: rgba(250,200,80,0.12);'
            : 'border: 1px solid rgba(250,200,80,0.15); color: rgba(250,200,80,0.4);'"
          @click="game.quickBeginPhase = !game.quickBeginPhase"
        >Quick Begin</button>
        <div class="relative group">
          <span class="font-mono text-xs text-slate-600 cursor-default select-none" style="font-size: 0.65rem;">ⓘ</span>
          <div
            class="absolute hidden group-hover:block glass rounded-lg px-2 py-1.5 text-xs font-mono z-[200] pointer-events-none"
            style="bottom: 1.5rem; left: 50%; transform: translateX(-50%); width: 13rem; color: rgba(180,160,220,0.85);"
          >Condenses Untap + Upkeep + Draw into one Space-press. Auto-untaps permanents and draws a card.</div>
        </div>
      </div>

      <div class="flex items-center gap-1 flex-shrink-0">
        <button
          class="font-mono text-xs px-2 py-1 rounded-lg transition-all"
          :style="game.quickCombat
            ? 'border: 1px solid rgba(220,80,80,0.6); color: rgba(220,80,80,1); background: rgba(220,80,80,0.12);'
            : 'border: 1px solid rgba(220,80,80,0.15); color: rgba(220,80,80,0.4);'"
          @click="game.quickCombat = !game.quickCombat"
        >Quick Combat</button>
        <div class="relative group">
          <span class="font-mono text-xs text-slate-600 cursor-default select-none" style="font-size: 0.65rem;">ⓘ</span>
          <div
            class="absolute hidden group-hover:block glass rounded-lg px-2 py-1.5 text-xs font-mono z-[200] pointer-events-none"
            style="bottom: 1.5rem; left: 50%; transform: translateX(-50%); width: 13rem; color: rgba(180,160,220,0.85);"
          >Condenses all 5 combat steps into a single step. Skips directly from Main 1 to Main 2.</div>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-2 flex-shrink-0">
        <PhaseTracker />
        <StormCounter />
        <LifeTotal />
      </div>
    </div>

    <!-- Main layout -->
    <div class="flex flex-1 overflow-hidden min-h-0">
      <TutorialSidebar v-if="isTutorialMode" />

      <div class="flex-1 flex flex-col overflow-hidden p-2 gap-2 min-h-0">
        <!-- Top row: command / gy + exile + library -->
        <div class="flex gap-2 flex-shrink-0 items-start" style="height: 10.5rem;">
          <CommandZone />
          <div class="flex gap-2 items-start ml-auto">
            <GraveyardZone />
            <ExileZone />
            <LibraryZone @search="showSearch = true" />
          </div>
        </div>

        <!-- Battlefield -->
        <BattlefieldZone class="flex-1 min-h-0" />

        <!-- Hand -->
        <HandZone class="flex-shrink-0" />
      </div>
    </div>

    <!-- Next Phase floating button -->
    <button
      class="fixed bottom-5 right-6 flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-semibold transition-all z-[100]"
      style="background: rgba(120,80,255,0.2); border: 1px solid rgba(120,80,255,0.5); color: rgba(200,170,255,0.9); box-shadow: 0 0 16px rgba(120,80,255,0.2);"
      title="Advance to next step"
      @click="game.advanceStep()"
    >
      Next Phase
      <kbd
        class="font-mono text-xs rounded px-1 py-0.5"
        style="background: rgba(120,80,255,0.15); border: 1px solid rgba(120,80,255,0.3); color: rgba(180,140,255,0.7);"
      >Space</kbd>
    </button>

    <!-- Mulligan modal -->
    <MulliganModal v-if="showMulligan" @done="onMulliganDone" />

    <!-- Library search modal -->
    <LibrarySearchModal v-if="showSearch" @close="showSearch = false" />

    <!-- Combos reference modal -->
    <CombosModal v-if="showCombos" @close="showCombos = false" />

    <!-- Opponent seats + interaction notifications (below header, top-center) -->
    <div
      v-if="settings.interactionEnabled"
      class="fixed left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[150]"
      style="top: 4rem; pointer-events: none;"
    >
      <div class="flex gap-6" style="pointer-events: none;">
        <OpponentSeat v-for="i in [0,1,2] as const" :key="i" :seat-index="i" />
      </div>
      <div style="pointer-events: auto;">
        <InteractionNotifications />
      </div>
    </div>

    <!-- Politics toasts -->
    <div
      v-for="toast in interaction.politicsToasts"
      :key="toast.id"
      class="fixed z-[160]"
      :style="{
        bottom: '5rem',
        left: toast.seatIndex === 0 ? '1rem' : toast.seatIndex === 1 ? '50%' : 'auto',
        right: toast.seatIndex === 2 ? '1rem' : 'auto',
        transform: toast.seatIndex === 1 ? 'translateX(-50%)' : 'none',
      }"
    >
      <PoliticsToast :toast="toast" @dismiss="interaction.dismissToast($event)" />
    </div>
  </div>
</template>
