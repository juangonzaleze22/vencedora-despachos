import flowbitePlugin from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/flowbite/**/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'title': ['Montserrat', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [
    flowbitePlugin,
  ],
}
