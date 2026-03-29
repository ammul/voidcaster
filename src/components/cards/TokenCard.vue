<script setup lang="ts">
import type { GameCard } from '../../types'
import CardComponent from './CardComponent.vue'

defineProps<{ card: GameCard }>()
</script>

<template>
  <CardComponent :card="card" size="md" :tappable="true" />
</template>
