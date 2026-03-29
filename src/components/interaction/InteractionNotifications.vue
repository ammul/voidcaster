<script setup lang="ts">
import { watch } from 'vue'
import { useInteractionStore } from '../../stores/interactionStore'
import { useSettingsStore } from '../../stores/settingsStore'

const interaction = useInteractionStore()
const settings = useSettingsStore()

const ACCENT: Record<string, string> = {
  counter:  '#3b82f6',
  removal:  '#ef4444',
  stax:     '#f59e0b',
  politics: '#8b5cf6',
  pass:     '#64748b',
}

function accent(type: string | undefined) {
  return ACCENT[type ?? 'pass'] ?? ACCENT.pass
}

// Auto-dismiss after 8 seconds
watch(
  () => interaction.items.length,
  () => {
    const latest = interaction.items[0]
    if (!latest) return
    setTimeout(() => interaction.removeItem(latest.id), 8000)
  }
)
</script>

<template>
  <div
    v-if="interaction.items.length > 0"
    class="flex flex-col gap-1.5"
    style="pointer-events: auto;"
  >
    <div
      v-for="item in interaction.items"
      :key="item.id"
      class="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
      :style="{
        background: 'rgba(12,8,30,0.92)',
        border: `1px solid ${accent(item.decision.interactionType)}44`,
        borderLeft: `3px solid ${accent(item.decision.interactionType)}`,
        backdropFilter: 'blur(8px)',
        minWidth: '16rem',
        maxWidth: '22rem',
        animation: 'stackItemIn 0.25s ease forwards',
      }"
      :data-testid="`interaction-notification-${item.seatIndex}`"
    >
      <div
        class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border"
        :style="{ borderColor: accent(item.decision.interactionType) + '66' }"
      >
        <span class="font-mono text-xs" :style="{ color: accent(item.decision.interactionType) }">
          {{ item.seatIndex + 1 }}
        </span>
      </div>

      <div class="flex-1 min-w-0">
        <div class="font-display truncate" style="color: rgba(200,170,255,0.85); font-size: 0.65rem;">
          {{ item.archetype.commanderNames[0] }}
        </div>
        <div class="font-mono mt-0.5" style="font-size: 0.6rem; color: rgba(160,140,200,0.7);">
          <span
            v-if="item.decision.cardUsed"
            class="px-1 py-0.5 rounded"
            :style="{ background: accent(item.decision.interactionType) + '22', color: accent(item.decision.interactionType) }"
          >{{ item.decision.interactionType }}: {{ item.decision.cardUsed }}</span>
          <span v-else style="opacity: 0.5;">{{ item.decision.interactionType }}</span>
        </div>
        <div
          v-if="settings.showReasoning"
          class="font-mono mt-0.5 leading-tight"
          style="font-size: 0.55rem; color: rgba(120,100,180,0.6);"
        >{{ item.decision.reasoning }}</div>
      </div>

      <button
        class="font-mono opacity-30 hover:opacity-70 transition-opacity flex-shrink-0"
        style="font-size: 0.65rem;"
        @click="interaction.removeItem(item.id)"
      >✕</button>
    </div>
  </div>
</template>
