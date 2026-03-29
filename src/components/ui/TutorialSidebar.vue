<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTutorialStore } from '../../stores/tutorialStore'

const tutorial = useTutorialStore()
const collapsed = ref(false)

const progress = computed(() =>
  tutorial.totalSteps > 0
    ? Math.round((tutorial.currentStepIndex / tutorial.totalSteps) * 100)
    : 0
)
</script>

<template>
  <div
    class="border-r flex flex-col transition-all duration-200"
    :style="{
      width: collapsed ? '2rem' : '16rem',
      background: 'rgba(10, 8, 30, 0.7)',
      backdropFilter: 'blur(12px)',
      borderColor: 'rgba(120, 80, 255, 0.2)',
    }"
  >
    <button
      class="self-end p-2 text-slate-500 hover:text-slate-200 transition-colors font-mono text-sm"
      @click="collapsed = !collapsed"
    >
      {{ collapsed ? '›' : '‹' }}
    </button>

    <div v-if="!collapsed" class="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
      <!-- Combo info -->
      <div v-if="tutorial.currentCombo">
        <h3 class="font-display text-violet-300 text-sm font-semibold mb-1">
          {{ tutorial.currentCombo.name }}
        </h3>
        <p class="font-mono text-slate-500 text-xs leading-relaxed">
          {{ tutorial.currentCombo.prerequisites }}
        </p>
      </div>

      <!-- Progress bar -->
      <div>
        <div class="w-full rounded-full h-1 mb-1" style="background: rgba(120,80,255,0.15);">
          <div
            class="h-1 rounded-full transition-all"
            style="background: rgba(120,80,255,0.6);"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <span class="font-mono text-xs text-slate-600">
          Step {{ tutorial.currentStepIndex }} / {{ tutorial.totalSteps }}
        </span>
      </div>

      <!-- Current step -->
      <div
        v-if="tutorial.currentStep && !tutorial.isComplete"
        class="rounded-xl p-3"
        style="background: rgba(120,80,255,0.06); border: 1px solid rgba(120,80,255,0.2);"
      >
        <span class="font-mono text-xs font-semibold text-violet-400">
          Step {{ tutorial.currentStep.stepNumber }}
        </span>
        <p class="text-sm text-slate-200 mt-1 leading-relaxed">
          {{ tutorial.currentStep.action }}
        </p>
        <div v-if="tutorial.currentStep.highlightCards?.length" class="mt-2">
          <span class="font-mono text-xs text-slate-600">Cards involved:</span>
          <div class="flex flex-wrap gap-1 mt-1">
            <span
              v-for="card in tutorial.currentStep.highlightCards"
              :key="card"
              class="font-mono text-xs px-1.5 py-0.5 rounded-lg"
              style="background: rgba(0,220,255,0.08); border: 1px solid rgba(0,220,255,0.2); color: rgba(0,220,255,0.8);"
            >
              {{ card }}
            </span>
          </div>
        </div>
      </div>

      <!-- Completion -->
      <div
        v-if="tutorial.isComplete"
        class="text-center p-4 rounded-xl"
        style="background: rgba(72,187,120,0.08); border: 1px solid rgba(72,187,120,0.2);"
      >
        <p class="font-display text-green-400 font-semibold text-lg">Combo Complete!</p>
        <p class="text-slate-400 text-sm mt-1">You've completed the combo line.</p>
        <button
          class="mt-3 font-mono text-xs text-slate-500 hover:text-slate-200 transition-colors"
          @click="tutorial.reset()"
        >
          Restart →
        </button>
      </div>

      <!-- Validation hint -->
      <div
        v-if="!tutorial.isComplete && !tutorial.canAdvance && tutorial.currentStep?.validate"
        class="rounded-lg px-2 py-1.5 text-center"
        style="background: rgba(255,80,80,0.07); border: 1px solid rgba(255,80,80,0.2);"
      >
        <span class="font-mono text-xs" style="color: rgba(255,120,120,0.8);">Complete this step first</span>
      </div>

      <!-- Controls -->
      <div class="flex gap-2 mt-auto pt-2">
        <button
          class="flex-1 text-sm py-2 rounded-xl font-mono transition-all"
          style="border: 1px solid rgba(120,80,255,0.2); color: rgba(148,163,184,0.7);"
          @click="tutorial.reset()"
        >Reset</button>
        <button
          class="flex-1 text-sm py-2 rounded-xl font-mono transition-all"
          :disabled="!tutorial.canAdvance"
          :style="!tutorial.canAdvance
            ? 'border: 1px solid rgba(0,220,255,0.1); color: rgba(0,220,255,0.3); cursor: not-allowed;'
            : 'border: 1px solid rgba(0,220,255,0.4); color: rgba(0,220,255,0.9); box-shadow: 0 0 12px rgba(0,220,255,0.1);'"
          @click="tutorial.nextStep()"
        >Next Phase</button>
      </div>
    </div>
  </div>
</template>
