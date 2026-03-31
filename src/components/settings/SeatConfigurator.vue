<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'
import { ARCHETYPES } from '../../data/archetypes'
import { useScryfallStore } from '../../stores/scryfallStore'

const props = defineProps<{ seatIndex: 0 | 1 | 2 }>()

const settings = useSettingsStore()
const scryfall = useScryfallStore()

const pinned = computed(() => settings.seatArchetypes[props.seatIndex])
const effectiveId = computed(() => settings.getEffectiveArchetypeId(props.seatIndex))
const archetype = computed(() => ARCHETYPES.find(a => a.id === effectiveId.value) ?? ARCHETYPES[0])

// Portrait art_crop URL — use first commander name
const portraitUrl = ref<string | null>(null)

import { watch, onMounted } from 'vue'

async function loadPortrait(name: string) {
  portraitUrl.value = null
  try {
    const url = await scryfall.getArtCropUrl(name)
    portraitUrl.value = url
  } catch {
    portraitUrl.value = null
  }
}

watch(effectiveId, () => {
  loadPortrait(archetype.value.commanderNames[0])
}, { immediate: true })

onMounted(() => {
  loadPortrait(archetype.value.commanderNames[0])
})

function onSelectChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  settings.setSeatArchetype(props.seatIndex, val === 'auto' ? null : val)
}
</script>

<template>
  <div class="glass rounded-xl p-3 flex flex-col gap-2" :data-testid="`seat-config-${seatIndex}`">
    <div class="font-mono text-xs" style="color: rgba(120,80,255,0.7);">Seat {{ seatIndex + 1 }}</div>

    <!-- Commander portrait -->
    <div
      class="w-full aspect-video rounded-lg overflow-hidden relative"
      style="background: rgba(10,8,30,0.6);"
    >
      <img
        v-if="portraitUrl"
        :src="portraitUrl"
        :alt="archetype.commanderNames[0]"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center font-mono text-xs" style="color: rgba(120,80,255,0.4);">
        Loading…
      </div>
    </div>

    <!-- Commander name -->
    <div class="font-display text-xs" style="color: rgba(200,170,255,0.9);">
      {{ archetype.commanderNames.join(' / ') }}
    </div>

    <!-- Color pips -->
    <div class="flex gap-1">
      <span
        v-for="c in archetype.colors"
        :key="c"
        class="font-mono text-xs px-1.5 py-0.5 rounded"
        style="background: rgba(120,80,255,0.15); border: 1px solid rgba(120,80,255,0.3);"
        :title="c"
      >{{ c }}</span>
    </div>

    <!-- Archetype select -->
    <select
      class="rounded-lg px-2 py-1.5 font-mono text-xs w-full"
      style="background: rgba(10,8,30,0.8); border: 1px solid rgba(120,80,255,0.3); color: rgba(180,140,255,0.9);"
      :value="pinned ?? 'auto'"
      @change="onSelectChange"
      :data-seat="seatIndex"
    >
      <option value="auto">Auto (from meta profile)</option>
      <option v-for="a in ARCHETYPES" :key="a.id" :value="a.id">
        {{ a.commanderNames.join(' / ') }}
      </option>
    </select>
  </div>
</template>
