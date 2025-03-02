module.exports = {
  content: [
    "./src/**/*.{html,ts,md}",
    "./src/app/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}