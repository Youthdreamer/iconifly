# Iconifly

[中文](#chinese) | [English](#english)

<a id="chinese"></a>

## 中文

一个可自定义的现代 SVG 图标和图形库，支持 React。

### 安装

```bash
npm install @iconifly/react
```

### 使用方法

### 内联

复制需要的 svg 并将其直接内联到您的 HTML 中使用

```html
<svg width="24" height="24" fill="#000000">
  <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
</svg>
```

#### React

```jsx
import { Homeicon } from '@iconifly/react/icons';
import { Filmgraphic } from '@iconifly/react/graphics';

function App() {
  return (
    <div>
      {/* 基本使用 */}
      <Homeicon fill="red" />

      {/* 自定义大小 */}
      <Homeicon width={32} height={32} />

      {/* 选择保持宽高比 */}
      <Filmgraphic
        preserveAspectRatio="none"
        colors={{
          fill: '#333',
          fill2: '#e0e0e0',
        }}
      />

      {/* 自定义颜色 */}
      <Filmgraphic
        colors={{
          fill: '#333',
          fill2: '#e0e0e0',
        }}
      />

      {/* 传递其他属性 */}
      <Homeicon
        onClick={() => console.log('Icon clicked')}
        className="my-icon"
      />
    </div>
  );
}
```

### 添加新图标

1. 将 SVG 文件放入 `svg/icon` 或 `svg/graphic` 目录
2. 运行 `npm run optimize` 优化 SVG 文件并生成颜色映射
3. 运行 `npm run generate` 生成组件
4. 运行 `npm run build:all` 构建组件库

### 开发

```bash
# 克隆仓库
git clone https://github.com/Youthdreamer/iconifly.git
cd iconifly

# 安装依赖
npm install

# 优化 SVG 文件
npm run optimize

# 生成组件
npm run generate

# 构建组件库
npm run build
```

### 文档

有关更详细的文档、示例和可用图标，请访问[文档网站](https://youthdreamer.github.io/iconifly/)。

### 许可证

MIT

---

<a id="english"></a>

## English

A customizable modern SVG icon and graphic library, supporting React.

### Installation

```bash
npm install @iconifly/react
```

### Usage

```jsx
import { Homeicon } from '@iconifly/react/icons';
import { Filmgraphic } from '@iconifly/react/graphics';

function App() {
  return (
    <div>
      {/* Basic usage */}
      <Homeicon />

      {/* Custom size */}
      <Homeicon width={32} height={32} fill="red"/>

      {/* Preserve aspect ratio */}
      <Filmgraphic
        preserveAspectRatio="none"
        colors={{
          fill: '#333',
          fill2: '#e0e0e0',
        }}
      />

      {/* Custom colors */}
      <Filmgraphic
        colors={{
          fill: '#333',
          fill2: '#e0e0e0',
        }}
      />

      {/* Pass other props */}
      <Homeicon
        onClick={() => console.log('Icon clicked')}
        className="my-icon"
      />
    </div>
  );
}
```

### Adding New Icons

1. Put SVG files in the `svg/icon` or `svg/graphic` directory
2. Run `npm run optimize` to optimize SVG files and generate color maps
3. Run `npm run generate` to generate components
4. Run `npm run build` to build the component library

### Development

```bash
# Clone repository
git clone https://github.com/Youthdreamer/iconifly.git
cd iconifly

# Install dependencies
npm install

# Optimize SVG files
npm run optimize

# Generate components
npm run generate

# Build component library
npm run build
```

### Documentation

For more detailed documentation, examples, and available icons, please visit the [documentation website](https://youthdreamer.github.io/iconifly/).

### License

MIT
