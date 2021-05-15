import GridTheme from './themes/grid'
import DuotoneTheme from './themes/duotone'

export const generateThemes = (ctx) => ({
  grid: {
    needsUserData: false,
    instance: new GridTheme(ctx)
  },
  duotone: {
    needsUserData: true,
    instance: new DuotoneTheme(ctx)
  }
})

export const themeList = ['grid', 'duotone']
