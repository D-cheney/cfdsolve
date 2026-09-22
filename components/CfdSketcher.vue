<script setup lang="ts">
import type { ModelingSummary } from '~/types/modeling'

defineProps<{ width?: number; height?: number; resetToken?: number }>()
const emit = defineEmits<{
  'update:width': [value: number]
  'update:height': [value: number]
  'geometry-change': [value: ModelingSummary]
  'go-mesh': []
}>()
</script>

<template>
  <ModelingWorkspace :reset-token="resetToken" @geometry-change="emit('geometry-change',$event)" @go-mesh="emit('go-mesh')" />
</template>
