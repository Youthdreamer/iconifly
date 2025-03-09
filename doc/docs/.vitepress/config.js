import { defineConfig } from 'vitepress';

export default defineConfig({
  // 站点级配置
  base: '/iconifly/',
  lang: 'zh-CN',
  title: 'Iconifly',
  description: '轻量级SVG图标和图形库',
  head: [
    ['link', { rel: 'icon', href: './public/favicon.ico' }], // 占位而已，需要设计
    [
      'meta',
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,minimum-scale=1',
      },
    ],
    ['meta', { name: 'theme-color', content: '#646cff' }],
  ],

  // 清理URL，移除.html后缀
  cleanUrls: true,

  // 启用最后更新时间
  lastUpdated: true,

  // 主题级配置
  themeConfig: {
    logo: {
      light: './public/logo-dark.svg', // 路径以项目根目录为基准
      dark: './public/logo-dark.svg', // 可选
      alt: 'Logo', // 图片alt描述
    },
    // 侧边栏配置 - 只保留组件相关页面
    sidebar: {
      '/': [
        {
          text: '组件',
          items: [
            { text: '图标', link: '/components/icons' },
            { text: '图形', link: '/components/graphics' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Youthdreamer/iconifly' },
    ],

    // 页脚
    footer: {
      message:
        "使用MIT许可证发布 | Being lost is just life's way of saying, Take the scenic route.",
      copyright: 'Copyright ' + new Date().getFullYear(),
    },

    // 其他UI文本
    outline: { label: '目录' },
    lastUpdatedText: '最后更新',
    darkModeSwitchLabel: '主题',
    returnToTopLabel: '返回顶部',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    // 搜索配置 - 限制只搜索组件页面
    search: {
      provider: 'local',
      options: {
        paths: ['/components/icons', '/components/graphics'],
        placeholder: '搜索组件...',
        translations: {
          button: {
            buttonText: '搜索组件',
            buttonAriaLabel: '搜索组件',
          },
          modal: {
            noResultsText: '没有找到相关组件',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详细信息',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
  },

  // Vite相关配置
  vite: {
    server: {
      fs: {
        // 允许读取上级目录文件
        allow: ['..'],
      },
    },
    build: {
      minify: 'terser',
      chunkSizeWarningLimit: 1000,
    },
  },
});
