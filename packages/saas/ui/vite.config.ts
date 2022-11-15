import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import path from 'path';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': './src',
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    dts({
      entryRoot: path.resolve(__dirname, 'src/components'),
    }),
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, 'src/components/index.ts'),
      name: '@neuton/saas-ui',
      // the proper extensions will be added
      formats: ['es', 'cjs'],
      fileName: format => (format === 'cjs' ? `index.js` : `index.js.${format}.js`),
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'ant-design-vue'],
    },
  },
});
