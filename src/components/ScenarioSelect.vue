<script setup lang="ts">
import { ref } from 'vue'
import type { Scenario, SimulatorMode } from '../types'
import { ALL_COMBOS } from '../data/combos'
import { useSettingsStore } from '../stores/settingsStore'

const emit = defineEmits<{
  select: [{ scenario: Scenario; mode: SimulatorMode }]
}>()

const settings = useSettingsStore()
const scenarios = ALL_COMBOS
const showInteractionInfo = ref(false)

function select(id: string, mode: SimulatorMode) {
  emit('select', { scenario: id as Scenario, mode })
}
</script>

<template>
  <div class="flex-1 flex flex-col items-center justify-center p-8">
    <h1 class="font-display text-5xl font-bold text-blue-300 mb-3 tracking-widest">Voidcaster</h1>
    <p class="font-mono text-slate-500 mb-10 text-sm tracking-widest uppercase">
      cEDH · Inalla Archmage Ritualist · Combo Simulator
    </p>

    <!-- Interaction mode toggle -->
    <div class="flex items-center gap-3 mb-10">
      <button
        class="flex items-center gap-2 font-mono text-sm px-4 py-2 rounded-xl transition-all"
        :style="settings.interactionEnabled
          ? 'border: 1px solid rgba(120,80,255,0.6); color: rgba(180,140,255,1); background: rgba(120,80,255,0.15);'
          : 'border: 1px solid rgba(120,80,255,0.2); color: rgba(120,80,255,0.5); background: transparent;'"
        @click="settings.interactionEnabled = !settings.interactionEnabled"
      >
        <span
          class="inline-block w-3 h-3 rounded-full transition-colors"
          :style="settings.interactionEnabled
            ? 'background: rgba(180,140,255,1); box-shadow: 0 0 6px rgba(180,140,255,0.8);'
            : 'background: rgba(80,60,120,0.4);'"
        />
        Interaction Mode
      </button>

      <!-- Info icon -->
      <div class="relative">
        <button
          class="font-mono text-slate-600 hover:text-slate-400 transition-colors"
          style="font-size: 0.85rem;"
          @mouseenter="showInteractionInfo = true"
          @mouseleave="showInteractionInfo = false"
        >ⓘ</button>
        <div
          v-if="showInteractionInfo"
          class="absolute glass rounded-xl px-3 py-2.5 text-xs font-mono z-50"
          style="bottom: 1.8rem; left: 50%; transform: translateX(-50%); width: 18rem; color: rgba(160,140,200,0.85); pointer-events: none;"
        >
          When enabled, 3 simulated cEDH opponents evaluate your actions using heuristic AI. They may counter spells, remove key creatures, or deploy stax pieces. Reactions appear when non-land permanents enter the battlefield.
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="glass rounded-2xl p-6 cursor-default transition-all duration-300 hover:-translate-y-1"
        style="box-shadow: inset 0 0 40px rgba(120,80,255,0.06);"
      >
        <h2 class="font-display text-xl font-semibold text-violet-200 mb-3">{{ scenario.name }}</h2>
        <p class="text-slate-400 text-sm mb-3 leading-relaxed">{{ scenario.description }}</p>
        <p class="font-mono text-xs text-slate-600 italic mb-6">{{ scenario.prerequisites }}</p>

        <div class="flex gap-3">
          <button
            class="flex-1 border border-violet-600 text-violet-300 hover:bg-violet-900/30 text-sm font-medium py-2 px-3 rounded-xl transition-all hover:shadow-lg hover:shadow-violet-900/30"
            @click="select(scenario.id, 'tutorial')"
          >Tutorial</button>
          <button
            class="flex-1 border border-cyan-700 text-cyan-300 hover:bg-cyan-900/20 text-sm font-medium py-2 px-3 rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-900/30"
            @click="select(scenario.id, 'freeplay')"
          >Free Play</button>
        </div>
      </div>
    </div>
  </div>
</template>
