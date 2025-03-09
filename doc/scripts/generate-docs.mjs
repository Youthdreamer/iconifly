import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// 获取所有SVG组件
async function getSvgComponents() {
  const categories = {
    icons: {
      path: path.join(PROJECT_ROOT, 'optimized/icon'),
      components: [],
    },
    graphics: {
      path: path.join(PROJECT_ROOT, 'optimized/graphic'),
      components: [],
    },
  };

  // 读取图标和图形组件
  for (const [category, config] of Object.entries(categories)) {
    try {
      const files = await fs.readdir(config.path);
      config.components = files
        .filter((file) => file.endsWith('.svg'))
        .map((file) => {
          const name = path.basename(file, '.svg');
          const pascalName = name
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

          return {
            name: name,
            pascalName: pascalName,
            file: file,
            path: path.join(config.path, file),
          };
        });
    } catch (error) {
      console.error(`读取 ${category} 组件时出错:`, error);
    }
  }

  return categories;
}

// 生成组件展示页面
async function generateComponentPages(categories) {
  const componentsDir = path.join(__dirname, '../docs/components');

  // 创建组件目录
  await fs.mkdir(componentsDir, { recursive: true });

  // 生成图标页面
  await generateCategoryPage(
    'icons',
    categories.icons.components,
    componentsDir
  );

  // 生成图形页面
  await generateCategoryPage(
    'graphics',
    categories.graphics.components,
    componentsDir
  );

  // 生成索引页面
  await generateIndexPage(categories);
}

// 生成分类页面
async function generateCategoryPage(category, components, outputDir) {
  const displayName = category === 'icons' ? '图标' : '图形';
  let content = `# ${displayName}\n\n`;

  content += `这里展示了所有可用的${displayName}组件。\n\n`;

  content += `## 安装\n\n`;
  content += `\`\`\`bash\n`;
  content += `npm install @iconifly/react\n`;
  content += `\`\`\`\n\n`;

  content += `## 使用方法\n\n`;

  if (category === 'icons') {
    content += `### React\n\n`;
    content += `\`\`\`jsx\n`;
    content += `import { Sunicon } from '@iconifly/react';\n\n`;
    content += `function App() {\n`;
    content += `  return <Sunicon width={24} height={24} />;\n`;
    content += `}\n`;
    content += `\`\`\`\n\n`;
  } else {
    content += `### React\n\n`;
    content += `\`\`\`jsx\n`;
    content += `import { Filmgraphic } from '@iconifly/react';\n\n`;
    content += `function App() {\n`;
    content += `  return <Filmgraphic width={100} height={60} />;\n`;
    content += `}\n`;
    content += `\`\`\`\n\n`;
  }

  content += `## 组件列表\n\n`;
  content += `<div class="component-grid">\n`;

  for (const component of components) {
    try {
      // 读取SVG内容
      const svgContent = await fs.readFile(component.path, 'utf-8');

      content += `<div class="component-item">\n`;
      content += `  <div class="component-preview">\n`;
      content += `    ${svgContent}\n`;
      content += `  </div>\n`;
      content += `  <div class="component-name">${component.pascalName}</div>\n`;
      content += `</div>\n`;
    } catch (error) {
      console.error(`读取SVG文件 ${component.path} 时出错:`, error);
    }
  }

  content += `</div>\n\n`;

  // 添加组件列表表格
  content += `## 组件属性\n\n`;

  if (category === 'icons') {
    content += `| 属性名 | 类型 | 默认值 | 描述 |\n`;
    content += `| ----- | ---- | ------ | ---- |\n`;
    content += `| width | String, Number | "24" | 图标宽度 |\n`;
    content += `| height | String, Number | "24" | 图标高度 |\n`;
    content += `| color | String | "currentColor" | 图标颜色 |\n`;
  } else {
    content += `| 属性名 | 类型 | 默认值 | 描述 |\n`;
    content += `| ----- | ---- | ------ | ---- |\n`;
    content += `| width | String, Number | "100" | 图形宽度 |\n`;
    content += `| height | String, Number | "60" | 图形高度 |\n`;
    content += `| colors | Object | {} | 颜色对象 |\n`;
    content += `| preserveAspectRatio | String | "xMidYMid meet" | SVG preserveAspectRatio 属性 |\n`;
  }

  await fs.writeFile(path.join(outputDir, `${category}.md`), content);
}

// 生成首页
async function generateIndexPage(categories) {
  const iconsCount = categories.icons.components.length;
  const graphicsCount = categories.graphics.components.length;

  const content = `---
layout: home
hero:
  name: Iconifly
  text: 轻量级SVG图标和图形库
  tagline: 为现代web应用提供优质SVG组件
  actions:
    - theme: brand
      text: 图标组件(${iconsCount})
      link: /components/icons
    - theme: alt
      text: 图形组件(${graphicsCount})
      link: /components/graphics
features:
  - title: 轻量级
    details: 每个组件都经过优化，确保最小的文件大小
  - title: 易于使用(文档在异次元)
    details: 支持React，使用方式简单直接
  - title: 可定制(激情调教，欲火焚身)
    details: 支持颜色、大小和其他属性的自定义
  - title: 现代化/画(现代人画的)
    details: 会使用圆角(≧▽≦)
---

# Iconifly SVG组件库

Iconifly是一个轻量级SVG组件库，提供了${iconsCount}个图标和${graphicsCount}个图形组件，支持React。(正在以蜗牛速度更新，bug们可能会在仓库里开party，我通常很少打扰它们，我果然一直是个好人。)

<style>
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  transition: transform 0.2s, box-shadow 0.2s;
}

.component-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.component-preview {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.component-preview svg {
  max-width: 100%;
  max-height: 100%;
}

.component-name {
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}
</style>
`;

  await fs.writeFile(path.join(__dirname, '../docs/index.md'), content);
}

// 创建配置文件
async function generateConfig() {
  // 创建自定义样式文件
  const customCss = `/* 基础样式 */
:root {
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
  --vp-c-brand-dark: #5954cc;
  /* 自定义卡片阴影 */
  --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 针对主页标题的特殊间距调整 */
.vp-doc h1:nth-of-type(1) {
  margin-top: 60px 
}

/* 隐藏外观切换按钮旁边的VitePress文本 */
.VPNavBarAppearance .text,
.VPNavBarAppearance .VPSwitchAppearance .text {
  display: none !important;
}

/* 为外观切换按钮添加中文文本 */
.VPNavBarAppearance::after {
  content: '主题';
  font-size: 14px;
  margin-left: 8px;
}

/* 移动设备上外观切换按钮的文本 */
.VPNavScreenAppearance .text {
  display: none !important;
}

.VPNavScreenAppearance::before {
  content: '外观';
  margin-right: 8px;
}

/* 隐藏底部由VitePress提供支持的文本 */
.VPDocFooter .text + a[href^="https://vitepress.dev"],
.VPDocFooter > div > span:has(a[href^="https://vitepress.dev"]) {
  display: none !important;
}

.VPSidebarItem .VPLink.active .link-text {
  /* color: var(--vp-c-brand) !important; */
  color: white !important;
  font-weight: 600;
}

.VPSidebarItem .VPLink.active {
  /* background-color: var(--vp-c-bg-soft); */
  background-color: var(--vp-c-brand);
  border-radius: 8px;
  padding: 8px 14px !important;
  margin: 0 -14px;
  position: relative;
  box-shadow: var(--card-shadow);
  /* border-left: 3px solid var(--vp-c-brand); */
  transition: all 0.3s ease;
}

.VPSidebarItem.is-active > .item > .VPLink {
  /* background-color: var(--vp-c-bg-soft); */
  background-color: var(--vp-c-brand);
  color: white !important;
  border-radius: 8px;
  padding: 8px 14px !important;
  margin: 0 -14px;
  position: relative;
  box-shadow: var(--card-shadow);
  /* border-left: 3px solid var(--vp-c-brand); */
}


/* 组件展示网格样式 */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-soft);
  transition: transform 0.2s, box-shadow 0.2s;
}

.component-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.component-preview {
  width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.component-preview svg {
  max-width: 100%;
  max-height: 100%;
}

.component-name {
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}

.VPSidebarItem.is-active > .item > .VPLink .text {
  color: white !important;
}

/* 深色模式下调整样式 */
.dark .VPSidebarItem .VPLink.active,
.dark .VPSidebarItem.is-active > .item > .VPLink {
  background-color: var(--vp-c-brand-dark);
}
`;

  await fs.mkdir(path.join(__dirname, '../docs/.vitepress/theme'), {
    recursive: true,
  });
  await fs.writeFile(
    path.join(__dirname, '../docs/.vitepress/theme/custom.css'),
    customCss
  );

  // 创建主题配置，用于处理VitePress标识
  const enhanceAppJs = `// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app, router }) {
    // 在客户端挂载后执行
    if (typeof window !== 'undefined') {
      router.onAfterRouteChanged = () => {
        setTimeout(removeVitePressText, 100)
      }
      
      // 初始挂载时执行一次
      setTimeout(removeVitePressText, 100)
      
      // 添加DOM变化监听，确保动态内容也被处理
      if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
          removeVitePressText()
        })
        
        setTimeout(() => {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          })
        }, 200)
      }
    }
  }
}

// 处理VitePress文本的函数
function removeVitePressText() {
  try {
    // 处理顶部导航栏中的VitePress文本
    const navBarTexts = document.querySelectorAll('.VPNavBarTitle, .VPNavBarAppearance .text')
    navBarTexts.forEach(el => {
      if (el.textContent.includes('VitePress')) {
        if (el.classList.contains('VPNavBarTitle')) {
          // 针对标题特殊处理
          const titleEl = el.querySelector('.title')
          if (titleEl && titleEl.textContent === 'VitePress') {
            titleEl.textContent = 'Iconifly'
          }
        } else {
          el.textContent = '主题'
        }
      }
    })
    
    // 处理VitePress相关链接
    const vitepressLinks = document.querySelectorAll('a[href^="https://vitepress.dev"]')
    vitepressLinks.forEach(link => {
      const parent = link.parentNode
      if (parent && parent.tagName !== 'PRE' && parent.tagName !== 'CODE') {
        // 找到包含"Powered by"的父元素并隐藏
        let container = parent
        while (container && !container.textContent.includes('Powered by') && container.tagName !== 'BODY') {
          container = container.parentNode
        }
        
        if (container && container.tagName !== 'BODY') {
          container.style.display = 'none'
        }
      }
    })
    
    // 处理移动设备视图中的VitePress文本
    const mobileTexts = document.querySelectorAll('.VPNavScreenAppearance .text')
    mobileTexts.forEach(el => {
      if (el.textContent.includes('VitePress') || el.textContent === 'Appearance') {
        el.textContent = '外观'
      }
    })
    
  } catch (e) {
    console.error('处理VitePress文本时出错:', e)
  }
}`;

  await fs.writeFile(
    path.join(__dirname, '../docs/.vitepress/theme/index.js'),
    enhanceAppJs
  );
}

// 创建简单的logo
// async function createLogo() {
//   const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
//   <rect width="32" height="32" rx="6" fill="#646cff" />
//   <path d="M16 8l10 16H6z" fill="#fff" />
// </svg>`;

//   const publicDir = path.join(__dirname, '../public');
//   await fs.mkdir(publicDir, { recursive: true });
//   await fs.writeFile(path.join(publicDir, 'logo.svg'), logoSvg);
// }

// 创建GitHub Actions部署文件
async function createGitHubActions() {
  // const workflowDir = path.join(__dirname, '../../.github/workflows');
  const workflowDir = path.join(__dirname, '../../.github/workflows');
  const workflowExists = existsSync(workflowDir);

  if (!workflowExists) {
    await fs.mkdir(workflowDir, { recursive: true });
  }

  const deployYml = `name: 部署文档

on:
  push:
    branches: [master, main]
    paths:
      - 'svg/**'
      - 'docs/**'

  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - name: 检出代码
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 禁用Jekyll构建
        working-directory: ./doc
        run: |
          touch docs/.vitepress/.nojekyll

      - name: 设置Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: doc/package-lock.json

      - name: 安装依赖
        working-directory: ./doc
        run: npm ci

      - name: 构建文档
        working-directory: ./doc
        run: npm run docs:build

      - name: 上传制品
        uses: actions/upload-pages-artifact@v3
        with:
          path: doc/docs/.vitepress/dist

      - name: 部署到GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  await fs.writeFile(path.join(workflowDir, 'deploy-docs.yml'), deployYml);
}

// 创建使用说明
async function createUsageInstructions() {
  const readmeContent = `# Iconifly 文档

这个目录包含 Iconifly SVG组件库的文档网站代码。

## 本地开发

1. 安装依赖:

\`\`\`bash
cd doc
npm install
\`\`\`

2. 启动开发服务器:

\`\`\`bash
npm run docs:dev
\`\`\`

3. 构建文档:

\`\`\`bash
npm run docs:build
\`\`\`

## 自动部署

当你推送更改到 'svg/' 目录或 'docs/' 目录时，GitHub Actions 会自动构建并部署文档到 GitHub Pages。

## 手动更新

如果你想手动更新文档中的组件展示，可以运行:

\`\`\`bash
node scripts/generate-docs.mjs
\`\`\`

这将根据当前 'svg/' 目录中的SVG文件重新生成文档内容。
`;

  await fs.writeFile(path.join(__dirname, '../README.md'), readmeContent);
}

// 主函数
async function main() {
  try {
    // 创建必要的目录
    await fs.mkdir(path.join(__dirname, '../docs/components'), {
      recursive: true,
    });

    // 获取SVG组件
    const categories = await getSvgComponents();

    // 生成组件页面
    await generateComponentPages(categories);

    // 生成配置文件
    await generateConfig();

    // 创建logo
    // await createLogo();

    // // 创建GitHub Actions部署文件
    // await createGitHubActions();

    // // 创建使用说明
    // await createUsageInstructions();

    console.log('✅ 文档生成成功!');
  } catch (error) {
    console.error('生成文档失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();
