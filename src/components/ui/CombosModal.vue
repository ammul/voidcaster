<script setup lang="ts">
import { ref } from 'vue'
import { ALL_COMBOS } from '../../data/combos'

defineEmits<{ close: [] }>()

const activeTab = ref(0)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[180] flex items-center justify-center"
      style="background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);"
      @click.self="$emit('close')"
    >
      <div
        class="glass rounded-2xl shadow-2xl flex flex-col"
        style="width: 42rem; max-height: 80vh; border: 1px solid rgba(120,80,255,0.25);"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-5 pt-4 pb-3 border-b flex-shrink-0"
          style="border-color: rgba(120,80,255,0.15);"
        >
          <h2 class="font-display text-violet-300 text-base font-semibold tracking-wide">Combo Reference</h2>
          <button class="font-mono text-xs text-slate-500 hover:text-slate-200" @click="$emit('close')">✕</button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 px-4 pt-3 flex-shrink-0">
          <button
            v-for="(combo, i) in ALL_COMBOS"
            :key="combo.id"
            class="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
            :style="activeTab === i
              ? 'background: rgba(120,80,255,0.3); color: rgba(200,170,255,1); border: 1px solid rgba(120,80,255,0.5);'
              : 'background: transparent; color: rgba(148,163,184,0.5); border: 1px solid rgba(120,80,255,0.1);'"
            @click="activeTab = i"
          >{{ combo.name }}</button>
        </div>

        <!-- Combo content -->
        <div class="overflow-y-auto flex-1 px-5 py-4">
          <template v-for="(combo, i) in ALL_COMBOS" :key="combo.id">
            <div v-if="activeTab === i">
              <p class="text-slate-400 text-xs mb-1 leading-relaxed">{{ combo.description }}</p>
              <p class="font-mono text-xs text-violet-400 mb-3 italic">{{ combo.prerequisites }}</p>

              <div class="flex flex-col gap-1.5">
                <div
                  v-for="step in combo.steps"
                  :key="step.stepNumber"
                  class="flex gap-3 rounded-lg px-3 py-2"
                  style="background: rgba(20,15,50,0.5); border: 1px solid rgba(120,80,255,0.08);"
                >
                  <span
                    class="font-mono text-xs font-bold flex-shrink-0 w-5 text-right"
                    style="color: rgba(120,80,255,0.6);"
                  >{{ step.stepNumber }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-slate-200 text-xs leading-relaxed">{{ step.action }}</p>
                    <div v-if="step.highlightCards?.length" class="flex flex-wrap gap-1 mt-1">
                      <span
                        v-for="card in step.highlightCards"
                        :key="card"
                        class="font-mono text-xs px-1 py-0.5 rounded"
                        style="background: rgba(0,220,255,0.06); border: 1px solid rgba(0,220,255,0.15); color: rgba(0,220,255,0.7); font-size: 0.6rem;"
                      >{{ card }}</span>
                    </div>
                  </div>
                  <div v-if="step.manaChange || step.lifeChange" class="flex-shrink-0 flex flex-col items-end gap-0.5">
                    <span
                      v-for="(delta, type) in step.manaChange"
                      :key="type"
                      class="font-mono text-xs"
                      style="color: rgba(140,200,140,0.8); font-size: 0.6rem;"
                    >+{{ delta }}{{ type }}</span>
                    <span v-if="step.lifeChange" class="font-mono text-xs" style="color: rgba(255,120,120,0.8); font-size: 0.6rem;">{{ step.lifeChange }} life</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
