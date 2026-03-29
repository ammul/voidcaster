<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useScryfallStore } from '../../stores/scryfallStore'
import type { Zone } from '../../types'

const emit = defineEmits<{ close: [] }>()

const game = useGameStore()
const scryfallStore = useScryfallStore()

const query = ref('')
const targetZone = ref<'hand' | 'battlefield' | 'graveyard'>('hand')

const filtered = computed(() => {
  const q = query.value.toLowerCase().trim()
  return game.library.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.scryfallData?.type_line ?? '').toLowerCase().includes(q) ||
    (c.scryfallData?.oracle_text ?? '').toLowerCase().includes(q)
  )
})

function pick(instanceId: string) {
  const zone = targetZone.value as Zone
  game.moveCard(instanceId, zone)
  // Trigger image load when card goes to hand or battlefield
  if (zone === 'hand' || zone === 'battlefield') {
    scryfallStore.loadCardImage(instanceId)
  }
  // Shuffle library after tutoring (to not reveal order)
  game.shuffleLibrary()
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 z-[300] flex items-center justify-center"
    style="background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);"
    @keydown="onKeydown"
    @click.self="emit('close')"
  >
    <div class="glass rounded-2xl p-5 w-full max-w-lg shadow-2xl flex flex-col" style="max-height: 80vh;">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="font-display text-lg text-violet-200 font-semibold">Search Library</h2>
        <span class="font-mono text-xs text-slate-600">{{ game.library.length }} cards</span>
      </div>

      <!-- Target zone selector -->
      <div class="flex gap-2 mb-3">
        <span class="font-mono text-xs text-slate-500 self-center">Move to:</span>
        <button
          v-for="z in (['hand', 'battlefield', 'graveyard'] as const)"
          :key="z"
          class="font-mono text-xs px-3 py-1 rounded-lg capitalize transition-all"
          :style="targetZone === z
            ? 'background: rgba(120,80,255,0.3); border: 1px solid rgba(120,80,255,0.5); color: #e2e8f0;'
            : 'background: rgba(120,80,255,0.06); border: 1px solid rgba(120,80,255,0.15); color: rgba(148,163,184,0.6);'"
          @click="targetZone = z"
        >{{ z }}</button>
      </div>

      <!-- Search input -->
      <input
        v-focus
        v-model="query"
        type="text"
        placeholder="Name, type, or oracle text…"
        class="w-full rounded-xl px-3 py-2 mb-3 font-mono text-sm text-slate-200 outline-none"
        style="background: rgba(30,20,60,0.8); border: 1px solid rgba(120,80,255,0.2);"
        @keydown.escape="emit('close')"
      />

      <!-- Results -->
      <div class="overflow-y-auto flex-1 flex flex-col gap-1 pr-1">
        <div v-if="!filtered.length" class="text-center font-mono text-xs text-slate-600 py-6">
          No cards match "{{ query }}"
        </div>

        <button
          v-for="card in filtered"
          :key="card.instanceId"
          class="w-full text-left rounded-xl px-3 py-2 transition-all group"
          style="border: 1px solid rgba(120,80,255,0.1);"
          :style="{ background: 'rgba(20,15,50,0.6)' }"
          @mouseenter="(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,80,255,0.4)'"
          @mouseleave="(e) => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(120,80,255,0.1)'"
          @click="pick(card.instanceId)"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-200 text-sm truncate">{{ card.name }}</span>
            <span class="font-mono text-xs text-violet-400 shrink-0">{{ card.scryfallData?.mana_cost ?? '' }}</span>
          </div>
          <div class="flex items-center justify-between gap-2 mt-0.5">
            <span class="font-mono text-xs text-slate-500 truncate italic">{{ card.scryfallData?.type_line ?? 'Loading…' }}</span>
          </div>
          <p
            v-if="card.scryfallData?.oracle_text"
            class="font-mono text-xs text-slate-600 mt-1 line-clamp-2"
          >{{ card.scryfallData.oracle_text }}</p>
        </button>
      </div>

      <p class="font-mono text-xs text-slate-700 text-center mt-3">
        Click a card to move it to {{ targetZone }} · Library reshuffled after
      </p>
    </div>
  </div>
</template>
