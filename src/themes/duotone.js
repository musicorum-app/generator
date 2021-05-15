import Theme from '../models/Theme'
import LastfmAPI from '../apis/lastfm'
import ResourcesAPI from '../apis/resources'
import { defaultArtistImage, defaultTrackImage } from '../constants'

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
    const typeTranslated = this.ctx.i18n.t(`common:types.${options.type}`, { context: 'plural' }).toUpperCase()
    const result = {
      id,
      story,
      theme: 'duotone',
      hide_username: hideUsername,
      data: {
        items: [],
        title: this.ctx.i18n.t('themes:duotone.title', { type: typeTranslated }),
        palette: options.palette
      }
    }

    const limit = story ? 8 : 6
    let isCorrectPeriod = true

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

        result.data.items = items.map((a, i) => ({
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

    return {
      result,
      correctPeriod: isCorrectPeriod
    }
  }
}
