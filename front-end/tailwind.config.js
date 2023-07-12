/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{html,js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.{html,js,vue}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
