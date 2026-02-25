/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
  safelist: [
    { pattern: /bg-(blue|green|amber|slate|indigo|sky|red)-(50|100|200|300|400|500|600|700)/ },
    { pattern: /text-(blue|green|amber|slate|indigo|sky|red)-(400|500|600|700|800)/ },
    { pattern: /border-(blue|green|amber|slate|indigo|sky|red)-(100|200|300|400)/ },
  ]
}
