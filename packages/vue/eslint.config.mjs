// eslint.config.mjs
import vue from 'eslint-plugin-vue';
import vuetify from 'eslint-plugin-vuetify';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

// Create base config
const baseConfig = {
  files: ['**/*.{js,ts,vue}'],
  languageOptions: {
    parser: typescriptParser,
    globals: {
      ...globals.browser,
      ...globals.node,
    },
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  plugins: {
    vue,
    vuetify,
    '@typescript-eslint': typescript,
  },
  rules: {
    // Base rules
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',

    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',

    // Vue rules
    'vue/multi-word-component-names': 'off',

    // Vuetify rules
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/no-deprecated-components': 'error',
    'vuetify/no-deprecated-events': 'error',
    'vuetify/no-deprecated-props': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-deprecated-colors': 'error',
  },
};

// Vue specific overrides
const vueOverrides = {
  files: ['**/*.vue'],
  rules: {
    // Any Vue-specific rules
  },
};

// Ignore patterns
const ignores = {
  ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
};

export default [baseConfig, vueOverrides, ignores];
