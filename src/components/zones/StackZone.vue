<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import { useInteractionStore } from '../../stores/interactionStore'
import { useInallaToken } from '../../composables/useInallaToken'
import InteractionStackItem from '../interaction/InteractionStackItem.vue'

const game = useGameStore()
const interactionStore = useInteractionStore()
const { resolveInallaTrigger } = useInallaToken()
const stack = computed(() => game.stack)

// Colour coding for spell types
const ACCENT: Record<string, string> = {
  'ability':        '#ef4444',   // red
  'inalla-trigger': '#f59e0b',   // gold
  'spell':          '#3b82f6',   // blue
}

function accentFor(type: string) {
  return ACCENT[type] ?? '#3b82f6'
}
</script>

<template>
  <div class="zone-base rounded-xl p-2 overflow-y-auto flex flex-col gap-1.5" style="min-width: 0;">
    <span class="zone-label">Stack ({{ stack.length + interactionStore.items.length }})</span>

    <div v-if="!stack.length && !interactionStore.items.length" class="flex-1 flex items-center justify-center">
      <span class="text-slate-800 text-xs font-mono">Empty</span>
    </div>

    <!-- Opponent interaction items (violet accent) -->
    <InteractionStackItem
      v-for="item in interactionStore.items"
      :key="item.id"
      :item="item"
      @dismiss="interactionStore.removeItem($event)"
    >
      <template #portrait>
        <div class="w-full h-full" style="background: rgba(30,15,60,0.8);">
          <span class="w-full h-full flex items-center justify-center font-mono text-xs" style="color: rgba(120,80,255,0.6);">
            {{ item.seatIndex + 1 }}
          </span>
        </div>
      </template>
    </InteractionStackItem>

    <!-- Player/game stack items -->
    <div
      v-for="(item, i) in stack"
      :key="item.id"
      class="rounded-xl p-2 text-xs border-l-4 transition-all"
      :style="{
        background: 'rgba(10,8,30,0.5)',
        borderLeftColor: accentFor(item.type),
        boxShadow: i === 0 ? `0 0 16px ${accentFor(item.type)}33` : 'none',
        animation: 'stackItemIn 0.2s ease forwards',
      }"
    >
      <p class="leading-relaxed font-mono" :style="{ color: i === 0 ? 'rgba(220,200,255,0.9)' : 'rgba(160,140,200,0.6)' }">
        {{ item.description }}
      </p>
      <div v-if="item.type === 'inalla-trigger'" class="flex gap-1.5 mt-1.5">
        <button
          class="px-2 py-0.5 rounded font-mono text-xs transition-colors"
          style="background: rgba(245,158,11,0.2); border: 1px solid rgba(245,158,11,0.5); color: rgba(253,230,138,0.9);"
          @click="resolveInallaTrigger(item.id, true)"
        >
          Pay {1}
        </button>
        <button
          class="px-2 py-0.5 rounded font-mono text-xs transition-colors"
          style="background: rgba(100,116,139,0.2); border: 1px solid rgba(100,116,139,0.4); color: rgba(203,213,225,0.7);"
          @click="resolveInallaTrigger(item.id, false)"
        >
          Decline
        </button>
      </div>
    </div>
  </div>
</template>
