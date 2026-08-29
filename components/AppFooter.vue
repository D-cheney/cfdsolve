<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="brand">流研工坊 <small>FLOWLAB</small></div>
        <p>把理论、计算与工程讨论放在同一条可复现链路上。</p>
        <span class="offline-badge">● 本地离线数据模式</span>
      </div>
      <div>
        <strong>内容</strong><NuxtLink to="/knowledge">知识库</NuxtLink
        ><NuxtLink to="/algorithms">算法库</NuxtLink
        ><NuxtLink to="/formulas">公式速查</NuxtLink>
      </div>
      <div>
        <strong>工具</strong><NuxtLink to="/simulation">CFD 仿真</NuxtLink
        ><NuxtLink to="/modelica">Modelica</NuxtLink
        ><NuxtLink to="/forum">工程社区</NuxtLink>
      </div>
      <div>
        <strong>规则与支持</strong><NuxtLink to="/terms">使用条款</NuxtLink
        ><NuxtLink to="/privacy">隐私政策</NuxtLink
        ><NuxtLink to="/disclaimer">仿真免责声明</NuxtLink>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 FlowLab · 站点版本 1.0.0-local</span
      ><span>结果用于教学与工程估算，请独立验证关键结论</span>
    </div>
  </footer>
</template>
