import { optimize } from 'svgo';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 颜色格式转变
function rgbToHex(color) {
  // 匹配 rgb(a) 格式，支持新旧语法
  const rgbRegex =
    /rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)(?:\s*,\s*([\d.]+%?))?\s*\)/i;
  const match = color.match(rgbRegex);
  if (!match) return null;

  // 转换各通道值为0-255整数
  const parseChannel = (val) => {
    if (val.includes('%')) {
      return Math.round(parseFloat(val) * 2.55);
    }
    return Math.min(255, Math.max(0, parseInt(val)));
  };

  const r = parseChannel(match[1]);
  const g = parseChannel(match[2]);
  const b = parseChannel(match[3]);
  let a = match[4] ? parseFloat(match[4]) : 1;

  // 转换为HEX
  const toHex = (v) => v.toString(16).padStart(2, '0');
  let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  // 处理透明度
  if (a < 1) {
    const alpha = Math.round(a * 255);
    hex += toHex(alpha);
  }

  return hex.toLowerCase();
}

// 基本配置 - 不转换颜色
const baseConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          convertColors: false, // 禁用默认颜色转换
          removeUnknownsAndDefaults: false,
        },
      },
    },
  ],
};

// icon 配置 - 将所有颜色转换为 currentColor
const iconConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          convertColors: {
            currentColor: true, // 启用 currentColor 转换
            names2hex: true,
            rgb2hex: true,
          },
          removeUnknownsAndDefaults: false,
        },
      },
    },
  ],
};

// 提取SVG中的颜色并转换为CSS变量 (仅用于 graphic 类别)
function processGraphicSVG(svgContent, fileName) {
  // 提取颜色映射
  const colorMap = {};

  // 用于跟踪每种属性类型的颜色计数
  const attrCounts = { fill: 0, stroke: 0 };

  // 用于记录已处理过的颜色，避免重复
  const processedColors = new Map();

  // 正则表达式匹配 fill 和 stroke 属性
  const colorAttrRegex = /(fill|stroke)=["']([^"']+)["']/gi;
  let match;

  // 查找并替换所有颜色属性
  let processedContent = svgContent;

  while ((match = colorAttrRegex.exec(svgContent)) !== null) {
    const [fullMatch, attr, color] = match;

    // 跳过 none 和 currentColor
    if (color === 'none' || color === 'currentColor') continue;

    let hexColor = color;

    // 转换 RGB 颜色
    if (color.toLowerCase().startsWith('rgb')) {
      hexColor = rgbToHex(color) || color;
    }

    // 只处理 HEX 颜色
    if (hexColor.startsWith('#')) {
      // 检查这个颜色是否已经处理过
      if (processedColors.has(hexColor)) {
        // 如果已处理过，使用之前生成的变量名
        const colorId = processedColors.get(hexColor);

        // 替换为 CSS 变量
        const newAttr = `${attr}="var(--${colorId}, ${hexColor})"`;
        processedContent = processedContent.replace(fullMatch, newAttr);

        console.log(`变量复用: ${color} → ${hexColor} → var(--${colorId})`);
      } else {
        // 如果是新颜色，生成新的变量名
        attrCounts[attr]++;

        // 生成变量名：第一个使用 fill 或 stroke，后续使用 fill2, fill3 等
        let colorId;
        if (attrCounts[attr] === 1) {
          colorId = attr; // 第一个颜色直接使用属性名
        } else {
          colorId = `${attr}${attrCounts[attr]}`; // 后续颜色添加序号
        }

        // 记录这个颜色已经处理过
        processedColors.set(hexColor, colorId);

        // 保存到颜色映射
        colorMap[colorId] = hexColor;

        // 替换为 CSS 变量
        const newAttr = `${attr}="var(--${colorId}, ${hexColor})"`;
        processedContent = processedContent.replace(fullMatch, newAttr);

        console.log(`变量转换: ${color} → ${hexColor} → var(--${colorId})`);
      }
    }
  }

  return {
    content: processedContent,
    colorMap,
  };
}

// 保存所有颜色信息到总映射文件
let allColorMaps = {};

// 不再需要复杂的颜色命名系统
// class ColorNamingSystem { ... }

// 创建颜色命名系统实例
// const colorNaming = new ColorNamingSystem();

async function processCategory(category) {
  console.log(`\n===== 开始处理 ${category} 类别 =====`);

  const inputDir = path.join(__dirname, '../svg', category);
  const outputDir = path.join(__dirname, '../optimized', category);

  // 确保输出目录存在
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`已创建输出目录: ${outputDir}`);

  // 如果是 graphic 类别，创建 colors 目录
  let colorsDir;
  if (category === 'graphic') {
    colorsDir = path.join(outputDir, 'colors');
    if (!existsSync(colorsDir)) {
      mkdirSync(colorsDir, { recursive: true });
      console.log(`已创建颜色目录: ${colorsDir}`);
    }
  }

  // 获取所有SVG文件
  const files = await fs.readdir(inputDir);
  const svgFiles = files.filter((f) => f.endsWith('.svg'));

  console.log(
    `处理 ${category} 类别的 ${svgFiles.length} 个SVG文件: ${svgFiles.join(
      ', '
    )}`
  );

  // 处理每个文件
  for (const file of svgFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    const fileName = path.basename(file, '.svg');

    console.log(`\n开始处理文件: ${file}`);
    console.log(`- 输入路径: ${inputPath}`);
    console.log(`- 输出路径: ${outputPath}`);

    // 检查输入文件是否存在
    try {
      await fs.access(inputPath);
    } catch (err) {
      console.error(`错误: 输入文件不存在 - ${inputPath}`);
      continue;
    }

    // 读取SVG内容
    let content;
    try {
      content = await fs.readFile(inputPath, 'utf8');
      console.log(`- 成功读取文件，大小: ${content.length} 字节`);
    } catch (err) {
      console.error(`错误: 无法读取文件 - ${err.message}`);
      continue;
    }

    // 添加图片标记
    content = content.replace(
      /<image([^>]*)href="([^"]+)"/g,
      '<image$1data-replaceable="$2"'
    );

    // 根据类别选择不同的处理方式
    let config;

    if (category === 'graphic') {
      // graphic 类别：保留原色并转换为 CSS 变量
      console.log(`- 处理 graphic 类别: 保留原色并转换为 CSS 变量`);
      const { content: processedContent, colorMap } = processGraphicSVG(
        content,
        fileName
      );
      content = processedContent;

      if (Object.keys(colorMap).length > 0) {
        // 颜色映射文件放在 optimized/graphic/colors 下，文件名与 SVG 名称一致
        const colorMapPath = path.join(colorsDir, `${fileName}-colors.json`);

        // 保存到单独文件
        writeFileSync(colorMapPath, JSON.stringify(colorMap, null, 2));

        // 添加到总映射
        allColorMaps[fileName] = colorMap;

        console.log(
          `- 生成颜色映射: colors/${fileName}-colors.json (${
            Object.keys(colorMap).length
          } 个颜色)`
        );
      }

      // 使用基本配置优化 SVG (不转换颜色)
      config = {
        ...baseConfig,
        path: inputPath,
      };
    } else if (category === 'icon') {
      // icon 类别：将所有颜色转换为 currentColor
      console.log(`- 处理 icon 类别: 将所有颜色转换为 currentColor`);

      // 使用 icon 配置优化 SVG (转换为 currentColor)
      config = {
        ...iconConfig,
        path: inputPath,
      };
    } else {
      // 其他类别：使用基本配置
      console.log(`- 处理其他类别: 使用基本配置`);
      config = {
        ...baseConfig,
        path: inputPath,
      };
    }

    // 优化 SVG
    try {
      const result = optimize(content, config);
      console.log(`- 优化成功，结果大小: ${result.data.length} 字节`);

      // 写入优化后的文件
      await fs.writeFile(outputPath, result.data);
      console.log(`- 文件已保存: ${outputPath}`);
    } catch (err) {
      console.error(`错误: 优化失败 - ${err.message}`);
      continue;
    }

    console.log(`优化完成 [${category}]: ${file}`);
  }
}

async function main() {
  try {
    // 处理各类别
    await processCategory('graphic');
    await processCategory('icon');

    // 输出处理结果统计
    console.log('\n处理结果统计:');

    // 检查 graphic 目录
    try {
      const graphicFiles = await fs.readdir(
        path.join(__dirname, '../optimized/graphic')
      );
      console.log(`- graphic 类别: ${graphicFiles.length} 个文件`);
    } catch (err) {
      console.log(`- graphic 类别: 0 个文件 (${err.message})`);
    }

    // 检查 icon 目录
    try {
      const iconFiles = await fs.readdir(
        path.join(__dirname, '../optimized/icon')
      );
      console.log(`- icon 类别: ${iconFiles.length} 个文件`);
    } catch (err) {
      console.log(`- icon 类别: 0 个文件 (${err.message})`);
    }

    // 保存所有颜色信息到一个总文件
    if (Object.keys(allColorMaps).length > 0) {
      // 创建 optimized/graphic/colors 目录（如果还不存在）
      const graphicColorsDir = path.join(
        __dirname,
        '../optimized/graphic/colors'
      );
      if (!existsSync(graphicColorsDir)) {
        mkdirSync(graphicColorsDir, { recursive: true });
      }

      const allColorsPath = path.join(graphicColorsDir, 'all-colors.json');
      writeFileSync(allColorsPath, JSON.stringify(allColorMaps, null, 2));
      console.log(
        `已生成颜色总映射文件: optimized/graphic/colors/all-colors.json`
      );
    }

    // 不再需要保存颜色命名映射
    // colorNaming.saveColorMapToFile();

    console.log('✅ 所有SVG文件优化完成!');
  } catch (error) {
    console.error('错误:', error);
  }
}

// 调试辅助函数 - 输出目录内容
async function listDir(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    console.log(`目录 ${dirPath} 内容:`);
    for (const file of files) {
      console.log(`- ${file}`);
    }
  } catch (err) {
    console.error(`无法读取目录 ${dirPath}: ${err.message}`);
  }
}

// 执行前先检查输入目录
async function checkInputDirs() {
  console.log('检查输入目录...');
  await listDir(path.join(__dirname, '../svg/graphic'));
  await listDir(path.join(__dirname, '../svg/icon'));
}

// 先检查输入目录，然后执行主程序
checkInputDirs()
  .then(() => main())
  .catch(console.error);
