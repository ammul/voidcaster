<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import type { GameCard } from '../../types'

const game = useGameStore()
const graveyard = computed(() => game.graveyard)
const topCard = computed<GameCard | null>(() => graveyard.value[graveyard.value.length - 1] ?? null)

// Two view modes: 'modal' (original with move buttons), 'list' (stacked name+cost with hover preview)
const showModal = ref(false)
const showList = ref(false)
const hoveredCard = ref<GameCard | null>(null)
const hoverPos = ref({ x: 0, y: 0 })

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  const id = e.dataTransfer?.getData('text/plain')
  if (id) game.moveCard(id, 'graveyard')
}

function onRowMouseEnter(e: MouseEvent, card: GameCard) {
  hoveredCard.value = card
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  hoverPos.value = { x: rect.right + 8, y: Math.min(rect.top - 30, window.innerHeight - 240) }
}

function onRowMouseLeave() {
  hoveredCard.value = null
}
</script>

<template>
  <div class="relative flex flex-col items-center gap-1">
    <div class="flex items-center gap-1">
      <span class="zone-label">GY</span>
      <!-- Stacked list toggle -->
      <button
        class="font-mono transition-colors rounded px-1"
        style="font-size: 0.55rem; border: 1px solid rgba(120,80,255,0.2);"
        :style="showList
          ? 'color: rgba(180,140,255,1); background: rgba(120,80,255,0.25);'
          : 'color: rgba(120,80,255,0.5); background: transparent;'"
        title="Toggle stacked list view"
        @click="showList = !showList"
      >≡</button>
    </div>

    <!-- Pile with top card preview -->
    <div
      class="zone-base rounded-xl overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all relative"
      style="width: 6rem; height: 8.5rem;"
      @click="showModal = !showModal"
      @dragover="onDragOver"
      @drop="onDrop"
      :title="`Graveyard (${graveyard.length}) — click to manage`"
    >
      <!-- Top card preview image -->
      <img
        v-if="topCard?.normalImageUrl"
        :src="topCard.normalImageUrl"
        :alt="topCard.name"
        class="absolute inset-0 w-full h-full object-cover object-top opacity-70"
      />
      <!-- Overlay with count -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-end pb-2"
        style="background: linear-gradient(to top, rgba(5,5,20,0.85) 40%, transparent 100%);"
      >
        <span class="font-mono text-slate-300 text-xl font-bold leading-none">{{ graveyard.length }}</span>
        <span class="font-mono text-slate-500 text-xs">cards</span>
      </div>
      <!-- Empty state -->
      <span v-if="!graveyard.length" class="font-mono text-slate-600 text-xs z-10">empty</span>
    </div>

    <Teleport to="body">
      <!-- ── Stacked list panel (name + cost, hover preview) ────────────────── -->
      <div
        v-if="showList"
        class="fixed z-[160] glass rounded-2xl shadow-2xl"
        style="width: 18rem; max-height: 65vh; top: 8rem; right: 7rem; overflow: hidden;"
      >
        <div
          class="flex items-center justify-between px-3 pt-3 pb-2 border-b"
          style="border-color: rgba(120,80,255,0.15);"
        >
          <h3 class="font-display text-violet-300 text-xs font-semibold tracking-wide">
            Graveyard ({{ graveyard.length }})
          </h3>
          <button
            class="font-mono text-xs text-slate-500 hover:text-slate-200"
            @click="showList = false"
          >✕</button>
        </div>

        <div class="overflow-y-auto p-2 flex flex-col gap-1" style="max-height: calc(65vh - 3rem);">
          <div v-if="!graveyard.length" class="font-mono text-xs text-slate-600 text-center py-3">Empty</div>

          <div
            v-for="card in [...graveyard].reverse()"
            :key="card.instanceId"
            class="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 cursor-default"
            style="border: 1px solid rgba(120,80,255,0.1); background: rgba(20,15,50,0.5);"
            draggable="true"
            @dragstart="(e) => { e.dataTransfer?.setData('text/plain', card.instanceId); showList = false }"
            @mouseenter="onRowMouseEnter($event, card)"
            @mouseleave="onRowMouseLeave"
          >
            <span class="text-slate-200 text-xs font-semibold truncate flex-1">{{ card.name }}</span>
            <span class="font-mono text-violet-300 shrink-0" style="font-size: 0.6rem;">
              {{ card.scryfallData?.mana_cost ?? (card.isLoading ? '…' : '') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Hover card image preview for list view -->
      <div
        v-if="hoveredCard?.normalImageUrl && showList"
        class="fixed z-[200] pointer-events-none rounded-xl overflow-hidden shadow-2xl"
        :style="{ left: `${hoverPos.x}px`, top: `${hoverPos.y}px`, width: '160px', height: '224px' }"
        style="box-shadow: 0 0 20px rgba(120,80,255,0.4);"
      >
        <img
          :src="hoveredCard.normalImageUrl"
          :alt="hoveredCard.name"
          class="w-full h-full object-cover object-top"
        />
      </div>

      <!-- ── Modal panel (manage: move cards) ──────────────────────────────── -->
      <div
        v-if="showModal"
        class="fixed z-[150] glass rounded-2xl shadow-2xl"
        style="width: 22rem; max-height: 70vh; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      >
        <div
          class="flex items-center justify-between px-4 pt-4 pb-2 border-b"
          style="border-color: rgba(120,80,255,0.15);"
        >
          <h3 class="font-display text-violet-300 text-sm font-semibold">Graveyard ({{ graveyard.length }})</h3>
          <button
            class="font-mono text-xs text-slate-500 hover:text-slate-200"
            @click="showModal = false"
          >✕</button>
        </div>

        <div class="overflow-y-auto p-3 flex flex-col gap-2" style="max-height: calc(70vh - 3.5rem);">
          <div v-if="!graveyard.length" class="font-mono text-xs text-slate-600 text-center py-4">Empty</div>

          <div
            v-for="card in [...graveyard].reverse()"
            :key="card.instanceId"
            class="flex items-center gap-3 rounded-xl p-2 cursor-pointer transition-all"
            style="border: 1px solid rgba(120,80,255,0.1); background: rgba(20,15,50,0.5);"
            draggable="true"
            @dragstart="(e) => { e.dataTransfer?.setData('text/plain', card.instanceId); showModal = false }"
          >
            <img
              v-if="card.normalImageUrl"
              :src="card.normalImageUrl"
              :alt="card.name"
              class="rounded-lg flex-shrink-0"
              style="width: 2.8rem; height: 3.9rem; object-fit: cover; object-position: top;"
            />
            <div
              v-else
              class="rounded-lg flex-shrink-0 flex items-center justify-center"
              style="width: 2.8rem; height: 3.9rem; background: rgba(30,20,60,0.8);"
            >
              <span class="font-mono text-slate-600" style="font-size: 0.45rem;">{{ card.name.slice(0, 8) }}</span>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-slate-200 text-xs font-semibold truncate">{{ card.name }}</p>
              <p class="font-mono text-slate-500 text-xs italic truncate">{{ card.scryfallData?.type_line ?? '…' }}</p>
              <div class="flex gap-1 mt-1">
                <button
                  class="font-mono text-xs px-1.5 py-0.5 rounded transition-colors"
                  style="border: 1px solid rgba(0,220,255,0.2); color: rgba(0,220,255,0.6);"
                  @click="game.moveCard(card.instanceId, 'hand')"
                >Hand</button>
                <button
                  class="font-mono text-xs px-1.5 py-0.5 rounded transition-colors"
                  style="border: 1px solid rgba(120,80,255,0.2); color: rgba(180,140,255,0.6);"
                  @click="game.moveCard(card.instanceId, 'battlefield')"
                >Battlefield</button>
                <button
                  class="font-mono text-xs px-1.5 py-0.5 rounded transition-colors"
                  style="border: 1px solid rgba(255,80,80,0.2); color: rgba(255,120,120,0.6);"
                  @click="game.moveCard(card.instanceId, 'exile')"
                >Exile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
