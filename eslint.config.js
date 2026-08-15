module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['dist/**', 'node_modules/**', '_backup/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        location: 'readonly', console: 'readonly', setTimeout: 'readonly',
        clearTimeout: 'readonly', MutationObserver: 'readonly',
        NodeFilter: 'readonly', getComputedStyle: 'readonly',
        requestAnimationFrame: 'readonly', IntersectionObserver: 'readonly',
        Promise: 'readonly', Event: 'readonly',
        Swiper: 'readonly', PureCounter: 'readonly',
        module: 'writable', require: 'readonly', __dirname: 'readonly',
        // sdílené napříč moduly (build.js je slučuje do jednoho IIFE)
        SEL: 'readonly', $$: 'readonly', $1: 'readonly',
        onReady: 'readonly', has: 'readonly', hasJQ: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error'
    }
  }
];
