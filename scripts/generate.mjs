import fs from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 公共工具函数
const utils = {
  toPascalCase: (filename) => {
    return filename
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .split(' ')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join('');
  },

  parseSVGContent: (content) => {
    const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
    const widthMatch = content.match(/width="([^"]*)"/);
    const heightMatch = content.match(/height="([^"]*)"/);

    return {
      viewBox: viewBoxMatch?.[1] || '0 0 24 24',
      originalWidth: widthMatch?.[1] || '24',
      originalHeight: heightMatch?.[1] || '24',
      innerContent: content.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, ''),
    };
  },

  // 提取颜色信息获取逻辑到共享函数
  getColorInfo: (componentName) => {
    const colorFileName = `${
      componentName.charAt(0).toLowerCase() + componentName.slice(1)
    }-colors.json`;
    const colorFilePath = path.join(
      __dirname,
      `../optimized/graphic/colors/${colorFileName}`
    );

    let defaultColors = '{}';
    let processedContent = null;

    try {
      if (existsSync(colorFilePath)) {
        // 读取颜色文件内容
        const colorsContent = readFileSync(colorFilePath, 'utf8');
        defaultColors = colorsContent;
      }
    } catch (err) {
      console.warn(
        `Warning: Could not read color file ${colorFilePath}: ${err.message}`
      );
    }

    return { defaultColors, colorFilePath };
  },
};

// 组件模板
const templates = {
  react: {
    icon: (componentName, content) => {
      // 直接使用原始SVG内容
      let svgContent;
      if (typeof content === 'string') {
        svgContent = content;
      } else {
        try {
          svgContent = readFileSync(
            path.join(
              __dirname,
              `../optimized/icon/${componentName.toLowerCase()}.svg`
            ),
            'utf-8'
          );
        } catch (err) {
          console.error(`读取SVG文件失败: ${err.message}`);
          svgContent = '';
        }
      }

      // 提取SVG标签的属性部分
      const svgAttrsMatch = svgContent.match(/<svg([^>]*)>/i);

      if (!svgAttrsMatch) {
        console.error(`无法解析SVG内容: ${componentName}`);
        return `
import React from 'react';
export const ${componentName} = (props) => (
  <svg width="24px" height="24px" {...props} fill="currentColor" viewBox="0 0 24 24">
    {/* 无法解析原始SVG */}
  </svg>
);`;
      }

      // 转换SVG属性为React规范的属性名
      let attrs = svgAttrsMatch[1].replace(
        /([a-z]+-[a-z]+)=/g,
        (match, attrName) => {
          return (
            attrName
              .split('-')
              .map((part, index) =>
                index === 0
                  ? part
                  : part.charAt(0).toUpperCase() + part.slice(1)
              )
              .join('') + '='
          );
        }
      );

      // 提取SVG内部内容并转换内部属性名
      const innerContentMatch = svgContent.match(
        /<svg[^>]*>([\s\S]*?)<\/svg>/i
      );
      let innerContent = innerContentMatch ? innerContentMatch[1] : '';

      // 转换内部元素的属性名
      innerContent = innerContent.replace(
        /([a-z]+-[a-z]+)=/g,
        (match, attrName) => {
          return (
            attrName
              .split('-')
              .map((part, index) =>
                index === 0
                  ? part
                  : part.charAt(0).toUpperCase() + part.slice(1)
              )
              .join('') + '='
          );
        }
      );

      return `
import React from 'react';
export const ${componentName} = ({width = 24,height = 24,...props}) => (
  <svg ${attrs} 
  {...props}       
  viewBox="0 0 24 24"
  style={{
        width: typeof width === 'number' ? \`\${width}px\` : width,
        height: typeof height === 'number' ? \`\${height}px\` : height,
        ...props.style,
      }} >
    ${innerContent}
  </svg>
);`;
    },

    graphic: (
      componentName,
      { viewBox, innerContent },
      framework = 'react'
    ) => {
      // 获取颜色信息
      const { defaultColors } = utils.getColorInfo(componentName);

      // 处理 SVG 内容，替换 CSS 变量引用为 colors 对象引用
      let processedContent = innerContent;
      if (defaultColors !== '{}') {
        // 使用更可靠的正则表达式，确保正确匹配属性
        processedContent = innerContent.replace(
          /([fill|stroke])="var\(--([^,]+)[^"]*\)"/g,
          (match, attr, varName) => {
            return `${attr}={colors.${varName}}`;
          }
        );
      }

      // 转换 SVG 属性为 React 兼容的 camelCase 格式
      processedContent = processedContent
        .replace(/fill-rule/g, 'fillRule')
        .replace(/stroke-width/g, 'strokeWidth')
        .replace(/stroke-linecap/g, 'strokeLinecap')
        .replace(/stroke-linejoin/g, 'strokeLinejoin')
        .replace(/stroke-miterlimit/g, 'strokeMiterlimit')
        .replace(/stroke-dasharray/g, 'strokeDasharray')
        .replace(/stroke-dashoffset/g, 'strokeDashoffset')
        .replace(/clip-path/g, 'clipPath')
        .replace(/clip-rule/g, 'clipRule')
        .replace(/color-interpolation/g, 'colorInterpolation')
        .replace(/color-rendering/g, 'colorRendering')
        .replace(/dominant-baseline/g, 'dominantBaseline')
        .replace(/font-family/g, 'fontFamily')
        .replace(/font-size/g, 'fontSize')
        .replace(/font-style/g, 'fontStyle')
        .replace(/font-weight/g, 'fontWeight')
        .replace(/letter-spacing/g, 'letterSpacing')
        .replace(/stop-color/g, 'stopColor')
        .replace(/stop-opacity/g, 'stopOpacity')
        .replace(/text-anchor/g, 'textAnchor')
        .replace(/vector-effect/g, 'vectorEffect');

      return `
import React from 'react';

const defaultColors = ${defaultColors};

export const ${componentName} = ({
  width = "${viewBox.split(' ')[2]}",
  height = "${viewBox.split(' ')[3]}",
  colors = defaultColors,
  preserveAspectRatio = "xMidYMid meet",
  ...props
}) => {
  return (
    <svg
      {...props}
      viewBox="${viewBox}"
      style={{
        width: typeof width === 'number' ? \`\${width}px\` : width,
        height: typeof height === 'number' ? \`\${height}px\` : height,
        ...props.style,
      }}
      preserveAspectRatio={preserveAspectRatio}
    >
      ${processedContent}
    </svg>
  );
};
`;
    },
  },
};

// 组件生成函数
async function generateComponents(framework) {
  console.log(`\n========================================`);
  console.log(`🚀 开始为 ${framework.toUpperCase()} 生成组件...`);
  console.log(`========================================\n`);

  try {
    // 确保目录存在
    const iconsDir = path.join(__dirname, `../${framework}/src/icons`);
    const graphicsDir = path.join(__dirname, `../${framework}/src/graphics`);
    await fs.mkdir(iconsDir, { recursive: true });
    await fs.mkdir(graphicsDir, { recursive: true });

    // 处理图标
    const iconSrcDir = path.join(__dirname, '../optimized/icon');
    const iconFiles = await fs.readdir(iconSrcDir);

    for (const file of iconFiles) {
      if (file.endsWith('.svg')) {
        const componentName = utils.toPascalCase(file);
        const svgContent = await fs.readFile(
          path.join(iconSrcDir, file),
          'utf-8'
        );
        const parsedContent = utils.parseSVGContent(svgContent);

        // 生成对应框架的组件内容
        const componentContent = templates[framework].icon(
          componentName,
          parsedContent
        );

        // 写入组件文件
        await fs.writeFile(
          path.join(iconsDir, `${componentName}.jsx`),
          componentContent
        );
      }
    }

    console.log(`✅ 图标组件已生成!`);

    // 处理图形
    const graphicSrcDir = path.join(__dirname, '../optimized/graphic');
    const graphicFiles = await fs.readdir(graphicSrcDir);

    for (const file of graphicFiles) {
      if (file !== 'colors' && file.endsWith('.svg')) {
        const componentName = utils.toPascalCase(file.replace('.svg', ''));
        const svgPath = path.join(graphicSrcDir, file);
        if (existsSync(svgPath)) {
          const svgContent = await fs.readFile(svgPath, 'utf-8');
          const parsedContent = utils.parseSVGContent(svgContent);

          // 生成对应框架的组件内容
          const componentContent = templates[framework].graphic(
            componentName,
            parsedContent,
            framework
          );

          // 写入组件文件
          await fs.writeFile(
            path.join(graphicsDir, `${componentName}.jsx`),
            componentContent
          );
        }
      }
    }

    console.log(`✅ 图形组件已生成!`);

    // 生成入口文件
    const iconComponentFiles = await fs.readdir(iconsDir);
    const graphicComponentFiles = await fs.readdir(graphicsDir);

    await generateIndexContent(
      iconComponentFiles.filter((f) => !f.startsWith('index')),
      framework,
      'icons'
    );
    await generateIndexContent(
      graphicComponentFiles.filter((f) => !f.startsWith('index')),
      framework,
      'graphics'
    );

    console.log(`✅ 索引文件已生成!`);

    // 创建主入口文件
    const indexContent = `// 自动生成的入口文件 - ${new Date().toISOString()}
export * from './icons';
export * from './graphics';
`;

    await fs.writeFile(
      path.join(__dirname, `../${framework}/src/index.js`),
      indexContent
    );

    console.log(`✅ 主入口文件已生成!`);
    console.log(`🎉 ${framework.toUpperCase()} 组件生成完成!`);
  } catch (error) {
    console.error(`❌ 组件生成失败: ${error}`);
  }
}

// 生成索引文件内容
async function generateIndexContent(componentFiles, framework, type) {
  const indexContent = `// 自动生成的索引文件 - ${new Date().toISOString()}
${componentFiles
  .map((file) => {
    const name = file.replace('.jsx', '');
    return `export { ${name} } from './${file}';`;
  })
  .join('\n')}
`;

  await fs.writeFile(
    path.join(__dirname, `../${framework}/src/${type}/index.js`),
    indexContent
  );
}

// 执行生成
// 只支持React框架
const framework = 'react';
generateComponents(framework.toLowerCase());
