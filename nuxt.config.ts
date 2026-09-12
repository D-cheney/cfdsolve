export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css', '~/assets/css/fluid-surfaces.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: 'CFD菜鸟｜CFD 与 Modelica 工程仿真平台',
      meta: [
        { name: 'description', content: 'CFD、OpenFOAM、Modelica、CAE 与无网格法知识库及工程计算工具。' },
        { name: 'theme-color', content: '#1769AA' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  nitro: { preset: 'node-server' }
})
