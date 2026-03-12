module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // 微信小程序全局对象
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly'
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    semi: ['error', 'never'],
    quotes: ['error', 'single', { avoidEscape: true }],
    indent: ['error', 2],
    'comma-dangle': ['error', 'never'],
    eqeqeq: ['error', 'always'],
    'no-var': 'error',
    'prefer-const': 'warn'
  }
}
