<script setup lang="ts">
import { Home, ArrowLeft } from 'lucide-vue-next'
const route=useRoute()
const path=computed(()=>route.path)
const component=computed(()=>{
  if(path.value==='/') return resolveComponent('PagesHomePage')
  if(path.value.startsWith('/knowledge')||path.value.startsWith('/algorithms')||path.value.startsWith('/formulas')||path.value.startsWith('/search')) return resolveComponent('PagesLibraryPage')
  if(path.value.startsWith('/simulation')) return resolveComponent('PagesSimulationPage')
  if(path.value.startsWith('/utilities')) return resolveComponent('PagesUtilityPage')
  if(path.value.startsWith('/modelica')) return resolveComponent('PagesModelicaPage')
  if(path.value.startsWith('/forum')) return resolveComponent('PagesCommunityPage')
  if(path.value.startsWith('/login')||path.value.startsWith('/register')||path.value.startsWith('/me')||path.value.startsWith('/notifications')||path.value.startsWith('/admin')||path.value.startsWith('/user')) return resolveComponent('PagesAccountPage')
  return null
})
</script>
<template><component :is="component" v-if="component"/><div v-else class="not-found"><Home :size="36"/><span>404</span><h1>这个页面不在计算域内</h1><p>链接可能已失效，或页面只存在于另一台设备的本地数据中。</p><NuxtLink to="/" class="button"><ArrowLeft :size="17"/>返回首页</NuxtLink></div></template>
