<script setup lang="ts">
import { ArrowRight, Download, BookOpen, Layers3, CheckCircle2 } from 'lucide-vue-next'
import manifest from '~/public/meshfree/manifest.json'

useHead({ title: '无网格法 · SPH 知识与吉隆案例｜流研工坊' })
const videoGrid = ref<HTMLElement | null>(null)
function playExclusive(event: Event) {
  for (const video of videoGrid.value?.querySelectorAll('video') || []) {
    if (video !== event.target) video.pause()
  }
}
const lessons = [
  { slug: 'meshfree-method-map', title: '从问题选择方法', text: 'SPH、固体 SPH 与 MPM 的边界，区分粒子数量和物理精度。' },
  { slug: 'meshfree-sph-foundations', title: 'SPH 离散与稳定性', text: '核近似、对称压力、邻居搜索、时间步与边界误差。' },
  { slug: 'meshfree-validation', title: '验证、标定与复现', text: '从守恒和标准算例，到分辨率收敛与现场数据对照。' },
]
const modelFiles = manifest.files.filter(file => file.path.startsWith('/meshfree/model/'))
const size = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`
</script>

<template>
  <div class="meshfree-page">
    <section class="meshfree-hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow"><Layers3 :size="16" /> 粒子方法 · 理论与案例</span>
          <h1>无网格法<br><span>从建模走向验证</span></h1>
          <p>连接山体滑坡技术方案、SPH 数值方法与吉隆泥石流模型。阅读知识、查看真实计算回放，下载可追溯的模型资料。</p>
          <div class="actions">
            <NuxtLink class="button" to="/knowledge?collection=meshfree"><BookOpen :size="17" />进入无网格知识库</NuxtLink>
            <a class="button secondary" href="#results">查看计算回放<ArrowRight :size="17" /></a>
          </div>
        </div>
        <figure class="hero-image">
          <img src="/meshfree/images/01_southeast.png" alt="吉隆源区固定地形上的三维 SPH 速度云图" fetchpriority="high" width="1920" height="1080">
          <figcaption>吉隆源区 · 三维 SPH 既有计算结果</figcaption>
        </figure>
      </div>
    </section>

    <div class="container content">
      <section aria-labelledby="learning-title">
        <div class="section-title"><div><span class="eyebrow">学习路径</span><h2 id="learning-title">先理解方法，再使用模型</h2></div><NuxtLink to="/knowledge?collection=meshfree">全部文章 →</NuxtLink></div>
        <div class="lesson-grid">
          <NuxtLink v-for="(lesson, index) in lessons" :key="lesson.slug" :to="`/knowledge/${lesson.slug}`" class="lesson-card">
            <span class="lesson-number">0{{ index + 1 }}</span><h3>{{ lesson.title }}</h3><p>{{ lesson.text }}</p><span class="read-link">阅读专题 <ArrowRight :size="16" /></span>
          </NuxtLink>
        </div>
      </section>

      <section aria-labelledby="versions-title">
        <div class="section-title"><div><span class="eyebrow">模型范围</span><h2 id="versions-title">三个层次，各自回答不同问题</h2></div></div>
        <div class="version-grid">
          <article><span class="tag">技术方案</span><h3>山体滑坡全过程</h3><p>固体力学 SPH、土体弹塑性、强度软化与孔压的分阶段路线。属于建模方案，尚不能等同于当前泥石流求解器已实现的能力。</p><NuxtLink to="/knowledge/meshfree-landslide-plan">阅读滑坡方案 →</NuxtLink></article>
          <article><span class="tag">历史模型</span><h3>一维动力 / 2.5D 展示</h3><p>1200 个一维动力粒子；6000 个地形跟随子粒子用于展示。旧报告的到达时间与裹挟倍数只适用于该历史假设。</p><NuxtLink to="/knowledge/meshfree-jilong-historical-report">查看历史报告 →</NuxtLink></article>
          <article><span class="tag">本页回放</span><h3>48 万独立三维粒子</h3><p>三维弱可压缩 SPH、正则化宾汉黏性与固定 DEM 接触。结果表现为源区局部扩散、滞留；未耦合融化热过程和沿程侵蚀。</p><NuxtLink to="/knowledge/meshfree-sph3d-model">查看三维模型 →</NuxtLink></article>
        </div>
      </section>

      <section id="results" aria-labelledby="results-title">
        <div class="section-title"><div><span class="eyebrow">已完成算例 · 2026-09-08</span><h2 id="results-title">吉隆源区 · 多视角速度云图</h2></div><a href="/meshfree/evidence/summary.json" download>下载运行摘要 ↓</a></div>
        <dl class="metrics">
          <div><dt>独立动力粒子</dt><dd>{{ manifest.summary.particle_count.toLocaleString('en-US') }}</dd></div>
          <div><dt>实际物理时长</dt><dd>{{ manifest.summary.duration_s / 60 }} <small>min</small></dd></div>
          <div><dt>保存状态</dt><dd>{{ manifest.summary.saved_frames }} <small>帧</small></dd></div>
          <div><dt>全过程峰值速度</dt><dd>{{ manifest.summary.peak_speed_m_s.toFixed(2) }} <small>m/s</small></dd></div>
        </dl>
        <div class="context-note"><CheckCircle2 :size="20" /><p>完成摘要与历史校核记录确认了时长、有限值和质量守恒。以上是未标定原型的数值结果；约 30 m 的地形数据精度不会因粒子加密而提高，不能用于实际灾害预测。</p></div>
        <p class="playback-note">八个视角来自同一次计算。视频采用不同时间压缩，请以画面物理时间为准。跟随镜头随粒子群重心移动，镜头移动不代表流体传播距离；播放一个视频时，其余视频自动暂停。</p>
        <div ref="videoGrid" class="video-grid">
          <article v-for="video in manifest.videos" :key="video.id" class="video-card">
            <video controls playsinline preload="none" :poster="video.poster" :src="video.src" :aria-label="video.title" @play="playExclusive">您的浏览器不支持视频播放，请使用下方下载链接。</video>
            <div><h3>{{ video.title }}</h3><a :href="video.src" download :aria-label="`下载${video.title}视频`"><Download :size="16" />下载视频</a></div>
          </article>
        </div>
        <div class="figure-grid">
          <figure><img src="/meshfree/images/process_curves.png" alt="三维 SPH 计算速度、密度与能量等过程曲线" loading="lazy" width="1920" height="1080"><figcaption>既有计算过程曲线</figcaption></figure>
          <figure><img src="/meshfree/images/settings.png" alt="48 万粒子三维 SPH 算例参数与物理范围" loading="lazy" width="1920" height="1080"><figcaption>模型参数与边界假设</figcaption></figure>
        </div>
      </section>

      <section id="downloads" aria-labelledby="downloads-title">
        <div class="section-title"><div><span class="eyebrow">项目资料</span><h2 id="downloads-title">阅读原文，下载模型文件</h2></div><a href="/meshfree/manifest.json" download>文件清单与 SHA-256 ↓</a></div>
        <div class="document-list">
          <article v-for="document in manifest.documents" :key="document.slug"><NuxtLink :to="`/knowledge/${document.slug}`">{{ document.title }}</NuxtLink><a :href="document.download" download>原始 Markdown ↓</a></article>
        </div>
        <div class="download-panel"><div><h3>模型复现资料包</h3><p>包含原始 Python 脚本、配置和已处理地形输入。脚本保留原运行环境的路径与 GPU 配置；运行前按复现说明调整。网站提供资料与回放，计算需在本地科学计算环境执行。</p></div><a class="button" href="/meshfree/model-source.zip" download><Download :size="17" />下载模型 ZIP</a></div>
        <details><summary>逐文件下载模型资料（{{ modelFiles.length }} 项）</summary><ul class="file-list"><li v-for="file in modelFiles" :key="file.path"><a :href="file.path" download>{{ file.path.replace('/meshfree/model/', '') }}</a><span>{{ size(file.bytes) }}</span></li></ul></details>
        <p class="evidence-links"><a href="/meshfree/evidence/quality_check.json" download>原始数值与四视角校核</a> · <a href="/meshfree/evidence/motion_quality_check.json" download>原始八视角与示踪校核</a> · <NuxtLink to="/knowledge/meshfree-validation">验证与复现说明</NuxtLink></p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.meshfree-page a.button:not(.secondary){color:#fff}
.meshfree-page{color:#18354b;font-size:15px;line-height:1.7}.meshfree-hero{padding:58px 0;background:linear-gradient(125deg,#edf6fa,#f8fafb);border-bottom:1px solid #dbe7ee}.hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}.eyebrow{display:flex;align-items:center;gap:8px;color:#39718d;font-size:12px;letter-spacing:.08em;font-weight:650}.meshfree-hero h1{font-size:clamp(34px,3.5vw,50px);line-height:1.3;margin:18px 0}.meshfree-hero h1 span{color:#317694}.meshfree-hero p{max-width:560px;color:#547080}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}.hero-image{margin:0;border:1px solid #ccdde6;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 12px 32px #163d5710}img{display:block;width:100%;height:auto}figcaption{padding:12px 16px;color:#547080;font-size:13px}.content{padding-top:44px;padding-bottom:56px}.content>section+section{margin-top:56px}section[id]{scroll-margin-top:84px}.section-title{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:20px}h2{font-size:26px;line-height:1.4;margin:6px 0 0}h3{font-size:18px;line-height:1.5;margin:12px 0 8px}a{color:#1769aa}.lesson-grid,.version-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.lesson-card,.version-grid article{padding:25px;border:1px solid #dbe5eb;border-radius:10px;background:white}.lesson-card{color:inherit;transition:border-color .15s,box-shadow .15s}.lesson-card:hover{border-color:#4898bd;box-shadow:0 6px 24px #163d5710}.lesson-number{font-size:14px;font-weight:700;color:#4389a9}.lesson-card p,.version-grid p{color:#587081;margin-bottom:18px}.read-link{display:flex;align-items:center;gap:8px;color:#1769aa;font-size:13px}.tag{background:#edf5f8;color:#316b84;padding:4px 9px;border-radius:4px;font-size:12px}.version-grid a{font-size:13px}.metrics{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #dbe5eb;border-radius:10px;background:#fff;margin:0 0 18px;padding:20px}.metrics>div{padding:0 18px;border-right:1px solid #e1e9ee}.metrics>div:last-child{border:0}.metrics dt{font-size:12px;color:#607c8c}.metrics dd{margin:4px 0 0;font-size:29px;font-weight:650}.metrics small{font-size:13px;font-weight:400}.context-note{display:flex;gap:12px;padding:16px 20px;background:#edf5f8;border-radius:8px;color:#315f77}.context-note svg{flex-shrink:0;margin-top:4px}.context-note p{margin:0}.playback-note{color:#607888;margin:20px 0;font-size:13px}.video-grid,.figure-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.video-card,.figure-grid figure{margin:0;border:1px solid #dbe5eb;border-radius:10px;background:white;overflow:hidden}.video-card video{display:block;width:100%;aspect-ratio:16/9;background:#edf2f4}.video-card>div{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 18px}.video-card h3{margin:0;font-size:16px}.video-card a{display:flex;align-items:center;gap:6px;font-size:12px}.figure-grid{margin-top:20px}.document-list{border:1px solid #dbe5eb;border-radius:10px;background:white;overflow:hidden}.document-list article{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:17px 22px}.document-list article+article{border-top:1px solid #e5ebef}.document-list article>a:last-child{font-size:12px;flex-shrink:0;color:#607c8c}.download-panel{display:flex;align-items:center;gap:30px;justify-content:space-between;padding:25px;margin-top:20px;border-radius:10px;background:#edf5f8}.download-panel h3{margin-top:0}.download-panel p{max-width:790px;color:#587081;margin-bottom:0}.download-panel .button{flex-shrink:0}.file-list{list-style:none;padding:0}.file-list li{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #e5ebef;font-size:13px}.file-list a{overflow-wrap:anywhere}.file-list span{flex-shrink:0;color:#607c8c}details{padding:20px 0}summary{cursor:pointer;color:#1769aa}.evidence-links{font-size:13px}a:focus-visible,summary:focus-visible{outline:3px solid #3996c5;outline-offset:4px}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr;gap:28px}.meshfree-hero{padding:34px 0}.lesson-grid,.version-grid{grid-template-columns:1fr}.lesson-card,.version-grid article{padding:20px}.download-panel{align-items:start;flex-direction:column;gap:16px}}
@media(max-width:600px){.video-grid,.figure-grid{grid-template-columns:1fr}.section-title{align-items:start;flex-direction:column;gap:10px}.section-title>a{font-size:13px}h2{font-size:23px}.metrics{grid-template-columns:1fr 1fr;gap:18px;padding:16px}.metrics>div{padding:0 8px;border:0}.metrics dd{font-size:25px}.document-list article{align-items:start;flex-direction:column;gap:5px;padding:15px}.content>section+section{margin-top:38px}}
</style>
