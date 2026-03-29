<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { useGameStore } from '../../stores/gameStore'
import type { ManaType } from '../../types'

const game = useGameStore()
const mana = computed(() => game.manaPool)

// Pentagon layout (clockwise from top): W, U, B, R, G — C in center
// Container: 96×112px, pentagon center (48, 62), radius 34px
interface ManaConfig {
  type: ManaType; bg: string; border: string; textColor: string; dimBg: string; cx: number; cy: number
}
const manaConfig: ManaConfig[] = [
  { type: 'W', bg: '#f5f0d8', border: '#c8a850', textColor: '#5a4500', dimBg: '#3a3020', cx: 48, cy: 28 },
  { type: 'U', bg: '#1565a0', border: '#4da6e0', textColor: '#daeeff', dimBg: '#101e30', cx: 80, cy: 50 },
  { type: 'B', bg: '#2a1a36', border: '#8060a8', textColor: '#c8a8e0', dimBg: '#150c1e', cx: 68, cy: 84 },
  { type: 'R', bg: '#aa2010', border: '#e06040', textColor: '#ffe0c0', dimBg: '#350a04', cx: 28, cy: 84 },
  { type: 'G', bg: '#1a5a20', border: '#50b050', textColor: '#b8f0a0', dimBg: '#081808', cx: 16, cy: 50 },
  { type: 'C', bg: '#3a3848', border: '#7878a0', textColor: '#c0c0d0', dimBg: '#1a1828', cx: 48, cy: 62 },
]

function onLeft(type: ManaType) { game.adjustMana(type, 1) }
function onRight(e: MouseEvent, type: ManaType) { e.preventDefault(); game.adjustMana(type, -1) }

// ── Drag ────────────────────────────────────────────────────────────────────
const pos = ref({ x: 20, y: 20 })
const dragging = ref(false)
const dragOrigin = ref({ mx: 0, my: 0, px: 0, py: 0 })

function onDragHandleMouseDown(e: MouseEvent) {
  if (e.button !== 0) return
  dragging.value = true
  dragOrigin.value = { mx: e.clientX, my: e.clientY, px: pos.value.x, py: pos.value.y }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!dragging.value) return
  pos.value = {
    x: dragOrigin.value.px + (e.clientX - dragOrigin.value.mx),
    y: dragOrigin.value.py + (e.clientY - dragOrigin.value.my),
  }
}

function onMouseUp() {
  dragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div
    class="absolute z-[90] select-none rounded-xl overflow-hidden"
    :style="{
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      background: 'rgba(8,6,22,0.88)',
      border: '1px solid rgba(120,80,255,0.25)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.5), inset 0 0 20px rgba(120,80,255,0.04)',
      backdropFilter: 'blur(12px)',
      width: '108px',
    }"
  >
    <!-- Drag handle -->
    <div
      class="flex items-center justify-between px-2 py-1"
      style="background: rgba(120,80,255,0.08); border-bottom: 1px solid rgba(120,80,255,0.12); cursor: grab;"
      :style="dragging ? 'cursor: grabbing;' : ''"
      @mousedown="onDragHandleMouseDown"
    >
      <span class="font-mono text-violet-400 opacity-60" style="font-size: 0.55rem; letter-spacing: 0.1em;">MANA</span>
      <span class="font-mono opacity-30" style="font-size: 0.55rem; color: #a0a0c0;">⠿</span>
    </div>

    <!-- Color wheel -->
    <div class="relative" style="width: 96px; height: 112px; margin: 0 auto;">
      <div
        v-for="m in manaConfig"
        :key="m.type"
        class="absolute flex items-center justify-center rounded-full cursor-pointer transition-all active:scale-90"
        :style="{
          width: '26px',
          height: '26px',
          left: `${m.cx - 13}px`,
          top: `${m.cy - 13}px`,
          background: mana[m.type] > 0 ? m.bg : m.dimBg,
          border: `1.5px solid ${mana[m.type] > 0 ? m.border : 'rgba(60,50,80,0.5)'}`,
          color: mana[m.type] > 0 ? m.textColor : 'rgba(100,90,120,0.5)',
          fontSize: mana[m.type] >= 10 ? '8px' : '11px',
          fontFamily: '\'JetBrains Mono\', monospace',
          fontWeight: 'bold',
          boxShadow: mana[m.type] > 0 ? `0 0 8px ${m.border}99` : 'none',
          zIndex: m.type === 'C' ? 1 : 2,
          transition: 'background 0.12s, border 0.12s, box-shadow 0.12s',
        }"
        :title="`${m.type}: ${mana[m.type]} — left-click +1, right-click −1`"
        @click.stop="onLeft(m.type)"
        @contextmenu.stop="onRight($event, m.type)"
      >{{ mana[m.type] > 0 ? mana[m.type] : m.type }}</div>
    </div>

    <!-- Total -->
    <div
      class="text-center font-mono pb-1.5"
      style="font-size: 0.5rem; color: rgba(120,100,180,0.45);"
    >{{ Object.values(mana).reduce((a, b) => a + b, 0) }} floating</div>
  </div>
</template>
