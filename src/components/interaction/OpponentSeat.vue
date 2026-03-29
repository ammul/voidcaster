<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'
import { useScryfallStore } from '../../stores/scryfallStore'
import { ARCHETYPES_BY_ID } from '../../data/archetypes'

const props = defineProps<{ seatIndex: 0 | 1 | 2 }>()

const settings = useSettingsStore()
const scryfall = useScryfallStore()

const archetype = computed(() =>
  ARCHETYPES_BY_ID[settings.getEffectiveArchetypeId(props.seatIndex)]
)

const portraitUrl = ref<string | null>(null)

watch(
  () => archetype.value.id,
  async () => {
    portraitUrl.value = await scryfall.getArtCropUrl(archetype.value.commanderNames[0])
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="flex flex-col items-center gap-1 w-20"
    :data-seat="seatIndex"
    :data-testid="`opponent-seat-${seatIndex}`"
  >
    <div
      class="w-14 h-14 rounded-full overflow-hidden border-2"
      style="border-color: rgba(120,80,255,0.4); box-shadow: 0 0 12px rgba(120,80,255,0.2);"
    >
      <img
        v-if="portraitUrl"
        :src="portraitUrl"
        :alt="archetype.commanderNames[0]"
        class="w-full h-full object-cover"
        :data-testid="`opponent-portrait-${seatIndex}`"
      />
      <div v-else class="w-full h-full flex items-center justify-center" style="background: rgba(10,8,30,0.8);">
        <span class="font-mono text-xs" style="color: rgba(120,80,255,0.4);">?</span>
      </div>
    </div>
    <div class="font-mono text-xs text-center leading-tight" style="color: rgba(180,140,255,0.6); max-width: 5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
      Seat {{ seatIndex + 1 }}
    </div>
  </div>
</template>
