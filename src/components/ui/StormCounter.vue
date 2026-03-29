<script setup lang="ts">
import { useGameStore } from '../../stores/gameStore'

const game = useGameStore()
</script>

<template>
  <div
    class="flex items-center gap-1.5 rounded-xl px-2 py-1 font-mono"
    style="background: rgba(10,8,30,0.6); border: 1px solid rgba(120,80,255,0.2);"
  >
    <span class="text-xs text-slate-500">Storm:</span>
    <span class="text-white font-bold font-mono">{{ game.stormCount }}</span>
    <button
      class="text-xs text-slate-500 hover:text-slate-200 ml-1 transition-colors"
      @click="game.incrementStorm()"
    >+1</button>
  </div>
</template>
