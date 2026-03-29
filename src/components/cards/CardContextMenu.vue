<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { GameCard } from '../../types'
import { useGameStore } from '../../stores/gameStore'
import { useInallaToken } from '../../composables/useInallaToken'

const props = defineProps<{
  card: GameCard
  position: { x: number; y: number }
}>()

const emit = defineEmits<{ close: [] }>()

const game = useGameStore()
const { checkInallaTrigger, resolveInallaTrigger } = useInallaToken()

function moveTo(zone: 'graveyard' | 'exile' | 'hand') {
  game.moveCard(props.card.instanceId, zone)
  emit('close')
}

function tap() {
  game.tapCard(props.card.instanceId)
  emit('close')
}

function createToken() {
  checkInallaTrigger(props.card)
  emit('close')
}

function resolveEtb() {
  game.removeCard(props.card.instanceId)
  emit('close')
}

function payInalla() {
  resolveInallaTrigger(props.card.instanceId, true)
  emit('close')
}

function declineInalla() {
  resolveInallaTrigger(props.card.instanceId, false)
  emit('close')
}

function closeOnClick() {
  emit('close')
}

onMounted(() => document.addEventListener('click', closeOnClick, { once: true }))
onUnmounted(() => document.removeEventListener('click', closeOnClick))
</script>

<template>
  <div
    class="fixed z-50 glass rounded-xl shadow-2xl py-1 min-w-44"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
    @click.stop
  >
    <!-- ETB trigger: Inalla (Pay / Decline) -->
    <template v-if="card.isEtbTrigger && card.pendingInallaTrigger">
      <div class="px-4 py-1.5 text-xs font-mono text-amber-400 opacity-70">Inalla Trigger</div>
      <hr class="border-slate-700 mx-2 my-0.5" />
      <button
        class="block w-full text-left px-4 py-2 text-sm text-amber-300 hover:bg-amber-900/30 transition-colors font-mono"
        @click="payInalla"
      >Pay {1} — Create Token</button>
      <button
        class="block w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-700/30 transition-colors font-mono"
        @click="declineInalla"
      >Decline</button>
    </template>

    <!-- ETB trigger: generic (Resolve) -->
    <template v-else-if="card.isEtbTrigger">
      <div class="px-4 py-1.5 text-xs font-mono text-violet-400 opacity-70">ETB Trigger</div>
      <hr class="border-slate-700 mx-2 my-0.5" />
      <button
        class="block w-full text-left px-4 py-2 text-sm text-violet-300 hover:bg-violet-900/30 transition-colors font-mono"
        @click="resolveEtb"
      >Resolve Trigger</button>
    </template>

    <!-- Regular card options -->
    <template v-else>
      <button
        class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-violet-900/30 transition-colors font-mono"
        @click="tap"
      >{{ card.tapped ? 'Untap' : 'Tap' }}</button>
      <hr class="border-slate-700 mx-2 my-0.5" />
      <button
        class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-violet-900/30 transition-colors"
        @click="moveTo('graveyard')"
      >Move to Graveyard</button>
      <button
        class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-violet-900/30 transition-colors"
        @click="moveTo('exile')"
      >Move to Exile</button>
      <button
        class="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-violet-900/30 transition-colors"
        @click="moveTo('hand')"
      >Move to Hand</button>
      <template v-if="card.scryfallData?.type_line?.includes('Wizard')">
        <hr class="border-slate-700 mx-2 my-0.5" />
        <button
          class="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-900/30 transition-colors"
          @click="createToken"
        >Create Token Copy (Inalla)</button>
      </template>
    </template>
  </div>
</template>
