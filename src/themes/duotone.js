import Theme from '../models/Theme'
import LastfmAPI from '../apis/lastfm'
import ResourcesAPI from '../apis/resources'
import { defaultArtistImage, defaultTrackImage } from '../constants'
import { loadConfiguration } from '../utils'

const config = loadConfiguration().themes.duotone

export default class DuotoneTheme extends Theme {
  constructor (ctx) {
    super('duotone', ctx)
  }

  async getWorkerData ({
    options,
    story,
    hide_username: hideUsername,
    user
  }, id) {
    const typeTranslated = this.ctx.i18n.t(`common:types.${options.type.toLowerCase()}`, { context: 'plural' }).toUpperCase()
    const result = {
      id,
      story,
      theme: 'duotone',
      hide_username: hideUsername,
      data: {
        items: [],
        title: this.ctx.i18n.t('themes:duotone.title', { type: typeTranslated }),
        palette: config.palettes[options.palette]
      }
    }

    if (Array.isArray(options.period)) {
      options.period = options.period.map(p => ~~p)
    }

    const limit = story ? 8 : 6
    let isCorrectPeriod = true
    const scrobbles = await this.ctx.lastfm.getTotalScrobbles(user, options.period)

    if (options.type === 'ALBUM') {
      const {
        items,
        isFromWeekly,
        correctPeriod
      } = await LastfmAPI.getAlbumsCharts(user, options.period, limit)
      isCorrectPeriod = correctPeriod

      result.data.items = items.map(a => ({
        image: a.image,
        name: a.name,
        secondary: a.artist
      }))

      if (isFromWeekly) {
        const resources = await ResourcesAPI.getAlbumsResources(items)

        result.data.items = result.data.items.map((a, i) => ({
          ...a,
          image: resources[i] && resources[i].cover ? resources[i].cover : a.image
        }))
      }
    } else if (options.type === 'ARTIST') {
      const {
        items: artists,
        correctPeriod
      } = await LastfmAPI.getArtistsCharts(user, options.period, limit)
      isCorrectPeriod = correctPeriod

      const items = await ResourcesAPI.getArtistsResources(artists.map(a => a.name))

      result.data.items = items.map((a, i) => ({
        image: a && a.image ? a.image : defaultArtistImage,
        name: artists[i].name
      }))
    } else if (options.type === 'TRACK') {
      const {
        items: tracks,
        correctPeriod
      } = await LastfmAPI.getTracksCharts(user, options.period, limit)
      isCorrectPeriod = correctPeriod

      const items = await ResourcesAPI.getTracksResources(tracks)

      result.data.items = items.map((a, i) => ({
        image: a && a.cover ? a.cover : defaultTrackImage,
        name: tracks[i].name,
        secondary: tracks[i].artist
      }))
    }

    const isCustomPeriod = Array.isArray(options.period)

    result.data.subtitle = this.ctx.i18n.t('themes:duotone.scrobblesText', {
      count: scrobbles,
      period: !isCustomPeriod ? this.ctx.i18n.t(`common:periodsNormalized.${options.period.toLowerCase()}`).toUpperCase() : '',
      context: isCustomPeriod ? 'customPeriod' : options.period === 'OVERALL' ? 'overall' : null
    })

    return {
      result,
      correctPeriod: isCorrectPeriod
    }
  }
}
