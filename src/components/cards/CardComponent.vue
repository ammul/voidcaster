<script setup lang="ts">
import { ref } from 'vue'
import type { GameCard } from '../../types'
import { useGameStore } from '../../stores/gameStore'
import CardContextMenu from './CardContextMenu.vue'

const props = defineProps<{
  card: GameCard
  size?: 'sm' | 'md' | 'lg'
  tappable?: boolean
}>()

const game = useGameStore()

const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })
const showInspect = ref(false)
const inspectPos = ref({ x: 0, y: 0 })
const hoverTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const sizeMap = {
  sm: { width: '3.5rem', height: '4.9rem' },
  md: { width: '5rem', height: '7rem' },
  lg: { width: '8rem', height: '11.2rem' },
}

function onRightClick(e: MouseEvent) {
  e.preventDefault()
  contextMenuPos.value = { x: e.clientX, y: e.clientY }
  showContextMenu.value = true
}

function onMouseEnter(e: MouseEvent) {
  hoverTimer.value = setTimeout(() => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const spaceRight = window.innerWidth - rect.right
    const panelWidth = 240
    inspectPos.value = {
      x: spaceRight > panelWidth + 12 ? rect.right + 8 : rect.left - panelWidth - 8,
      y: Math.min(rect.top, window.innerHeight - 320),
    }
    showInspect.value = true
  }, 350)
}

function onMouseLeave() {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
    hoverTimer.value = null
  }
  showInspect.value = false
}

// Manual double-click: draggable="true" swallows dblclick events on the second
// mousedown, so we track clicks ourselves and block drag during tap sequences.
let clickTimer: ReturnType<typeof setTimeout> | null = null
let pendingTap = false

function onClick() {
  if (showContextMenu.value) return
  if (!props.tappable) return
  if (pendingTap) {
    clearTimeout(clickTimer!)
    clickTimer = null
    pendingTap = false
    game.tapCard(props.card.instanceId)
  } else {
    pendingTap = true
    clickTimer = setTimeout(() => {
      pendingTap = false
      clickTimer = null
    }, 200)
  }
}

function onDragStart(e: DragEvent) {
  // If a tap sequence is in progress (first click already registered), cancel
  // the drag so the second click can complete the double-click.
  if (pendingTap) {
    e.preventDefault()
    return
  }
  if (!e.dataTransfer) return
  e.dataTransfer.setData('text/plain', props.card.instanceId)
  e.dataTransfer.effectAllowed = 'move'
  showInspect.value = false
}
</script>

<template>
  <div
    class="relative rounded-lg overflow-hidden select-none cursor-pointer flex-shrink-0"
    :class="[
      card.tapped ? 'card-tapped' : 'card-untapped',
      card.highlightedInTutorial ? 'tutorial-highlight' : 'card-hover-glow',
      card.isToken ? 'token-shimmer' : '',
    ]"
    :style="sizeMap[size ?? 'md']"
    draggable="true"
    @dragstart="onDragStart"
    @contextmenu="onRightClick"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <!-- Skeleton -->
    <div v-if="card.isLoading" class="w-full h-full card-skeleton rounded-lg" />

    <!-- Full card image (normal) -->
    <img
      v-else-if="card.normalImageUrl"
      :src="card.normalImageUrl"
      :alt="card.name"
      class="w-full h-full object-cover object-top"
    />

    <!-- Text fallback -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center p-1 rounded-lg"
      style="background: rgba(20,15,50,0.9); border: 1px solid rgba(120,80,255,0.2);"
    >
      <span class="text-xs text-slate-300 text-center leading-tight font-mono">{{ card.name }}</span>
    </div>

    <!-- Token badge -->
    <span
      v-if="card.isToken"
      class="absolute top-0 right-0 font-bold px-1 rounded-bl font-mono z-10"
      style="background: #c9a84c; color: #000; font-size: 0.5rem;"
    >T</span>

    <!-- Tapped indicator -->
    <div
      v-if="card.tapped"
      class="absolute inset-0 rounded-lg pointer-events-none"
      style="box-shadow: inset 0 0 0 2px rgba(255,160,40,0.6);"
    />
  </div>

  <!-- Context menu -->
  <CardContextMenu
    v-if="showContextMenu"
    :card="card"
    :position="contextMenuPos"
    @close="showContextMenu = false"
  />

  <!-- Oracle text inspect tooltip — teleported to avoid overflow clipping -->
  <Teleport to="body">
    <div
      v-if="showInspect && card.scryfallData"
      class="fixed z-[200] pointer-events-none glass rounded-xl shadow-2xl p-3"
      :style="{ left: `${inspectPos.x}px`, top: `${inspectPos.y}px`, width: '15rem' }"
    >
      <div class="flex items-start justify-between gap-1 mb-1">
        <p class="font-display text-sm text-white font-semibold leading-tight">{{ card.name }}</p>
        <p class="font-mono text-xs text-violet-300 shrink-0">{{ card.scryfallData.mana_cost }}</p>
      </div>
      <p class="text-xs text-slate-400 italic mb-2">{{ card.scryfallData.type_line }}</p>
      <p
        v-if="card.scryfallData.oracle_text"
        class="text-xs text-slate-200 leading-relaxed whitespace-pre-line"
      >{{ card.scryfallData.oracle_text }}</p>
      <p
        v-if="card.scryfallData.artist"
        class="text-slate-600 mt-2"
        style="font-size: 0.55rem; font-family: monospace;"
      >Art: {{ card.scryfallData.artist }}</p>
    </div>
  </Teleport>
</template>
