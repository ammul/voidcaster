<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore, META_PROFILES } from '../../stores/settingsStore'
import MetaProfileCard from './MetaProfileCard.vue'
import SeatConfigurator from './SeatConfigurator.vue'

const emit = defineEmits<{ close: [] }>()
const settings = useSettingsStore()

const seedInput = ref(settings.seedHex)

function applySeed() {
  settings.seedHex = seedInput.value
  seedInput.value = settings.seedHex  // normalise
}

function reroll() {
  settings.rerollSeed()
  seedInput.value = settings.seedHex
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

function onBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop === 'true') emit('close')
}
</script>

<template>
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-[300]"
    style="background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);"
    data-backdrop="true"
    data-testid="settings-drawer"
    @click="onBackdropClick"
  >
    <!-- Drawer -->
    <div
      class="absolute top-0 right-0 h-full w-96 max-w-full overflow-y-auto"
      style="background: rgba(8,6,24,0.97); border-left: 1px solid rgba(120,80,255,0.25); backdrop-filter: blur(12px);"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b" style="border-color: rgba(120,80,255,0.15);">
        <h2 class="font-display text-lg" style="color: rgba(200,170,255,0.95);">Settings</h2>
        <button
          class="font-mono text-xs px-2 py-1 rounded transition-colors"
          style="color: rgba(120,80,255,0.6); border: 1px solid rgba(120,80,255,0.2);"
          @click="emit('close')"
          aria-label="Close settings"
        >✕ ESC</button>
      </div>

      <div class="p-5 flex flex-col gap-6">

        <!-- Interaction Mode -->
        <section>
          <h3 class="font-display text-sm mb-3" style="color: rgba(180,140,255,0.8); letter-spacing: 0.08em;">
            Interaction Mode
          </h3>
          <div class="flex flex-col gap-2.5">
            <label class="flex items-center justify-between">
              <span class="font-mono text-xs" style="color: rgba(200,170,255,0.7);">Enable interaction mode</span>
              <button
                role="switch"
                :aria-checked="settings.interactionEnabled"
                class="w-10 h-5 rounded-full transition-all relative"
                :style="settings.interactionEnabled
                  ? 'background: rgba(120,80,255,0.8); box-shadow: 0 0 8px rgba(120,80,255,0.4);'
                  : 'background: rgba(40,30,60,0.8);'"
                @click="settings.interactionEnabled = !settings.interactionEnabled"
                data-testid="toggle-interaction"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  :style="settings.interactionEnabled ? 'left: 1.25rem; background: #e2d9ff;' : 'left: 0.125rem; background: rgba(120,80,255,0.4);'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between">
              <span class="font-mono text-xs" style="color: rgba(200,170,255,0.7);">Show opponent reasoning</span>
              <button
                role="switch"
                :aria-checked="settings.showReasoning"
                class="w-10 h-5 rounded-full transition-all relative"
                :style="settings.showReasoning
                  ? 'background: rgba(120,80,255,0.8); box-shadow: 0 0 8px rgba(120,80,255,0.4);'
                  : 'background: rgba(40,30,60,0.8);'"
                @click="settings.showReasoning = !settings.showReasoning"
                data-testid="toggle-reasoning"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  :style="settings.showReasoning ? 'left: 1.25rem; background: #e2d9ff;' : 'left: 0.125rem; background: rgba(120,80,255,0.4);'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between">
              <span class="font-mono text-xs" style="color: rgba(200,170,255,0.7);">Enable politics mode</span>
              <button
                role="switch"
                :aria-checked="settings.politicsEnabled"
                class="w-10 h-5 rounded-full transition-all relative"
                :style="settings.politicsEnabled
                  ? 'background: rgba(120,80,255,0.8); box-shadow: 0 0 8px rgba(120,80,255,0.4);'
                  : 'background: rgba(40,30,60,0.8);'"
                @click="settings.politicsEnabled = !settings.politicsEnabled"
                data-testid="toggle-politics"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  :style="settings.politicsEnabled ? 'left: 1.25rem; background: #e2d9ff;' : 'left: 0.125rem; background: rgba(120,80,255,0.4);'"
                />
              </button>
            </label>

            <!-- Seed -->
            <div class="mt-1">
              <div class="font-mono text-xs mb-1.5" style="color: rgba(200,170,255,0.5);">Session Seed</div>
              <div class="flex gap-2 items-center">
                <input
                  v-model="seedInput"
                  maxlength="8"
                  class="flex-1 rounded-lg px-3 py-1.5 font-mono text-xs"
                  style="background: rgba(10,8,30,0.8); border: 1px solid rgba(120,80,255,0.3); color: rgba(0,220,255,0.9);"
                  placeholder="8-digit hex"
                  data-testid="seed-input"
                  @blur="applySeed"
                  @keydown.enter="applySeed"
                />
                <button
                  class="font-mono text-xs px-3 py-1.5 rounded-lg transition-all"
                  style="border: 1px solid rgba(0,220,255,0.3); color: rgba(0,220,255,0.7);"
                  @click="reroll"
                  data-testid="seed-reroll"
                >Reroll</button>
              </div>
            </div>
          </div>
        </section>

        <div class="border-t" style="border-color: rgba(120,80,255,0.1);" />

        <!-- Meta Profile -->
        <section>
          <h3 class="font-display text-sm mb-3" style="color: rgba(180,140,255,0.8); letter-spacing: 0.08em;">
            Meta Profile
          </h3>
          <div class="flex flex-col gap-2">
            <MetaProfileCard
              v-for="p in META_PROFILES"
              :key="p.id"
              :id="p.id"
              :label="p.label"
              :description="p.description"
              :selected="settings.metaProfile === p.id"
              @select="settings.setMetaProfile($event)"
            />
          </div>
        </section>

        <div class="border-t" style="border-color: rgba(120,80,255,0.1);" />

        <!-- Opponent Seats -->
        <section>
          <h3 class="font-display text-sm mb-3" style="color: rgba(180,140,255,0.8); letter-spacing: 0.08em;">
            Opponent Seats
          </h3>
          <div class="flex flex-col gap-3">
            <SeatConfigurator :seat-index="0" />
            <SeatConfigurator :seat-index="1" />
            <SeatConfigurator :seat-index="2" />
          </div>
        </section>

        <div class="border-t" style="border-color: rgba(120,80,255,0.1);" />

        <!-- Display -->
        <section>
          <h3 class="font-display text-sm mb-3" style="color: rgba(180,140,255,0.8); letter-spacing: 0.08em;">
            Display
          </h3>
          <div class="flex flex-col gap-2.5">
            <label class="flex items-center justify-between">
              <span class="font-mono text-xs" style="color: rgba(200,170,255,0.7);">Animated star background</span>
              <button
                role="switch"
                :aria-checked="settings.starBackground"
                class="w-10 h-5 rounded-full transition-all relative"
                :style="settings.starBackground
                  ? 'background: rgba(120,80,255,0.8);'
                  : 'background: rgba(40,30,60,0.8);'"
                @click="settings.starBackground = !settings.starBackground"
                data-testid="toggle-stars"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  :style="settings.starBackground ? 'left: 1.25rem; background: #e2d9ff;' : 'left: 0.125rem; background: rgba(120,80,255,0.4);'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between">
              <span class="font-mono text-xs" style="color: rgba(200,170,255,0.7);">Card bloom effects</span>
              <button
                role="switch"
                :aria-checked="settings.cardBloom"
                class="w-10 h-5 rounded-full transition-all relative"
                :style="settings.cardBloom
                  ? 'background: rgba(120,80,255,0.8);'
                  : 'background: rgba(40,30,60,0.8);'"
                @click="settings.cardBloom = !settings.cardBloom"
                data-testid="toggle-bloom"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  :style="settings.cardBloom ? 'left: 1.25rem; background: #e2d9ff;' : 'left: 0.125rem; background: rgba(120,80,255,0.4);'"
                />
              </button>
            </label>

            <label class="flex items-center justify-between">
              <span class="font-mono text-xs" style="color: rgba(200,170,255,0.7);">Reduced motion</span>
              <button
                role="switch"
                :aria-checked="settings.reducedMotion"
                class="w-10 h-5 rounded-full transition-all relative"
                :style="settings.reducedMotion
                  ? 'background: rgba(120,80,255,0.8);'
                  : 'background: rgba(40,30,60,0.8);'"
                @click="settings.reducedMotion = !settings.reducedMotion"
                data-testid="toggle-reduced-motion"
              >
                <span
                  class="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                  :style="settings.reducedMotion ? 'left: 1.25rem; background: #e2d9ff;' : 'left: 0.125rem; background: rgba(120,80,255,0.4);'"
                />
              </button>
            </label>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>
