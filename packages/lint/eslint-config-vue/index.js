module.exports = {
  env: {
    'vue/setup-compiler-macros': true,
  },
  extends: ['plugin:vue/vue3-recommended', '@fuxiang1234/eslint-config'],
  plugins: ['vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
};
