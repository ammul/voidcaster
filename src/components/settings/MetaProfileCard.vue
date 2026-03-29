<script setup lang="ts">
import type { MetaProfile } from '../../stores/settingsStore'

const props = defineProps<{
  id: MetaProfile
  label: string
  description: string
  selected: boolean
}>()

const emit = defineEmits<{ select: [id: MetaProfile] }>()
</script>

<template>
  <button
    class="text-left rounded-xl px-4 py-3 transition-all border w-full"
    :style="selected
      ? 'background: rgba(120,80,255,0.18); border-color: rgba(120,80,255,0.5); box-shadow: 0 0 12px rgba(120,80,255,0.2);'
      : 'background: rgba(10,8,30,0.4); border-color: rgba(120,80,255,0.15);'"
    @click="emit('select', props.id)"
  >
    <div class="font-display text-sm" :style="selected ? 'color: rgba(200,170,255,1);' : 'color: rgba(180,140,255,0.7);'">
      {{ label }}
    </div>
    <div class="font-mono text-xs mt-0.5" style="color: rgba(100,80,140,0.8);">{{ description }}</div>
  </button>
</template>
