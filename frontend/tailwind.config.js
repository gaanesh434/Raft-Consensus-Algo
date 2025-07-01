/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        raft: {
          leader: '#10b981',
          candidate: '#f59e0b',
          follower: '#3b82f6',
          failed: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}