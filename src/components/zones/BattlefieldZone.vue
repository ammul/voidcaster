<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useInallaToken } from '../../composables/useInallaToken'
import CardComponent from '../cards/CardComponent.vue'
import CardContextMenu from '../cards/CardContextMenu.vue'
import ManaWidget from '../ui/ManaWidget.vue'
import type { GameCard } from '../../types'

const GRID = 24

const game = useGameStore()
const { checkInallaTrigger } = useInallaToken()

const regularCards = computed(() => game.battlefield.filter(c => !c.isEtbTrigger))
const etbTriggers  = computed(() => game.battlefield.filter(c =>  c.isEtbTrigger))

const isDragOver = ref(false)
const zoneEl = ref<HTMLElement | null>(null)

const etbMenuCard = ref<GameCard | null>(null)
const etbMenuPos  = ref({ x: 0, y: 0 })

function snap(v: number): number { return Math.round(v / GRID) * GRID }

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
}

function onDragLeave(e: DragEvent) {
  if (!zoneEl.value?.contains(e.relatedTarget as Node)) isDragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const id = e.dataTransfer?.getData('text/plain')
  if (!id || !zoneEl.value) return

  const rect = zoneEl.value.getBoundingClientRect()
  const x = Math.max(0, snap(e.clientX - rect.left - 40))
  const y = Math.max(0, snap(e.clientY - rect.top  - 56))

  game.moveCard(id, 'battlefield')
  const placed = game.allCards.find(c => c.instanceId === id)
  if (placed) {
    placed.position = { x, y }
    if (!placed.isToken && !placed.isEtbTrigger && placed.scryfallData) {
      const tl = placed.scryfallData.type_line ?? ''
      if (tl.includes('Creature')) {
        game.spawnEtbTrigger(`${placed.name} ETB`, { x, y: y + 96 })
        if (tl.includes('Wizard')) checkInallaTrigger(placed)
      }
    }
  }
}

function onEtbRightClick(e: MouseEvent, card: GameCard) {
  e.preventDefault()
  e.stopPropagation()
  etbMenuCard.value = card
  etbMenuPos.value = { x: e.clientX, y: e.clientY }
}
</script>

<template>
  <div
    ref="zoneEl"
    class="zone-base relative rounded-xl transition-all overflow-auto"
    :class="{ 'zone-drop-active': isDragOver }"
    style="min-height: 14rem;"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <span class="zone-label absolute top-2 left-3 z-10">Battlefield</span>

    <!-- Grid lines -->
    <div
      class="absolute inset-0 pointer-events-none rounded-xl opacity-20"
      :style="{
        backgroundImage: `linear-gradient(rgba(120,80,255,0.15) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(120,80,255,0.15) 1px, transparent 1px)`,
        backgroundSize: `${GRID * 4}px ${GRID * 4}px`,
      }"
    />

    <!-- Regular cards -->
    <div
      v-for="card in regularCards"
      :key="card.instanceId"
      class="absolute"
      :style="{ left: `${card.position?.x ?? 0}px`, top: `${(card.position?.y ?? 0) + 24}px` }"
    >
      <CardComponent :card="card" size="md" :tappable="true" />
    </div>

    <!-- ETB trigger badges -->
    <div
      v-for="trigger in etbTriggers"
      :key="trigger.instanceId"
      class="absolute rounded-lg cursor-context-menu select-none flex items-center justify-center px-2 py-1 text-center"
      :style="{
        left: `${trigger.position?.x ?? 0}px`,
        top:  `${(trigger.position?.y ?? 0) + 24}px`,
        width: '7rem',
        minHeight: '2.5rem',
        background: trigger.pendingInallaTrigger ? 'rgba(40,20,5,0.92)' : 'rgba(20,8,40,0.92)',
        border: trigger.pendingInallaTrigger ? '1px solid rgba(245,158,11,0.55)' : '1px solid rgba(120,80,255,0.55)',
        boxShadow: trigger.pendingInallaTrigger ? '0 0 10px rgba(245,158,11,0.2)' : '0 0 10px rgba(120,80,255,0.2)',
        zIndex: 20,
      }"
      :title="`Right-click to ${trigger.pendingInallaTrigger ? 'Pay {1} or Decline' : 'Resolve'}`"
      @contextmenu="onEtbRightClick($event, trigger)"
    >
      <span
        class="font-mono leading-tight"
        style="font-size: 0.55rem;"
        :style="{ color: trigger.pendingInallaTrigger ? 'rgba(253,211,100,0.9)' : 'rgba(180,140,255,0.9)' }"
      >{{ trigger.triggerDescription }}</span>
    </div>

    <div
      v-if="!regularCards.length && !etbTriggers.length"
      class="w-full flex items-center justify-center pointer-events-none"
      style="padding-top: 4rem;"
    >
      <span class="text-slate-800 text-sm font-mono">Drag cards here to play them</span>
    </div>

    <!-- Mana widget lives on the battlefield -->
    <ManaWidget />

    <!-- ETB context menu -->
    <Teleport to="body">
      <CardContextMenu
        v-if="etbMenuCard"
        :card="etbMenuCard"
        :position="etbMenuPos"
        @close="etbMenuCard = null"
      />
    </Teleport>
  </div>
</template>
