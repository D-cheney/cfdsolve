<script setup lang="ts">
import { Home, ArrowLeft } from "lucide-vue-next";
const route = useRoute();
const path = computed(() => route.path);
const component = computed(() => {
  if (path.value === "/") return resolveComponent("PagesHomePage");
  if (
    path.value === "/knowledge" ||
    path.value.startsWith("/knowledge/") ||
    path.value === "/algorithms" ||
    ["/formulas", "/formulas/convert"].includes(path.value) ||
    path.value === "/search"
  )
    return resolveComponent("PagesLibraryPage");
  if (path.value === "/simulation" || path.value.startsWith("/simulation/"))
    return resolveComponent("PagesSimulationWorkbenchPage");
  if (path.value === "/modelica" || path.value.startsWith("/modelica/"))
    return resolveComponent("PagesModelicaPage");
  if (path.value === "/forum" || path.value.startsWith("/forum/"))
    return resolveComponent("PagesCommunityPage");
  if (["/terms", "/privacy", "/disclaimer"].includes(path.value))
    return resolveComponent("PagesLegalPage");
  return null;
});
if (import.meta.server && !component.value) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, 404, "Not Found");
}
</script>
<template>
  <component :is="component" v-if="component" />
  <div v-else class="not-found" role="status">
    <Home :size="36" /><span>404</span>
    <h1>这个页面不在计算域内</h1>
    <p>链接可能已失效，或页面只存在于另一台设备的本地数据中。</p>
    <NuxtLink to="/" class="button"><ArrowLeft :size="17" />返回首页</NuxtLink>
  </div>
</template>
