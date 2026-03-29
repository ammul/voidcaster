<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ScenarioSelect from './components/ScenarioSelect.vue'
import SimulatorView from './components/SimulatorView.vue'
import LegalFooter from './components/ui/LegalFooter.vue'
import SettingsDrawer from './components/settings/SettingsDrawer.vue'
import { StarField } from './canvas/StarField'
import { useSettingsStore } from './stores/settingsStore'
import type { Scenario, SimulatorMode } from './types'

interface ScenarioSelection {
  scenario: Scenario
  mode: SimulatorMode
}

const activeSelection = ref<ScenarioSelection | null>(null)
const showSettings = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const settings = useSettingsStore()

let starField: StarField | null = null

function handleScenarioSelected(selection: ScenarioSelection) {
  activeSelection.value = selection
}

function handleBackToMenu() {
  activeSelection.value = null
}

onMounted(() => {
  if (settings.starBackground && canvasRef.value) {
    starField = new StarField(canvasRef.value)
  }
  // Apply reduced motion on init
  if (settings.reducedMotion) {
    document.documentElement.classList.add('reduced-motion')
  }
})

onUnmounted(() => {
  starField?.destroy()
})

// Re-create or destroy star field when toggle changes
import { watch } from 'vue'
watch(() => settings.starBackground, (enabled) => {
  if (enabled && canvasRef.value && !starField) {
    starField = new StarField(canvasRef.value)
  } else if (!enabled && starField) {
    starField.destroy()
    starField = null
    // Clear canvas
    if (canvasRef.value) {
      const ctx = canvasRef.value.getContext('2d')
      if (ctx) ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
  }
})

watch(() => settings.reducedMotion, (rm) => {
  if (rm) document.documentElement.classList.add('reduced-motion')
  else document.documentElement.classList.remove('reduced-motion')
})
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background-color: #05050f;">
    <!-- Star canvas layer -->
    <canvas
      v-show="settings.starBackground"
      ref="canvasRef"
      aria-hidden="true"
    />

    <!-- Gear icon (always visible) -->
    <button
      class="fixed top-3 right-4 z-[200] p-2 rounded-lg transition-all"
      style="color: rgba(180,140,255,0.5); background: rgba(10,8,30,0.4);"
      title="Settings"
      aria-label="Open settings"
      @click="showSettings = true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>

    <ScenarioSelect
      v-if="!activeSelection"
      @select="handleScenarioSelected"
    />
    <SimulatorView
      v-else
      :scenario="activeSelection.scenario"
      :mode="activeSelection.mode"
      @back="handleBackToMenu"
    />
    <LegalFooter />

    <!-- Settings drawer overlay -->
    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
  </div>
</template>
