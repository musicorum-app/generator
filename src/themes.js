import GridTheme from './themes/grid'
import DuotoneTheme from './themes/duotone'
import TopsTheme from './themes/tops'

export const generateThemes = (ctx) => ({
  grid: {
    needsUserData: false,
    instance: new GridTheme(ctx)
  },
  duotone: {
    needsUserData: true,
    instance: new DuotoneTheme(ctx)
  },
  tops: {
    needsUserData: true,
    instance: new TopsTheme(ctx)
  }
})

export const themeList = ['grid', 'duotone', 'tops']
