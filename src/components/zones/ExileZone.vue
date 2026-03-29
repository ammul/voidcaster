<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import type { GameCard } from '../../types'

const game = useGameStore()
const exile = computed(() => game.exile)
const topCard = computed<GameCard | null>(() => exile.value[exile.value.length - 1] ?? null)
const expanded = ref(false)
const hoveredCard = ref<GameCard | null>(null)
const hoverPos = ref({ x: 0, y: 0 })

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const id = e.dataTransfer?.getData('text/plain')
  if (id) game.moveCard(id, 'exile')
}

function onRowMouseEnter(e: MouseEvent, card: GameCard) {
  hoveredCard.value = card
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const spaceRight = window.innerWidth - rect.right
  hoverPos.value = {
    x: spaceRight >= 176 ? rect.right + 8 : rect.left - 176,
    y: Math.min(rect.top, window.innerHeight - 240),
  }
}

function onRowMouseLeave() {
  hoveredCard.value = null
}
</script>

<template>
  <div class="relative flex flex-col items-center gap-1">
    <span class="zone-label">Exile</span>

    <!-- Pile with top card preview -->
    <div
      class="zone-base rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all relative"
      style="width: 6rem; height: 8.5rem;"
      @click="expanded = !expanded"
      @dragover="onDragOver"
      @drop="onDrop"
      :title="`Exile (${exile.length}) — click to view`"
    >
      <!-- Top card preview image -->
      <img
        v-if="topCard?.normalImageUrl"
        :src="topCard.normalImageUrl"
        :alt="topCard.name"
        class="absolute inset-0 w-full h-full object-cover object-top opacity-70"
      />
      <!-- Overlay with count -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-end pb-2"
        style="background: linear-gradient(to top, rgba(5,5,20,0.85) 40%, transparent 100%);"
      >
        <span class="font-mono text-slate-300 text-xl font-bold leading-none">{{ exile.length }}</span>
        <span class="font-mono text-slate-500 text-xs">cards</span>
      </div>
      <!-- Empty state -->
      <span v-if="!exile.length" class="font-mono text-slate-600 text-xs z-10">empty</span>
    </div>

    <!-- Expanded stacked list panel -->
    <Teleport to="body">
      <div
        v-if="expanded"
        class="fixed z-[150] glass rounded-2xl shadow-2xl"
        style="width: 22rem; max-height: 70vh; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      >
        <div class="flex items-center justify-between px-4 pt-4 pb-2 border-b" style="border-color: rgba(120,80,255,0.15);">
          <h3 class="font-display text-violet-300 text-sm font-semibold">Exile ({{ exile.length }})</h3>
          <button class="font-mono text-xs text-slate-500 hover:text-slate-200" @click="expanded = false">✕</button>
        </div>

        <div class="overflow-y-auto p-3 flex flex-col gap-1.5" style="max-height: calc(70vh - 3.5rem);">
          <div v-if="!exile.length" class="font-mono text-xs text-slate-600 text-center py-4">Empty</div>

          <div
            v-for="card in [...exile].reverse()"
            :key="card.instanceId"
            class="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 cursor-default"
            style="border: 1px solid rgba(120,80,255,0.1); background: rgba(20,15,50,0.5);"
            @mouseenter="onRowMouseEnter($event, card)"
            @mouseleave="onRowMouseLeave"
          >
            <span class="text-slate-200 text-xs font-semibold truncate flex-1">{{ card.name }}</span>
            <span class="font-mono text-violet-300 text-xs shrink-0">{{ card.scryfallData?.mana_cost ?? '' }}</span>
          </div>
        </div>
      </div>

      <!-- Hover card preview -->
      <div
        v-if="hoveredCard?.normalImageUrl && expanded"
        class="fixed z-[200] pointer-events-none rounded-xl overflow-hidden shadow-2xl"
        :style="{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px`, width: '160px', height: '224px' }"
        style="box-shadow: 0 0 20px rgba(120,80,255,0.4);"
      >
        <img :src="hoveredCard.normalImageUrl" :alt="hoveredCard.name" class="w-full h-full object-cover object-top" />
      </div>
    </Teleport>
  </div>
</template>
