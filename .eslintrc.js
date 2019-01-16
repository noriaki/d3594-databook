module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: { // edit as you like
    indent: ['error', 2],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],
    'no-debugger': 'warn',
    'no-console': 'warn',
    'no-else-return': ['error', { allowElseIf: true }],
    'no-use-before-define': 'off',
    'no-confusing-arrow': ['error', { allowParens: true }],
    'function-paren-newline': 'off',
    'import/no-extraneous-dependencies': ['error', { dependencies: true } ],
  },
};
