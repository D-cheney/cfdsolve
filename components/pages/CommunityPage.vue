<script setup lang="ts">
import {
  Search,
  MessageSquare,
  Eye,
  CheckCircle2,
  Star,
  ArrowRight,
  Plus,
  ThumbsUp,
  Flag,
  Reply,
  ChevronRight,
  Users,
  ShieldCheck,
} from "lucide-vue-next";
import { forumTopics } from "~/utils/content";
const route = useRoute(),
  router = useRouter();
const postDetail = computed(() =>
  /^\/forum\/posts\/[^/]+\/?$/.test(route.path),
);
const forumList = computed(() =>
  ["/forum", "/forum/sections/all"].includes(route.path),
);
const activeTab = ref("最新"),
  searchQuery = ref("");
const customTopics = ref<typeof forumTopics>([]);
const allTopics = computed(() => [...customTopics.value, ...forumTopics]);
const matchedTopic = computed(() =>
  allTopics.value.find((item) => item.id === route.path.split("/").at(-1)),
);
const topic = computed(
  () =>
    matchedTopic.value ?? {
      id: "",
      title: "",
      section: "",
      replies: 0,
      views: 0,
      status: "讨论中",
      time: "",
    },
);
if (import.meta.server && postDetail.value && !matchedTopic.value) {
  const event = useRequestEvent();
  if (event) setResponseStatus(event, 404, "Forum topic not found");
}
const filteredTopics = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const items = allTopics.value.filter(
    (item) =>
      (!q ||
        `${item.title}${item.section}${item.status}`
          .toLowerCase()
          .includes(q)) &&
      (activeTab.value === "待解决"
        ? item.status === "讨论中"
        : activeTab.value === "精华"
          ? item.status === "精华"
          : true),
  );
  return activeTab.value === "热门"
    ? [...items].sort((a, b) => b.views - a.views)
    : items;
});
const topicContent: Record<
  string,
  { tags: string[]; paragraphs: string[]; code: string }
> = {
  "1001": {
    tags: ["方腔流", "验证"],
    paragraphs: [
      "我使用 65×65 网格计算 Re=100 方腔顶盖驱动流。连续性残差已降低，但与公开中心线速度数据相比仍有约 4% 偏差。",
      "当前设置为速度欠松弛 0.7、压力欠松弛 0.3、对流项一阶迎风。应该优先检查离散格式、采样位置还是收敛判据？",
    ],
    code: "Re = 100\ngrid = 65 × 65\nmax(|mass imbalance|) = 7.2e-7",
  },
  "1002": {
    tags: ["SST", "y+", "边界层"],
    paragraphs: [
      "我在内流 SST k-ω 算例中以 y⁺=1 设计首层网格，但第一次计算得到的壁面 y⁺ 分布为 0.4–2.8。",
      "希望确认首层高度应按局部摩阻速度逐面迭代，还是用面积加权代表值统一缩放。",
    ],
    code: "target y+ = 1\nfirst layer = 10.9 μm\ngrowth rate = 1.20",
  },
  "1003": {
    tags: ["Modelica", "初始化", "结构奇异"],
    paragraphs: [
      "模型翻译阶段报告结构奇异：方程数与未知数表面相等，但初始化系统仍存在秩亏。",
      "我怀疑两个连接器约束重复，同时部分状态又设置了 fixed=true。如何用最小模型定位冗余方程和缺失初值？",
    ],
    code: "Error: structurally singular initial system\nunknowns = 18\nequations = 18\nrank = 17",
  },
  "1004": {
    tags: ["OpenFOAM", "非正交", "网格"],
    paragraphs: [
      "网格最大非正交角约 68°，simpleFoam 使用 0、1、2 次 nonOrthogonalCorrectors 时压降有可见差异。",
      "除了残差和守恒，是否有推荐的修正次数选择准则？",
    ],
    code: "max non-orthogonality = 68\nnonOrthogonalCorrectors = 0 / 1 / 2",
  },
  "1005": {
    tags: ["验证", "网格无关性", "GCI"],
    paragraphs: [
      "已完成三套系统加密网格，目标量变化小于 1%，准备写进验证报告。",
      "希望确认除了网格尺寸、目标量和相对误差，是否还应报告表观阶数与 GCI。",
    ],
    code: "N = 0.42M / 0.95M / 2.10M\nQ = 0.812 / 0.818 / 0.821",
  },
};
const fallbackContent = {
  tags: ["工程讨论"],
  paragraphs: ["请补充物理模型、边界条件和最小可复现数据。"],
  code: "# local draft",
};
const detail = computed(() =>
  matchedTopic.value
    ? (topicContent[matchedTopic.value.id] ?? fallbackContent)
    : fallbackContent,
);
type ReplyItem = {
  id: number;
  author: string;
  role: string;
  time: string;
  text: string;
  likes: number;
  accepted: boolean;
};
const repliesByTopic = ref<Record<string, ReplyItem[]>>({
  "1001": [
    {
      id: 1,
      author: "周致远",
      role: "数值方法编辑",
      time: "今天 09:42",
      text: "先把误差拆成离散误差和收敛误差，并核对中心线采样位于单元中心还是网格面。",
      likes: 12,
      accepted: true,
    },
  ],
  "1002": [
    {
      id: 1,
      author: "顾航",
      role: "社区成员",
      time: "今天 10:18",
      text: "用首轮壁面剪切应力反算局部摩阻速度，再限制缩放倍率并重新生成近壁层。",
      likes: 8,
      accepted: false,
    },
  ],
  "1003": [
    {
      id: 1,
      author: "陈序",
      role: "系统仿真工程师",
      time: "今天 11:05",
      text: "先暂时移除所有 fixed=true，仅保留一个独立参考；再逐条恢复连接约束并观察结构秩变化。",
      likes: 10,
      accepted: false,
    },
  ],
  "1004": [
    {
      id: 1,
      author: "陆工",
      role: "OpenFOAM 用户",
      time: "今天 11:20",
      text: "修正次数应以目标量和面通量守恒的敏感性为依据，不应只按最大非正交角机械选择。",
      likes: 6,
      accepted: false,
    },
  ],
  "1005": [
    {
      id: 1,
      author: "周致远",
      role: "验证编辑",
      time: "昨天",
      text: "建议给出加密比、表观阶数、外推值和 GCI，并说明三套网格是否处于渐近区间。",
      likes: 14,
      accepted: true,
    },
  ],
});
const replies = computed(() =>
  matchedTopic.value ? (repliesByTopic.value[matchedTopic.value.id] ?? []) : [],
);
const replyText = ref(""),
  replyEditor = ref<HTMLTextAreaElement>(),
  originalLikes = reactive<Record<string, number>>({}),
  flagged = reactive(new Set<string>());
const draftOpen = ref(false),
  draftTitle = ref(""),
  draftBody = ref("");
function addReply() {
  if (!matchedTopic.value || replyText.value.trim().length < 5) return;
  const items = repliesByTopic.value[matchedTopic.value.id] ?? [];
  repliesByTopic.value[matchedTopic.value.id] = [
    ...items,
    {
      id: items.length + 1,
      author: "本地访客",
      role: "社区成员",
      time: "刚刚",
      text: replyText.value.trim(),
      likes: 0,
      accepted: false,
    },
  ];
  replyText.value = "";
}
function likeOriginal() {
  if (matchedTopic.value)
    originalLikes[matchedTopic.value.id] =
      (originalLikes[matchedTopic.value.id] ?? 6) + 1;
}
function likeReply(id: number) {
  const item = replies.value.find((entry) => entry.id === id);
  if (item) item.likes += 1;
}
function flag(key: string) {
  flagged.add(key);
}
function focusReply() {
  replyEditor.value?.focus();
}
function startTopic() {
  draftOpen.value = true;
}
function publishTopic() {
  if (draftTitle.value.trim().length < 8 || draftBody.value.trim().length < 20)
    return;
  const id = `local-${Date.now().toString(36)}`;
  customTopics.value.unshift({
    id,
    title: draftTitle.value.trim(),
    section: "本地讨论",
    replies: 0,
    views: 1,
    status: "讨论中",
    time: "刚刚",
  });
  topicContent[id] = {
    tags: ["本地草稿"],
    paragraphs: [draftBody.value.trim()],
    code: "# 本地主题；刷新后不保留",
  };
  repliesByTopic.value[id] = [];
  draftOpen.value = false;
  draftTitle.value = "";
  draftBody.value = "";
  router.push(`/forum/posts/${id}`);
}
</script>
<template>
  <div v-if="forumList" class="page forum-page">
    <section class="page-hero slim">
      <div class="container">
        <span class="kicker">ENGINEERING COMMUNITY</span>
        <h1>工程社区</h1>
        <p>定位问题、分享可复现实验，并让高质量答案持续被找到。</p>
      </div>
    </section>
    <div class="container forum-layout">
      <main>
        <div class="forum-sections">
          <header>
            <h2>讨论板块</h2>
            <NuxtLink to="/forum/sections/all"
              >查看全部 <ArrowRight :size="15"
            /></NuxtLink>
          </header>
          <div
            v-for="s in [
              {
                n: '新手问答',
                d: '基础概念、入门路径与平台使用',
                t: 326,
                r: 1280,
              },
              {
                n: '理论与算法',
                d: '离散格式、求解器与数值验证',
                t: 218,
                r: 960,
              },
              {
                n: 'CFD 软件实践',
                d: 'Fluent、OpenFOAM 与 STAR-CCM+',
                t: 451,
                r: 2304,
              },
              { n: 'Modelica', d: '语言、组件库与系统仿真', t: 174, r: 730 },
            ]"
            :key="s.n"
          >
            <span>{{ s.n.slice(0, 1) }}</span>
            <div>
              <strong>{{ s.n }}</strong>
              <p>{{ s.d }}</p>
            </div>
            <small>{{ s.t }} 主题</small><small>{{ s.r }} 回复</small
            ><ArrowRight :size="17" />
          </div>
        </div>
        <div class="topic-stream">
          <div class="topic-tabs">
            <button
              v-for="tab in ['最新', '热门', '待解决', '精华']"
              :key="tab"
              :class="{ active: activeTab === tab }"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
            <div class="page-search inline">
              <Search :size="16" /><input
                v-model="searchQuery"
                placeholder="搜索社区"
              />
            </div>
          </div>
          <NuxtLink
            v-for="t in filteredTopics"
            :key="t.id"
            :to="`/forum/posts/${t.id}`"
            class="forum-topic"
            ><span
              class="topic-state"
              :class="
                t.status === '已解决'
                  ? 'resolved'
                  : t.status === '精华'
                    ? 'featured'
                    : ''
              "
              ><CheckCircle2 v-if="t.status === '已解决'" /><Star
                v-else-if="t.status === '精华'" /><MessageSquare v-else
            /></span>
            <div>
              <h2>{{ t.title }}</h2>
              <p>
                <span>{{ t.section }}</span> · 林昊 · {{ t.time }}
              </p>
            </div>
            <span><MessageSquare :size="15" />{{ t.replies }}</span
            ><span><Eye :size="15" />{{ t.views }}</span></NuxtLink
          >
          <div v-if="!filteredTopics.length" class="empty-state">
            <Search :size="32" />
            <h3>没有匹配的主题</h3>
            <p>清除搜索词或切换主题状态。</p>
            <button
              class="button secondary"
              @click="
                searchQuery = '';
                activeTab = '最新';
              "
            >
              清除筛选
            </button>
          </div>
        </div>
      </main>
      <aside>
        <button class="button large full" @click="startTopic">
          <Plus :size="18" />发布新主题
        </button>
        <div class="side-card">
          <strong>社区原则</strong>
          <p>
            描述物理问题与边界条件，附上最小可复现案例，并说明已经尝试过的排查步骤。
          </p>
          <NuxtLink to="/terms">查看完整规范</NuxtLink>
        </div>
        <div class="side-card">
          <strong>待解决问题</strong
          ><NuxtLink
            v-for="t in forumTopics.filter((t) => t.status === '讨论中')"
            :key="t.id"
            :to="`/forum/posts/${t.id}`"
            >{{ t.title }}<small>{{ t.replies }} 个回复</small></NuxtLink
          >
        </div>
        <div class="side-card stats">
          <div>
            <Users /><span><strong>2,841</strong><small>工程用户</small></span>
          </div>
          <div>
            <ShieldCheck /><span
              ><strong>87%</strong><small>问题响应率</small></span
            >
          </div>
        </div>
      </aside>
    </div>
  </div>
  <div v-else-if="postDetail && !matchedTopic" class="page">
    <div class="container not-found" role="status">
      <MessageSquare :size="40" /><span>404</span>
      <h1>没有找到这个社区主题</h1>
      <p>主题可能已删除、尚未同步，或链接已经失效。</p>
      <NuxtLink to="/forum" class="button">返回社区</NuxtLink>
    </div>
  </div>
  <div v-else-if="postDetail && matchedTopic" class="page post-page">
    <div class="container breadcrumb">
      <NuxtLink to="/forum">社区</NuxtLink><ChevronRight :size="14" /><span>{{
        topic.section
      }}</span
      ><ChevronRight :size="14" /><span>{{ topic.title }}</span>
    </div>
    <div class="container post-layout">
      <main>
        <article class="post-card original">
          <header>
            <div class="user-avatar">林</div>
            <div>
              <strong>林昊</strong><span>流体机械工程师 · 贡献值 426</span>
            </div>
            <small>#1 · 今天 08:56</small>
          </header>
          <div class="post-content">
            <div class="tag-row">
              <span>{{ topic.section }}</span
              ><span v-for="tag in detail.tags" :key="tag">{{ tag }}</span>
            </div>
            <h1>{{ topic.title }}</h1>
            <p v-for="paragraph in detail.paragraphs" :key="paragraph">
              {{ paragraph }}
            </p>
            <pre><code>{{ detail.code }}</code></pre>
          </div>
          <footer>
            <button @click="likeOriginal">
              <ThumbsUp :size="16" />赞
              {{ originalLikes[topic.id] ?? 6 }}</button
            ><button @click="focusReply"><Reply :size="16" />回复</button
            ><button @click="flag(`topic-${topic.id}`)">
              <Flag :size="16" />{{
                flagged.has(`topic-${topic.id}`) ? "已标记" : "举报"
              }}
            </button>
          </footer>
        </article>
        <article
          v-for="r in replies"
          :key="r.id"
          class="post-card reply-card"
          :class="{ accepted: r.accepted }"
        >
          <div v-if="r.accepted" class="accepted-label">
            <CheckCircle2 :size="16" />已采纳答案
          </div>
          <header>
            <div class="user-avatar">{{ r.author.slice(0, 1) }}</div>
            <div>
              <strong>{{ r.author }}</strong
              ><span>{{ r.role }}</span>
            </div>
            <small>#{{ r.id + 1 }} · {{ r.time }}</small>
          </header>
          <div class="post-content">
            <p>{{ r.text }}</p>
          </div>
          <footer>
            <button @click="likeReply(r.id)">
              <ThumbsUp :size="16" />赞 {{ r.likes }}</button
            ><button @click="focusReply"><Reply :size="16" />回复</button
            ><button @click="flag(`${topic.id}-${r.id}`)">
              <Flag :size="16" />{{
                flagged.has(`${topic.id}-${r.id}`) ? "已标记" : "举报"
              }}
            </button>
          </footer>
        </article>
        <form class="reply-editor" @submit.prevent="addReply">
          <h2>参与讨论</h2>
          <textarea
            ref="replyEditor"
            v-model="replyText"
            minlength="5"
            required
            placeholder="写下可验证的建议或补充信息…"
          ></textarea>
          <div>
            <small>回复草稿仅保存在当前页面</small
            ><button class="button">发布回复</button>
          </div>
        </form>
      </main>
      <aside>
        <div class="side-card">
          <strong>主题状态</strong
          ><span class="status success">{{ topic.status }}</span>
          <dl>
            <div>
              <dt>回复</dt>
              <dd>{{ replies.length }}</dd>
            </div>
            <div>
              <dt>浏览</dt>
              <dd>{{ topic.views }}</dd>
            </div>
            <div>
              <dt>最后活跃</dt>
              <dd>{{ topic.time }}</dd>
            </div>
          </dl>
        </div>
        <div class="side-card">
          <strong>相关主题</strong
          ><NuxtLink
            v-for="t in allTopics.filter((x) => x.id !== topic.id).slice(0, 3)"
            :key="t.id"
            :to="`/forum/posts/${t.id}`"
            >{{ t.title }}<small>{{ t.replies }} 个回复</small></NuxtLink
          >
        </div>
        <div class="side-card">
          <strong>板块规则</strong>
          <p>请隐藏敏感工程数据，不上传未经授权的商业软件许可或受限资料。</p>
        </div>
      </aside>
    </div>
  </div>
  <div v-else class="page">
    <div class="container not-found" role="status">
      <MessageSquare :size="40" /><span>404</span>
      <h1>没有找到这个社区页面</h1>
      <p>请从社区主题列表继续浏览。</p>
      <NuxtLink to="/forum" class="button">返回社区</NuxtLink>
    </div>
  </div>
  <div v-if="draftOpen" class="modal-backdrop" @click.self="draftOpen = false">
    <form class="dialog-card" @submit.prevent="publishTopic">
      <div>
        <h2>发布本地主题</h2>
        <button
          type="button"
          class="icon-button"
          aria-label="关闭"
          @click="draftOpen = false"
        >
          ×
        </button>
      </div>
      <p>主题仅保存在当前页面会话；刷新后不会保留。</p>
      <label
        >标题<input v-model="draftTitle" required minlength="8" maxlength="120"
      /></label>
      <label
        >问题与已尝试步骤<textarea
          v-model="draftBody"
          required
          minlength="20"
          maxlength="2000"
        ></textarea>
      </label>
      <footer>
        <button
          type="button"
          class="button secondary"
          @click="draftOpen = false"
        >
          取消</button
        ><button class="button">发布主题</button>
      </footer>
    </form>
  </div>
</template>
