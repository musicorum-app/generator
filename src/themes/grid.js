import { loadConfiguration } from '../utils'
import HTTPErrorMessage from '../utils/HTTPErrorMessage'
import messages from '../messages'

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

    const limit = options.rows * options.columns

    if (options.type === 'ALBUM') {
      const items = await lastfm.userGetTopAlbums({
        user,
        limit,
        period: options.period
      })
      result.data.tiles = items.topalbums.album.map(a => ({
        image: a.image[3]['#text'],
        name: a.name,
        secondary: a.artist.name,
        scrobbles: a.playcount
      }))
    }

    return result
  }

  static async generate (data, id, ctx) {
    const worker = ctx.workersController.getWorkerByTheme('grid')

    return {
      generation: await worker.generate('grid', await GridTheme.getWorkerData(data, id, ctx)),
      worker
    }
  }
}
