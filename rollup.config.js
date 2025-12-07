import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import { defineConfig } from 'rollup';

const dev = !!process.env.ROLLUP_WATCH;

export default defineConfig(() => ({
  input: 'src/flightradar-flight-card.ts',
  output: {
    file: 'dist/flightradar-flight-card.js',
    format: 'es',
    inlineDynamicImports: true,
    sourcemap: dev,
  },
  plugins,
  watch: {
    clearScreen: false,
  },
}));

const plugins = [
  resolve({ browser: true }),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    sourceMap: dev,
    inlineSources: dev,
  }),
];

if (dev) {
  plugins.push(
    serve({
      contentBase: ['./dist'],
      host: '0.0.0.0',
      port: 4000,
      allowCrossOrigin: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  );
} else {
  plugins.push(
    terser({
      format: {
        comments: false,
      },
    })
  );
}
