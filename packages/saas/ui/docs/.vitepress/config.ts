import { defineConfig } from 'vitepress';

export default defineConfig({
  lastUpdated: true,
  themeConfig: {
    lastUpdatedText: '最近更新时间',
    docFooter: { prev: '上一篇', next: '下一篇' },
    editLink: {
      pattern: 'https://e.gitee.com/ningdongyiliao/repos/ningdongyiliao/neuton-toolkit/tree/master/packages/saas/ui/docs/:path',
      text: '在代码仓库中编辑此页',
    },
    socialLinks: [{ icon: 'github', link: 'https://e.gitee.com/ningdongyiliao/repos/ningdongyiliao/neuton-toolkit/tree/master/packages/saas/ui' }],
    nav: [
      { text: '快速开始', link: '/guide/getting-started', activeMatch: '/guide/getting-started' },
      { text: '组件一览', link: '/components/index', activeMatch: '/components/index' },
    ],
    sidebar: [
      {
        text: '指引',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '组件一览', link: '/components/index' },
        ],
      },
      {
        text: '组件',
        items: [{ text: '异步按钮', link: '/components/async-button/index' }],
      },
    ],
  },
});
