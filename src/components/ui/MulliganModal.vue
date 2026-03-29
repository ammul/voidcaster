<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'

const emit = defineEmits<{ done: [] }>()

const game = useGameStore()

// Cards to put on the bottom (London mulligan: N = mulliganCount)
const bottomSelected = ref<Set<string>>(new Set())

const needsBottom = computed(() => game.mulliganCount)
const canKeep = computed(() =>
  needsBottom.value === 0 || bottomSelected.value.size === needsBottom.value
)

function toggleBottom(instanceId: string) {
  if (bottomSelected.value.has(instanceId)) {
    bottomSelected.value.delete(instanceId)
  } else if (bottomSelected.value.size < needsBottom.value) {
    bottomSelected.value.add(instanceId)
  }
  // Force reactivity
  bottomSelected.value = new Set(bottomSelected.value)
}

function mulligan() {
  bottomSelected.value = new Set()
  game.doMulligan()
}

function keep() {
  // Put selected cards on the bottom of the library in selection order
  for (const id of bottomSelected.value) {
    game.moveCard(id, 'library')
    game.putOnBottom(id)
  }
  emit('done')
}
</script>

<template>
  <div class="fixed inset-0 z-[300] flex items-center justify-center" style="background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);">
    <div class="glass rounded-2xl p-6 w-full max-w-3xl shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-display text-xl text-violet-200 font-semibold">
            Opening Hand
            <span v-if="game.mulliganCount > 0" class="font-mono text-sm text-slate-500 ml-2">
              (Mulligan {{ game.mulliganCount }})
            </span>
          </h2>
          <p v-if="needsBottom > 0" class="font-mono text-xs text-amber-400 mt-0.5">
            Select {{ needsBottom - bottomSelected.size }} more card{{ needsBottom - bottomSelected.size !== 1 ? 's' : '' }} to put on the bottom
          </p>
          <p v-else class="font-mono text-xs text-slate-500 mt-0.5">
            Keep this hand or take a mulligan
          </p>
        </div>
        <span class="font-mono text-xs text-slate-600">{{ game.hand.length }} cards</span>
      </div>

      <!-- Cards -->
      <div class="flex flex-wrap gap-2 justify-center mb-6">
        <div
          v-for="card in game.hand"
          :key="card.instanceId"
          class="relative rounded-xl p-3 cursor-pointer transition-all border"
          :class="bottomSelected.has(card.instanceId)
            ? 'border-amber-500 bg-amber-950/40 opacity-50'
            : 'border-slate-700 bg-slate-900/50 hover:border-violet-500'"
          style="width: 10rem;"
          @click="needsBottom > 0 ? toggleBottom(card.instanceId) : null"
        >
          <!-- Thumbnail if image loaded -->
          <img
            v-if="card.normalImageUrl"
            :src="card.normalImageUrl"
            :alt="card.name"
            class="w-full rounded-lg mb-2"
            style="aspect-ratio: 63/88; object-fit: cover; object-position: top;"
          />
          <!-- Text fallback -->
          <div v-else class="w-full rounded-lg mb-2 flex items-center justify-center" style="aspect-ratio: 63/88; background: rgba(30,20,60,0.8);">
            <span class="font-mono text-xs text-slate-400 text-center px-1">{{ card.name }}</span>
          </div>

          <p class="font-mono text-xs text-slate-300 text-center truncate">{{ card.name }}</p>
          <p class="font-mono text-xs text-slate-600 text-center truncate">{{ card.scryfallData?.type_line ?? '…' }}</p>

          <!-- Bottom indicator -->
          <div
            v-if="bottomSelected.has(card.instanceId)"
            class="absolute inset-0 flex items-center justify-center rounded-xl"
            style="background: rgba(180,100,0,0.15);"
          >
            <span class="font-mono text-xs text-amber-400 font-bold">BOTTOM</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between items-center">
        <button
          class="font-mono text-sm px-6 py-2 rounded-xl transition-all"
          style="border: 1px solid rgba(120,80,255,0.3); color: rgba(148,163,184,0.7);"
          @click="mulligan"
        >
          Mulligan → {{ game.mulliganCount + 1 }}
        </button>

        <div class="font-mono text-xs text-slate-600 text-center">
          London Mulligan · draw 7, put {{ needsBottom }} on bottom
        </div>

        <button
          class="font-mono text-sm px-6 py-2 rounded-xl transition-all"
          :disabled="!canKeep"
          :style="canKeep
            ? 'border: 1px solid rgba(0,220,255,0.5); color: rgba(0,220,255,0.9); box-shadow: 0 0 12px rgba(0,220,255,0.1);'
            : 'border: 1px solid rgba(0,220,255,0.15); color: rgba(0,220,255,0.3); cursor: not-allowed;'"
          @click="keep"
        >
          Keep
        </button>
      </div>
    </div>
  </div>
</template>
