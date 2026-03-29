<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import CardComponent from '../cards/CardComponent.vue'

const game = useGameStore()
const hand = computed(() => game.hand)
const isDragOver = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const id = e.dataTransfer?.getData('text/plain')
  if (id) game.moveCard(id, 'hand')
}
</script>

<template>
  <div
    class="zone-base relative rounded-xl flex items-end justify-center pb-3 overflow-visible transition-all"
    :class="{ 'zone-drop-active': isDragOver }"
    style="height: 14rem; min-height: 14rem;"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <span class="zone-label absolute top-2 left-3">Hand ({{ hand.length }})</span>
    <div class="flex items-end" style="transform-origin: bottom center;">
      <div
        v-for="(card, i) in hand"
        :key="card.instanceId"
        class="transition-transform duration-200 hover:-translate-y-6"
        :style="{
          transform: `rotate(${(i - (hand.length - 1) / 2) * 2.5}deg)`,
          marginLeft: i > 0 ? '-22px' : '0',
          zIndex: i,
          transformOrigin: 'bottom center',
        }"
      >
        <CardComponent :card="card" size="lg" />
      </div>
    </div>
    <span v-if="!hand.length" class="text-slate-700 text-xs">Empty hand</span>
  </div>
</template>
