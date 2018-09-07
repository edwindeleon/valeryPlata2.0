/**
 * configuration file
 * colors, themes, base styles etc
 */
// colors
const colors = {
  'googleBlue100': {
    'color': '#ff7fd4'
  },
  'googleBlue300': {
    'color': '#ff7fd4'
  },
  'googleBlue500': {
    'color': '#fe6dcd'
  },
  'googleBlue700': {
    'color': '#ff7fd4'
  }
}

const PRIMARY = 'googleBlue'

// helper function to get colors
export function getColor(string) {
  if (string) {
    if (string.indexOf('#') > -1 || string.indexOf('rgba') > -1
        || string.indexOf('rgb') > -1) {
      return string
    }
    if (colors[string]) {
      return colors[string].color
    }
    if (colors[`${string}500`]) {
      return colors[`${string}500`].color
    }
  }
  return colors[`${PRIMARY}500`].color
}
