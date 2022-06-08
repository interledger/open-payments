const colors = require('tailwindcss/colors')
module.exports = {
  content: [
    './pages/**/*.tsx',
    './components/**/*.tsx',
  ],
  safelist: [
    {
      pattern: /bg-(gray|red|orange|green|cyan|teal|purple)(-(light|other))?/,
    },
  ],
  prefix: '',
  important: false,
  separator: ':',
  theme: {
    colors:
    {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white, 
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    fontFamily: {
      display: 'Rubik, sans-serif',
      body: 'Rubik, sans-serif'
    },
    minWidth: {
      '64': '64px',
      '96': '96px',
    },
    extend: {
      scale: {
        '200': '2'
      },
      translate: {
        decorx: 'calc(-50vw + 110vh + 4rem)',
        decory: '4rem',
        decorx1: 'calc(-30vh)',
        decory1: '80vh',
        decorx2: 'calc(-50vw + 140vh + 8rem)',
        decory2: 'calc(170vh)',
      },
      zIndex: {
        '-10': '-10',
        '-12': '-12',
      },
      fontSize: {
        '7xl': '6rem',
      },
      borderWidth: {
        '10': '10px',
        '50': '50px',
        '20': '2vh'
      },
      inset: {
        '-55': '-45vw',
        '-90': '-90vw',
        '-10': '-10vw'
      },
      minWidth: {
        'button': '90px',
      },
      width: {
        card: '344px',
        '90': '90px',
        '200': '200px',
        '500': '500px',
        '1000': '1000px',
        phone: '30vh',
        browser: '30vw',
        'browser-mobile': '80vw',
        decor: '110vh',
        decor1: '120vh',
        decor2: '140vh',
      },
      height: {
        '18': '4.5rem',
        '90': '90px',
        '200': '200px',
        '500': '500px',
        '1000': '1000px',
        phone: '30vh',
        decor: '110vh',
        decor1: '120vh',
        decor2: '140vh',
      },
      colors: {
        primary: '#1E3250',
        gray: {
          DEFAULT: '#424242',
          light: '#757575'
        },
        red: {
          DEFAULT: '#CE6564',
          light: '#F59297'
        },
        orange: {
          DEFAULT: '#F47F5F',
          other: '#FABD84',
          light: '#FCC9B3'
        },
        green: {
          DEFAULT: '#6D995C',
          light: '#7FC78C'
        },
        cyan: {
          DEFAULT: '#459789',
          light: '#8FD1C1'
        },
        teal: {
          DEFAULT: '#51797D',
          light: '#9EC7D0'
        },
        purple: {
          DEFAULT: '#845578',
          light: '#978AA4'
        },
      },
    },
  },
  corePlugins: {},
  plugins: [],
}