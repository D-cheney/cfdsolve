<script setup lang="ts">
import { Search, Menu, X } from "lucide-vue-next";
import {
  articles,
  algorithms,
  formulas,
  tools,
  forumTopics,
} from "~/utils/content";

const route = useRoute();
const router = useRouter();
const store = usePlatformStore();
const mobileOpen = ref(false);
const searchOpen = ref(false);
const query = ref("");
const selectedIndex = ref(-1);
let searchReturnFocus: HTMLElement | null = null;
const nav = [
  { label: "知识库", to: "/knowledge" },
  { label: "算法与公式", to: "/algorithms" },
  { label: "CFD 仿真", to: "/simulation" },
  { label: "Modelica", to: "/modelica" },
  { label: "社区", to: "/forum" },
];
const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return [
    ...articles.map((x) => ({
      type: "知识",
      title: x.title,
      to: `/knowledge/${x.slug}`,
    })),
    ...algorithms.map((x) => ({
      type: "算法",
      title: x.name,
      to: "/algorithms",
    })),
    ...formulas.map((x) => ({ type: "公式", title: x.name, to: "/formulas" })),
    ...tools.map((x) => ({
      type: "工具",
      title: x.name,
      to: `/simulation/${x.slug}`,
    })),
    {
      type: "实验",
      title: "参数扫描与工况对比",
      to: "/simulation/lab",
    },
    ...forumTopics.map((x) => ({
      type: "社区",
      title: x.title,
      to: `/forum/posts/${x.id}`,
    })),
  ]
    .filter((x) => x.title.toLowerCase().includes(q))
    .slice(0, 7);
});
function active(to: string) {
  return to !== "/" && route.path.startsWith(to);
}
watch(query, () => (selectedIndex.value = -1));
function openSearch() {
  searchReturnFocus = document.activeElement as HTMLElement;
  searchOpen.value = true;
  nextTick(() =>
    (document.querySelector("#global-search") as HTMLInputElement)?.focus(),
  );
}
function closeSearch() {
  searchOpen.value = false;
  selectedIndex.value = -1;
  nextTick(() => searchReturnFocus?.focus());
}
function submitSearch() {
  if (!query.value.trim()) return;
  store.recentSearches = [
    query.value.trim(),
    ...store.recentSearches.filter((x) => x !== query.value.trim()),
  ].slice(0, 5);
  store.saveLocal();
  const selected = results.value[selectedIndex.value];
  closeSearch();
  router.push(
    selected?.to || `/search?q=${encodeURIComponent(query.value.trim())}`,
  );
}
function handleSearchNavigation(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    submitSearch();
    return;
  }
  if (!["ArrowDown", "ArrowUp"].includes(e.key)) return;
  e.preventDefault();
  if (!results.value.length) return;
  selectedIndex.value =
    e.key === "ArrowDown"
      ? (selectedIndex.value + 1) % results.value.length
      : (selectedIndex.value - 1 + results.value.length) % results.value.length;
}
function handleKeys(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearch();
  }
  if (e.key === "Escape") {
    if (searchOpen.value) closeSearch();
    mobileOpen.value = false;
  }
}
onMounted(() => {
  store.init();
  window.addEventListener("keydown", handleKeys);
});
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeys));
</script>

<template>
  <a href="#main-content" class="skip-link">跳到主要内容</a>
  <header class="app-header">
    <div class="header-inner">
      <button
        class="icon-button mobile-only"
        aria-label="打开导航"
        @click="mobileOpen = true"
      >
        <Menu :size="21" />
      </button>
      <NuxtLink to="/" class="brand" aria-label="CFD菜鸟首页"
        ><span class="brand-mark"><i></i><i></i><i></i></span
        ><span>CFD菜鸟<small>CFD ROOKIE</small></span></NuxtLink
      >
      <nav class="primary-nav" aria-label="主导航">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :class="{ active: active(item.to) }"
          >{{ item.label }}</NuxtLink
        >
      </nav>
      <div class="header-actions">
        <button
          class="search-trigger"
          aria-haspopup="dialog"
          :aria-expanded="searchOpen"
          @click="openSearch"
        >
          <Search :size="18" /><span>搜索全站</span><kbd>Ctrl K</kbd>
        </button>
      </div>
    </div>
  </header>

  <div
    v-if="mobileOpen"
    class="drawer-backdrop"
    @click.self="mobileOpen = false"
  >
    <aside class="mobile-drawer">
      <div class="drawer-head">
        <span>导航</span
        ><button
          class="icon-button"
          aria-label="关闭导航"
          @click="mobileOpen = false"
        >
          <X :size="20" />
        </button>
      </div>
      <NuxtLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        @click="mobileOpen = false"
        >{{ item.label }}</NuxtLink
      >
    </aside>
  </div>

  <div v-if="searchOpen" class="modal-backdrop" @click.self="closeSearch">
    <section
      class="search-modal"
      role="dialog"
      aria-modal="true"
      aria-label="全站搜索"
    >
      <form
        class="search-modal-input"
        @submit.prevent="submitSearch"
        @keydown="handleSearchNavigation"
      >
        <Search :size="21" /><input
          id="global-search"
          v-model="query"
          placeholder="搜索知识、公式、工具、模型或讨论…"
          autocomplete="off"
          aria-label="全站搜索关键词"
        /><kbd>ESC</kbd>
      </form>
      <div v-if="!query" class="search-empty">
        <small>最近搜索</small
        ><button
          v-for="item in store.recentSearches"
          :key="item"
          @click="query = item"
        >
          {{ item }}
        </button>
      </div>
      <div v-else class="search-results">
        <NuxtLink
          v-for="(item, index) in results"
          :key="item.type + item.title"
          :to="item.to"
          :class="{ active: selectedIndex === index }"
          @mouseenter="selectedIndex = index"
          @click="closeSearch"
          ><span>{{ item.type }}</span
          ><strong>{{ item.title }}</strong
          ><small>↗</small></NuxtLink
        >
        <div v-if="!results.length" class="empty-inline">
          未找到匹配内容，按 Enter 查看完整搜索建议。
        </div>
      </div>
      <div class="search-help">
        <span>↑↓ 选择</span><span>Enter 搜索</span><span>Esc 关闭</span>
      </div>
    </section>
  </div>
</template>
