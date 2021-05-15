import i18next from 'i18next'
import translationBackend from 'i18next-node-fs-backend'
import { readdirSync } from 'fs'
import { resolve } from 'path'

export const loadLocales = async (ctx) => {
  // const localesPath = process.env.LOCALES_DIR || '../../locales'
  const localesPath = resolve(__dirname, '../../locales')

  await i18next
    .use(translationBackend)
    .init({
      preload: readdirSync(localesPath),
      backend: {
        loadPath: `${localesPath}/{{lng}}/{{ns}}.json`
      },
      ns: ['themes', 'common'],
      fallbackLng: 'en-US',
      interpolation: {
        escapeValue: true
      },
      returnEmptyString: false
    })

  return i18next
}
