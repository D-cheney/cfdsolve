<template>
  <FluidBackground v-if="showFluidBackground" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute()

const showFluidBackground = computed(() => {
  const path = route.path
  const isSimulationPage = path === '/simulation' || path.startsWith('/simulation/')
  const isKnowledgeArticle = /^\/knowledge\/[^/]+\/?$/.test(path)
  const isFormulaWorkspace = path === '/formulas/convert'
  const isModelicaWorkspace = /^\/modelica\/(?:projects\/[^/]+\/editor|runs\/[^/]+)\/?$/.test(path)

  return !(isSimulationPage || isKnowledgeArticle || isFormulaWorkspace || isModelicaWorkspace)
})
</script>
