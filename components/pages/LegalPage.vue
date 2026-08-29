<script setup lang="ts">
import { ShieldCheck, AlertTriangle, Database } from "lucide-vue-next";
const route = useRoute();
const pages = {
  "/terms": {
    title: "使用条款",
    icon: ShieldCheck,
    intro: "本地版用于工程学习、方法验证与原型计算。",
    items: [
      "请仅上传或录入你有权处理的数据与模型。",
      "不得把教学型求解结果直接作为安全关键系统的唯一决策依据。",
      "本地数据由使用者自行备份和管理，导出文件应遵守所在组织的数据制度。",
    ],
  },
  "/privacy": {
    title: "隐私政策",
    icon: Database,
    intro: "默认部署不需要云端账号，工作区数据保存在本机。",
    items: [
      "项目、任务、收藏和通知写入本机 SQLite，并保留浏览器降级缓存。",
      "应用不会主动把工程数据发送到第三方服务。",
      "若自行开放局域网或接入外部服务，应另行配置身份认证、访问控制与隐私告知。",
    ],
  },
  "/disclaimer": {
    title: "仿真免责声明",
    icon: AlertTriangle,
    intro: "所有结果都必须结合模型假设、网格质量和独立基准进行复核。",
    items: [
      "浏览器求解器以教学和快速估算为目标，不替代经验证的生产求解流程。",
      "未收敛、警告或超出适用范围的结果不得标记为成功。",
      "关键工程结论应执行网格无关性、守恒、实验或公开基准验证。",
    ],
  },
} as const;
const page = computed(
  () => pages[route.path as keyof typeof pages] ?? pages["/terms"],
);
</script>

<template>
  <div class="page">
    <section class="page-hero slim">
      <div class="container">
        <component :is="page.icon" :size="30" /><span class="kicker"
          >LOCAL POLICY</span
        >
        <h1>{{ page.title }}</h1>
        <p>{{ page.intro }}</p>
      </div>
    </section>
    <section class="container content-section">
      <article class="article-body">
        <h2>适用说明</h2>
        <ul>
          <li v-for="item in page.items" :key="item">{{ item }}</li>
        </ul>
        <div class="inline-alert info">
          <ShieldCheck :size="18" /><span
            >当前为本地单用户部署。若用于团队或公网环境，必须先增加正式账号体系、角色权限、TLS
            和审计策略。</span
          >
        </div>
        <NuxtLink to="/" class="button secondary">返回首页</NuxtLink>
      </article>
    </section>
  </div>
</template>
