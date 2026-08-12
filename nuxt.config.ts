export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['katex/dist/katex.min.css', '~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      title: '流研工坊 FlowLab｜CFD 与 Modelica 工程仿真平台',
      meta: [
        { name: 'description', content: '面向 CFD、系统仿真与航空发动机工程用户的知识、计算、建模与社区平台。' },
        { name: 'theme-color', content: '#FCFAF8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  nitro: { preset: 'node-server' }
})
