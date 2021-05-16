import Theme from '../models/Theme'
import LastfmAPI from '../apis/lastfm'
import ResourcesAPI from '../apis/resources'
import { defaultArtistImage } from '../constants'

export default class TopsTheme extends Theme {
  constructor (ctx) {
    super('tops', ctx)
  }

  async getWorkerData ({
    options,
    story,
    hide_username: hideUsername,
    user,
    language
  }, id, t) {
    const i18nPeriod = Array.isArray(options.period) ? null : options.period.toLowerCase()
    const scrobbles = await this.ctx.lastfm.getTotalScrobbles(user, options.period)

    const result = {
      id,
      story,
      theme: this.name,
      hide_username: hideUsername,
      data: {
        title: t('themes:tops.title', { context: i18nPeriod }),
        scrobbles: new Intl.NumberFormat(language).format(scrobbles),
        scrobbles_text: t('themes:tops.scrobblesText', { count: scrobbles })
      }
    }

    let isCorrectPeriod = true

    result.data.items = await Promise.all([options.mod1, options.mod2].map(async type => {
      let item
      if (type === 'ALBUM') {
        const {
          items: [it],
          isFromWeekly,
          correctPeriod
        } = await LastfmAPI.getAlbumsCharts(user, options.period, 1)
        isCorrectPeriod = correctPeriod

        item = {
          name: it.name,
          secondary: it.artist,
          image: it.image
        }

        if (isFromWeekly) {
          const [resource] = await ResourcesAPI.getAlbumsResources([it])

          item.image = resource && resource.cover ? resource.cover : it.image
        }
      } else if (type === 'ARTIST') {
        const {
          items: [it],
          correctPeriod
        } = await LastfmAPI.getArtistsCharts(user, options.period, 1)
        isCorrectPeriod = correctPeriod

        const [resource] = await ResourcesAPI.getArtistsResources([it.name])

        item = {
          name: it.name,
          image: resource && resource.image ? resource.image : defaultArtistImage
        }
      } else if (type === 'TRACK') {
        const {
          items: [it],
          correctPeriod
        } = await LastfmAPI.getTracksCharts(user, options.period, 1)
        isCorrectPeriod = correctPeriod

        const [resource] = await ResourcesAPI.getTracksResources([it])

        item = {
          name: it.name,
          secondary: it.artist,
          image: resource && resource.cover ? resource.cover : defaultArtistImage
        }
      }

      item.title = t('themes:tops.moduleTitle', { context: type.toLowerCase() })
      return item
    }))

    return {
      result,
      correctPeriod: isCorrectPeriod
    }
  }
}
