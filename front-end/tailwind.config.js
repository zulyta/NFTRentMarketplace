/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{html,js,vue,ts}',
    './layouts/**/*.{js,vue}',
    './pages/**/*.{html,js,vue}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
    './assets/**/*.css',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: 'class',
};
