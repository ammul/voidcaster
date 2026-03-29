<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import type { Phase, Step } from '../../types'

const game = useGameStore()

const phases: { id: Phase; label: string; steps: Step[] }[] = [
  { id: 'beginning', label: 'Begin',  steps: ['untap', 'upkeep', 'draw'] },
  { id: 'main1',     label: 'Main 1', steps: ['main1'] },
  { id: 'combat',    label: 'Combat', steps: ['begin-combat', 'declare-attackers', 'declare-blockers', 'combat-damage', 'end-combat'] },
  { id: 'main2',     label: 'Main 2', steps: ['main2'] },
  { id: 'ending',    label: 'End',    steps: ['end', 'cleanup'] },
]

const stepLabels: Record<Step, string> = {
  untap:               'Untap',
  upkeep:              'Upkeep',
  draw:                'Draw',
  main1:               'Main',
  'begin-combat':      'Begin',
  'declare-attackers': 'Attack',
  'declare-blockers':  'Block',
  'combat-damage':     'Damage',
  'end-combat':        'End',
  main2:               'Main',
  end:                 'End',
  cleanup:             'Cleanup',
}

const currentPhaseSteps = computed(
  () => phases.find(p => p.id === game.currentPhase)?.steps ?? []
)
</script>

<template>
  <div class="flex flex-col items-end gap-0.5 font-mono">
    <!-- Row 1: turn + phase pills -->
    <div class="flex items-center gap-1">
      <span class="text-xs text-slate-500 mr-0.5">T{{ game.turn }}</span>
      <span
        v-for="phase in phases"
        :key="phase.id"
        class="text-xs px-1.5 py-0.5 rounded-md transition-all"
        :style="game.currentPhase === phase.id
          ? 'background: rgba(120,80,255,0.4); color: #e2e8f0; box-shadow: 0 0 8px rgba(120,80,255,0.4);'
          : 'background: rgba(120,80,255,0.08); color: rgba(148,163,184,0.35);'"
      >{{ phase.label }}</span>
    </div>

    <!-- Row 2: step dots for current phase -->
    <div class="flex items-center gap-1">
      <template v-for="step in currentPhaseSteps" :key="step">
        <div class="flex items-center gap-0.5">
          <!-- Dot -->
          <div
            class="rounded-full transition-all"
            :style="game.currentStep === step
              ? 'width: 6px; height: 6px; background: rgba(180,140,255,1); box-shadow: 0 0 6px rgba(180,140,255,0.8);'
              : 'width: 5px; height: 5px; background: rgba(120,80,255,0.25);'"
          />
          <!-- Label (only on active step) -->
          <span
            v-if="game.currentStep === step"
            class="text-violet-300 font-semibold"
            style="font-size: 0.6rem;"
          >{{ stepLabels[step] }}</span>
        </div>
        <!-- Connector line between dots -->
        <div
          v-if="step !== currentPhaseSteps[currentPhaseSteps.length - 1]"
          class="w-2 h-px"
          style="background: rgba(120,80,255,0.2);"
        />
      </template>
    </div>
  </div>
</template>
