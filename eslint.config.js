// eslint.config.js

import globals from 'globals';
import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default typescriptEslint.config(
  // Global ignores
  {
    ignores: ['dist', 'node_modules', '.DS_Store'],
  },

  // 1. Core ESLint recommended config
  js.configs.recommended,

  // 2. TypeScript recommended config
  ...typescriptEslint.configs.recommended,

  // 3. React recommended config
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ...reactRecommended,
    settings: {
      react: {
        // Automatically detect the React version
        version: 'detect',
      },
    },
  },

  // 4. React Hooks config
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  
  // 5. Your Custom Rules and Global Settings
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true, // Enable JSX parsing
        },
      },
    },
    rules: {
      // Your custom rules go here.
      // Note: 'prettier/prettier' is removed in favor of running Prettier separately.
      'react/react-in-jsx-scope': 'off', // Not needed with modern React
      'react/prop-types': 'off', // Often handled by TypeScript
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // 6. Prettier config - MUST BE THE LAST ONE
  // This turns off all ESLint rules that might conflict with Prettier.
  prettierConfig
);