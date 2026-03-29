<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import type { ManaType } from '../../types'

const game = useGameStore()
const mana = computed(() => game.manaPool)

interface ManaConfig {
  type: ManaType
  bg: string
  border: string
  textColor: string
  cx: number
  cy: number
  dimBg: string
}

// Pentagon layout (clockwise from top): W, U, B, R, G — C in center
// Container: 76px × 90px, pentagon center (38, 48), radius 26px
const manaConfig: ManaConfig[] = [
  { type: 'W', bg: '#f5f0d8', border: '#c8a850', textColor: '#5a4500', dimBg: '#4a4030', cx: 38, cy: 22 },
  { type: 'U', bg: '#1565a0', border: '#4da6e0', textColor: '#daeeff', dimBg: '#152840', cx: 63, cy: 40 },
  { type: 'B', bg: '#2a1a36', border: '#8060a8', textColor: '#c8a8e0', dimBg: '#1a1020', cx: 53, cy: 68 },
  { type: 'R', bg: '#aa2010', border: '#e06040', textColor: '#ffe0c0', dimBg: '#3a1808', cx: 23, cy: 68 },
  { type: 'G', bg: '#1a5a20', border: '#50b050', textColor: '#b8f0a0', dimBg: '#0a2010', cx: 13, cy: 40 },
  { type: 'C', bg: '#3a3848', border: '#7878a0', textColor: '#c0c0d0', dimBg: '#22202e', cx: 38, cy: 48 },
]

function onLeft(type: ManaType) {
  game.adjustMana(type, 1)
}

function onRight(e: MouseEvent, type: ManaType) {
  e.preventDefault()
  game.adjustMana(type, -1)
}
</script>

<template>
  <div class="flex flex-col items-center gap-1 w-full">
    <span class="zone-label text-center" style="font-size: 0.6rem;">Mana</span>

    <!-- Color wheel -->
    <div class="relative select-none" style="width: 76px; height: 90px;">
      <div
        v-for="m in manaConfig"
        :key="m.type"
        class="absolute flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-90"
        :style="{
          width: '22px',
          height: '22px',
          left: `${m.cx - 11}px`,
          top: `${m.cy - 11}px`,
          background: mana[m.type] > 0 ? m.bg : m.dimBg,
          border: `1.5px solid ${mana[m.type] > 0 ? m.border : 'rgba(80,70,100,0.4)'}`,
          color: mana[m.type] > 0 ? m.textColor : 'rgba(140,130,160,0.5)',
          fontSize: mana[m.type] >= 10 ? '8px' : '10px',
          fontFamily: '\'JetBrains Mono\', monospace',
          fontWeight: 'bold',
          boxShadow: mana[m.type] > 0 ? `0 0 7px ${m.border}88` : 'none',
          zIndex: m.type === 'C' ? 1 : 2,
          transition: 'background 0.15s, border 0.15s, box-shadow 0.15s',
        }"
        :title="`${m.type}: ${mana[m.type]} — left-click +1, right-click −1`"
        @click="onLeft(m.type)"
        @contextmenu="onRight($event, m.type)"
      >
        {{ mana[m.type] > 0 ? mana[m.type] : m.type }}
      </div>
    </div>

    <!-- Total mana indicator -->
    <span
      class="font-mono text-center"
      style="font-size: 0.55rem; color: rgba(140,120,200,0.5);"
    >{{ Object.values(mana).reduce((a, b) => a + b, 0) }} total</span>
  </div>
</template>
