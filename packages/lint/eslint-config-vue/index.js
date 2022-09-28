module.exports = {
  env: {
    'vue/setup-compiler-macros': true,
  },
  extends: ['plugin:vue/vue3-recommended', 'neuton'],
  plugins: ['vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
};
