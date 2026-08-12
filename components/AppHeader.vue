<script setup lang="ts">
import { Search, Bell, Menu, X, UserRound, ChevronDown } from 'lucide-vue-next'
import { articles, algorithms, formulas, tools, forumTopics } from '~/utils/content'

const route = useRoute()
const router = useRouter()
const store = usePlatformStore()
const mobileOpen = ref(false)
const searchOpen = ref(false)
const accountOpen = ref(false)
const query = ref('')
const nav = [
  { label: '知识库', to: '/knowledge' }, { label: '算法与公式', to: '/algorithms' },
  { label: 'CFD 仿真', to: '/simulation' }, { label: '实用工具', to: '/utilities' }, { label: 'Modelica', to: '/modelica' }, { label: '社区', to: '/forum' }
]
const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return [
    ...articles.map(x => ({ type: '知识', title: x.title, to: `/knowledge/${x.slug}` })),
    ...algorithms.map(x => ({ type: '算法', title: x.name, to: '/algorithms' })),
    ...formulas.map(x => ({ type: '公式', title: x.name, to: '/formulas' })),
    ...tools.map(x => ({ type: '工具', title: x.name, to: `/simulation/${x.slug}` })),
    ...forumTopics.map(x => ({ type: '社区', title: x.title, to: `/forum/posts/${x.id}` }))
  ].filter(x => x.title.toLowerCase().includes(q)).slice(0, 7)
})
function active(to: string) { return to !== '/' && route.path.startsWith(to) }
function openSearch() { searchOpen.value = true; nextTick(() => (document.querySelector('#global-search') as HTMLInputElement)?.focus()) }
function submitSearch() { if (!query.value.trim()) return; store.recentSearches = [query.value.trim(), ...store.recentSearches.filter(x => x !== query.value.trim())].slice(0, 5); store.persist(); searchOpen.value = false; router.push(`/search?q=${encodeURIComponent(query.value.trim())}`) }
function handleKeys(e: KeyboardEvent) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch() } if (e.key === 'Escape') { searchOpen.value = false; mobileOpen.value = false; accountOpen.value = false } }
onMounted(() => { store.init(); window.addEventListener('keydown', handleKeys) })
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeys))
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主要内容</a>
  <header class="app-header">
    <div class="header-inner">
      <button class="icon-button mobile-only" aria-label="打开导航" @click="mobileOpen = true"><Menu :size="21" /></button>
      <NuxtLink to="/" class="brand" aria-label="流研工坊首页"><span class="brand-mark"><i></i><i></i><i></i></span><span>流研工坊<small>FLOWLAB</small></span></NuxtLink>
      <nav class="primary-nav" aria-label="主导航">
        <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" :class="{ active: active(item.to) }">{{ item.label }}</NuxtLink>
      </nav>
      <div class="header-actions">
        <button class="search-trigger" @click="openSearch"><Search :size="18" /><span>搜索全站</span><kbd>Ctrl K</kbd></button>
        <NuxtLink v-if="store.user" to="/notifications" class="icon-button notify" aria-label="通知"><Bell :size="20" /><b v-if="store.unread">{{ store.unread }}</b></NuxtLink>
        <div v-if="store.user" class="account-wrap">
          <button class="avatar-button" @click="accountOpen = !accountOpen"><span>{{ store.user.name.slice(0, 1) }}</span><ChevronDown :size="14" /></button>
          <div v-if="accountOpen" class="account-menu">
            <div><strong>{{ store.user.name }}</strong><small>{{ store.user.role }} · 离线模式</small></div>
            <NuxtLink to="/me/overview" @click="accountOpen=false">个人中心</NuxtLink>
            <NuxtLink to="/me/tasks" @click="accountOpen=false">仿真任务</NuxtLink>
            <NuxtLink to="/me/modelica" @click="accountOpen=false">Modelica 项目</NuxtLink>
            <button @click="store.logout(); accountOpen=false">退出登录</button>
          </div>
        </div>
        <template v-else><NuxtLink to="/login" class="login-link">登录</NuxtLink><NuxtLink to="/register" class="button small">注册</NuxtLink></template>
      </div>
    </div>
  </header>

  <div v-if="mobileOpen" class="drawer-backdrop" @click.self="mobileOpen=false">
    <aside class="mobile-drawer">
      <div class="drawer-head"><NuxtLink to="/" class="brand" @click="mobileOpen=false"><span class="brand-mark"><i></i><i></i><i></i></span><span>流研工坊<small>FLOWLAB</small></span></NuxtLink><button class="icon-button" aria-label="关闭导航" @click="mobileOpen=false"><X :size="20" /></button></div>
      <button class="mobile-search-link" @click="mobileOpen=false; openSearch()"><Search :size="18" /><span>搜索知识、公式和工具</span></button>
      <small class="mobile-nav-label">功能导航</small>
      <NuxtLink v-for="item in nav" :key="item.to" :to="item.to" @click="mobileOpen=false">{{ item.label }}</NuxtLink>
      <small class="mobile-nav-label">账户</small>
      <NuxtLink v-if="store.user" to="/me/overview" @click="mobileOpen=false">个人中心</NuxtLink>
      <template v-else><NuxtLink to="/login" @click="mobileOpen=false">登录</NuxtLink><NuxtLink to="/register" class="mobile-register-link" @click="mobileOpen=false">创建账户</NuxtLink></template>
      <footer><span>当前模式</span><strong>{{ store.databaseConnected ? '数据库已连接' : '浏览器本地存储' }}</strong></footer>
    </aside>
  </div>

  <div v-if="searchOpen" class="modal-backdrop" @click.self="searchOpen=false">
    <section class="search-modal" role="dialog" aria-modal="true" aria-label="全站搜索">
      <form class="search-modal-input" @submit.prevent="submitSearch"><Search :size="21" /><input id="global-search" v-model="query" placeholder="搜索知识、公式、工具、模型或讨论…" autocomplete="off"><kbd>ESC</kbd></form>
      <div v-if="!query" class="search-empty"><small>最近搜索</small><button v-for="item in store.recentSearches" :key="item" @click="query=item">{{ item }}</button></div>
      <div v-else class="search-results">
        <NuxtLink v-for="item in results" :key="item.type+item.title" :to="item.to" @click="searchOpen=false"><span>{{ item.type }}</span><strong>{{ item.title }}</strong><small>↗</small></NuxtLink>
        <div v-if="!results.length" class="empty-inline">未找到匹配内容，按 Enter 查看完整搜索建议。</div>
      </div>
      <div class="search-help"><span>↑↓ 选择</span><span>Enter 搜索</span><span>Esc 关闭</span></div>
    </section>
  </div>
</template>
