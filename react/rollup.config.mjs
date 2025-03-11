import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/icons/index.js',
    output: {
      file: 'dist/icons/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx'], // 解析 .jsx 文件
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**', // 排除 node_modules
        presets: ['@babel/preset-react'], // 使用 React 预设
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: 'src/graphics/index.js',
    output: {
      file: 'dist/graphics/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx'],
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react'],
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs', // CommonJS 格式
        sourcemap: true,
      },
      {
        file: 'dist/index.es.js',
        format: 'es', // ES 模块格式
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({ extensions: ['.js', '.jsx'] }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-react'],
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: 'dist/types/index.d.ts', // TypeScript 编译生成的类型声明文件
    output: {
      file: 'dist/index.d.ts',
      format: 'es', // 类型声明使用 ES 模块格式
    },
    plugins: [dts()],
  },
];
//TODO npm install --save-dev rollup-plugin-dts 未安装
