<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import CardComponent from '../cards/CardComponent.vue'

const game = useGameStore()
const cards = computed(() => game.commandZone)
</script>

<template>
  <div class="flex flex-col items-center">
    <span class="zone-label mb-1">Command</span>
    <div
      class="zone-base rounded-xl flex items-center justify-center"
      style="width: 5rem; height: 7rem;"
    >
      <CardComponent
        v-for="card in cards"
        :key="card.instanceId"
        :card="card"
        size="sm"
      />
      <span v-if="!cards.length" class="text-slate-700 text-xs">—</span>
    </div>
  </div>
</template>
