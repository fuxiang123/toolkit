import DefaultTheme from 'vitepress/theme';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import { vuePlugin } from 'vitepress-demo-editor';
import 'vitepress-demo-editor/dist/style.css';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(Antd);
    app.use(vuePlugin, {
      defaultDirection: 'row', // 默认显示方向
      ms: 30, // 编辑器防抖时间
      handleError(errs) {}, // 错误信息
      onMonacoCreated(monaco) {}, // monaco 创建成功时触发
    });
  },
};
