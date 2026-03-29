<script setup lang="ts">
import { ref } from 'vue'
import type { InteractionStackItem } from '../../stores/interactionStore'
import { useSettingsStore } from '../../stores/settingsStore'

const props = defineProps<{ item: InteractionStackItem }>()
const emit = defineEmits<{ dismiss: [id: string] }>()

const settings = useSettingsStore()
const showReasoning = ref(false)

const ACCENT_COLORS: Record<string, string> = {
  counter: '#3b82f6',    // blue
  removal: '#ef4444',    // red
  stax: '#f59e0b',       // amber
  politics: '#8b5cf6',   // violet
  pass: '#64748b',       // slate
}

function accentColor(type: string | undefined) {
  return ACCENT_COLORS[type ?? 'pass'] ?? ACCENT_COLORS.pass
}
</script>

<template>
  <div
    class="rounded-xl p-3 text-xs flex flex-col gap-2 transition-all"
    style="background: rgba(30, 15, 60, 0.6); border: 1px solid rgba(120,80,255,0.2); animation: stackItemIn 0.25s ease forwards;"
    :style="{ borderLeftColor: accentColor(item.decision.interactionType), borderLeftWidth: '3px' }"
    :data-testid="`interaction-stack-item-${item.seatIndex}`"
  >
    <!-- Header: portrait + name + type chip -->
    <div class="flex items-center gap-2">
      <div
        class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border"
        :style="{ borderColor: accentColor(item.decision.interactionType) }"
      >
        <slot name="portrait" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-display text-xs truncate" style="color: rgba(200,170,255,0.9);">
          {{ item.archetype.commanderNames[0] }}
        </div>
        <div class="font-mono text-xs mt-0.5">
          <span
            v-if="item.decision.cardUsed"
            class="px-1.5 py-0.5 rounded text-white"
            :style="{ background: accentColor(item.decision.interactionType) + '33', border: `1px solid ${accentColor(item.decision.interactionType)}66` }"
          >{{ item.decision.cardUsed }}</span>
          <span v-else class="opacity-50">{{ item.decision.interactionType }}</span>
        </div>
      </div>
      <button
        class="font-mono text-xs opacity-40 hover:opacity-70 transition-opacity"
        @click="emit('dismiss', item.id)"
      >✕</button>
    </div>

    <!-- Reasoning (collapsible) -->
    <div v-if="settings.showReasoning">
      <button
        class="flex items-center gap-1 font-mono text-xs transition-colors"
        style="color: rgba(120,80,255,0.6);"
        @click="showReasoning = !showReasoning"
        data-testid="why-chevron"
      >
        <span>{{ showReasoning ? '▾' : '▸' }}</span>
        <span>Why?</span>
      </button>
      <div
        v-if="showReasoning"
        class="mt-1 font-mono text-xs leading-relaxed"
        style="color: rgba(180,140,255,0.7);"
        data-testid="reasoning-text"
      >
        {{ item.decision.reasoning }}
      </div>
    </div>
  </div>
</template>
