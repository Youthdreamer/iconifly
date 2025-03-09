# Iconifly 文档

这个目录包含 Iconifly SVG组件库的文档网站代码。

## 本地开发

1. 安装依赖:

```bash
cd doc
npm install
```

2. 启动开发服务器:

```bash
npm run docs:dev
```

3. 构建文档:

```bash
npm run docs:build
```

## 自动部署

当你推送更改到 'svg/' 目录或 'docs/' 目录时，GitHub Actions 会自动构建并部署文档到 GitHub Pages。

## 手动更新

如果你想手动更新文档中的组件展示，可以运行:

```bash
node scripts/generate-docs.mjs
```

这将根据当前 'svg/' 目录中的SVG文件重新生成文档内容。
