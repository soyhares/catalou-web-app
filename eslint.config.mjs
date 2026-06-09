import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/** Custom rule: warn when `style` prop is passed to a React component (non-HTML element). */
const noInlineStyleOnComponent = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow inline style prop on React components' },
    schema: [],
    messages: {
      noStyle:
        'Avoid inline `style` prop on component <{{name}}>. Use Tailwind classes instead.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.type === 'JSXIdentifier' &&
          node.name.name === 'style' &&
          node.parent.type === 'JSXOpeningElement' &&
          node.parent.name.type === 'JSXIdentifier' &&
          /^[A-Z]/.test(node.parent.name.name)
        ) {
          context.report({
            node,
            messageId: 'noStyle',
            data: { name: node.parent.name.name },
          });
        }
      },
    };
  },
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'local': { rules: { 'no-inline-style-on-component': noInlineStyleOnComponent } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'local/no-inline-style-on-component': 'warn',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'src/generated/'],
  },
);
