<script setup lang="ts">
import { useGameStore } from '../../stores/gameStore'

const game = useGameStore()
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-xl px-2 py-1 font-mono"
    style="background: rgba(10,8,30,0.6); border: 1px solid rgba(120,80,255,0.2);"
  >
    <button
      class="text-red-400 hover:text-red-300 font-bold w-4 text-sm transition-colors"
      @click="game.adjustLife(-1)"
    >−</button>
    <span class="font-display text-white font-bold w-8 text-center">{{ game.lifeTotal }}</span>
    <button
      class="text-green-400 hover:text-green-300 font-bold w-4 text-sm transition-colors"
      @click="game.adjustLife(1)"
    >+</button>
    <span class="text-xs text-slate-500 ml-1">life</span>
  </div>
</template>
