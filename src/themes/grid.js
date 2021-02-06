import { loadConfiguration } from '../utils'
import HTTPErrorMessage from '../utils/HTTPErrorMessage'
import messages from '../messages'
import ResourcesAPI from '../apis/resources'
import { defaultArtistImage, defaultTrackImage } from '../constants'
import LastfmAPI from '../apis/lastfm'

const config = loadConfiguration().themes.grid

export default class GridTheme {
  static async getWorkerData ({
    options,
    story,
    user
  }, id, { lastfm }) {
    const result = {
      id,
      story,
      theme: 'grid',
      hide_username: false,
      data: {
        tiles: [],
        rows: options.rows,
        columns: options.columns,
        show_names: options.show_names,
        show_playcount: options.show_playcount,
        style: options.style,
        tile_size: config.tile_size
      }
    }

    let isCorrectPeriod = true
    const limit = options.rows * options.columns

    if (options.type === 'ALBUM') {
      const {
        items,
        isFromWeekly,
        correctPeriod
      } = await LastfmAPI.getAlbumsCharts(user, options.period, limit)
      isCorrectPeriod = correctPeriod

      result.data.tiles = items.map(a => ({
        image: a.image,
        name: a.name,
        secondary: a.artist,
        scrobbles: a.playcount
      }))

      if (isFromWeekly) {
        const resources = await ResourcesAPI.getAlbumsResources(items)

        console.log(resources)

        result.data.tiles = items.map((a, i) => ({
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

      result.data.tiles = items.map((a, i) => ({
        image: a && a.image ? a.image : defaultArtistImage,
        name: artists[i].name,
        secondary: null,
        scrobbles: parseInt(artists[i].playcount)
      }))
    } else if (options.type === 'TRACK') {
      const {
        items: tracks,
        correctPeriod
      } = await LastfmAPI.getTracksCharts(user, options.period, limit)
      isCorrectPeriod = correctPeriod

      const items = await ResourcesAPI.getTracksResources(tracks)

      result.data.tiles = items.map((a, i) => ({
        image: a && a.cover ? a.cover : defaultTrackImage,
        name: tracks[i].name,
        secondary: tracks[i].artist,
        scrobbles: tracks[i].playcount
      }))
    }

    return {
      result,
      correctPeriod: isCorrectPeriod
    }
  }

  static async generate (data, id, ctx) {
    const worker = ctx.workersController.getWorkerByTheme('grid')

    const {
      result,
      correctPeriod
    } = await GridTheme.getWorkerData(data, id, ctx)

    return {
      generation: await worker.generate('grid', result),
      worker,
      correctPeriod
    }
  }
}
