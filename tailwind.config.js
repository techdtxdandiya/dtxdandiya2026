/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      fontFamily: {
        edwardian: ['ITC Edwardian Script W04 Reg', 'cursive'], //header
        cormorantSC: ['Cormorant SC', 'serif'], //subheader all caps (literally cormorant with only caps)
        roca: ['Roca One', 'sans-serif'], //uh stylistic but doesn't work with the others so not using
        cormorant: ['Cormorant', 'serif'], //body literally cormorantSC but with lowercase caps so I just used this one
      },
    },
  },
  plugins: [],
};
