module.exports = {
  parser: '@typescript-eslint/parser', // 定义ESLint的解析器,
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  settings: {
    'import/extensions': ['.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    ecmaVersion: 2021,
  },
  rules: {
    'prefer-promise-reject-errors': 'off',
    'prettier/prettier': 'error',
    'arrow-body-style': 'off',
    'no-else-return': 'off',
    'no-debugger': 'warn',
    camelcase: 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'linebreak-style': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    'import/prefer-default-export': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    radix: 'off',
    'one-var': 'off',
    'dot-notation': 'off',
    'import/no-cycle': 'off',
    'import/no-named-as-default': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-as-default-member': 'off',
    'import/no-import-module-exports': 'off',
    'import/extensions': 'off',
  },
};
