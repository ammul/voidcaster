<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const emit = defineEmits<{ search: [] }>()

const game = useGameStore()
const library = computed(() => game.library)
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <span class="zone-label">Library</span>

    <!-- Deck pile -->
    <div
      class="zone-base rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
      style="width: 6rem; height: 8.5rem;"
      @click="emit('search')"
      title="Click to search library"
    >
      <!-- Stacked card backs -->
      <div class="relative w-8 h-11 mb-1">
        <div
          v-for="i in Math.min(library.length, 4)"
          :key="i"
          class="absolute inset-0 rounded-md"
          :style="{
            background: 'linear-gradient(135deg, #1a1040 0%, #0d0820 100%)',
            border: '1px solid rgba(120,80,255,0.25)',
            transform: `translate(${(4 - i) * -1}px, ${(4 - i) * -1}px)`,
          }"
        />
      </div>
      <span class="font-mono text-slate-300 text-sm font-bold">{{ library.length }}</span>
    </div>

    <!-- Draw button -->
    <button
      class="font-mono text-xs px-2 py-0.5 rounded-lg transition-all w-full text-center"
      :disabled="!library.length"
      style="border: 1px solid rgba(0,220,255,0.2); color: rgba(0,220,255,0.6);"
      @click.stop="game.drawCard()"
    >Draw</button>
  </div>
</template>
