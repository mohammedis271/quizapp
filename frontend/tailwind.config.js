/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        quizfun: {
          "primary": "#7c3aed",
          "primary-content": "#ffffff",
          "secondary": "#ec4899",
          "secondary-content": "#ffffff",
          "accent": "#facc15",
          "accent-content": "#1f1147",
          "neutral": "#1f1147",
          "neutral-content": "#ffffff",
          "base-100": "#fdf4ff",
          "base-200": "#f5e1ff",
          "base-300": "#e9c9ff",
          "base-content": "#1f1147",
          "info": "#0284c7",
          "info-content": "#ffffff",
          "success": "#16a34a",
          "success-content": "#ffffff",
          "warning": "#ea580c",
          "warning-content": "#ffffff",
          "error": "#dc2626",
          "error-content": "#ffffff",
          "--rounded-box": "1.5rem",
          "--rounded-btn": "1rem",
          "--rounded-badge": "1.9rem",
        },
      },
      "synthwave",
    ],
  },
}
