<script setup lang="ts">
import type { PoliticsToastItem } from '../../stores/interactionStore'

const props = defineProps<{ toast: PoliticsToastItem }>()
const emit = defineEmits<{ dismiss: [id: string] }>()
</script>

<template>
  <div
    class="rounded-xl px-4 py-3 max-w-xs text-xs"
    style="background: rgba(30,15,60,0.85); border: 1px solid rgba(120,80,255,0.35); backdrop-filter: blur(8px); box-shadow: 0 0 24px rgba(120,80,255,0.15);"
    :data-testid="`politics-toast-${toast.seatIndex}`"
    :data-seat="toast.seatIndex"
  >
    <div class="flex items-center justify-between gap-3 mb-1">
      <span class="font-display text-xs" style="color: rgba(180,140,255,0.9);">
        {{ toast.from.commanderNames[0] }}
      </span>
      <button
        class="font-mono text-xs opacity-40 hover:opacity-80 transition-opacity"
        @click="emit('dismiss', toast.id)"
        data-testid="politics-dismiss"
        aria-label="Dismiss"
      >✕</button>
    </div>
    <p class="font-mono leading-relaxed" style="color: rgba(220,200,255,0.8);">
      "{{ toast.message }}"
    </p>
  </div>
</template>
