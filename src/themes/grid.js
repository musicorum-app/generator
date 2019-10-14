const { CanvasUtils, LastFM } = require('../')
const { createCanvas } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

module.exports = async (context, data) => {
  try {
    const { musicorum } = context
    let { user, top, period, playcount, names } = data
    if (!user) throw new ResponseError(400, responses.MISSING_PARAMS)
    if (!top) top = 'albums'
    if (!period) period = '1month'
    const topList = await musicorum.lastfm.getUserTop(user, top, period, 40)
    let list = topList.topalbums || topList.topartists || topList.toptracks
    if (!list) throw new ResponseError(404, responses.USER_NOT_FOUND)
    list = list.album || list.track || list.artist
    const canvas = createCanvas(900, 900)
    const ctx = canvas.getContext('2d')

    const SIZE = data.size < 3 || data.size > 6 ? 3 : data.size
    const COVER_SIZE = canvas.width / SIZE

    // Text & Gradient

    let POS = 0
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const item = list[POS]
        if (!item) {
          break
        }
        const X = j * COVER_SIZE
        const Y = i * COVER_SIZE

        // ctx.fillStyle = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`
        // ctx.fillRect(X, Y, COVER_SIZE, COVER_SIZE)

        if (names) {
          const GRADIENT = ctx.createLinearGradient(X, Y, X, Y + COVER_SIZE)
          GRADIENT.addColorStop(0, 'rgba(0, 0, 0, .9)')
          GRADIENT.addColorStop(0.13, 'rgba(0, 0, 0, .6)')
          GRADIENT.addColorStop(0.4, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = GRADIENT
          ctx.fillRect(X, Y, COVER_SIZE, COVER_SIZE)

          ctx.font = 'bold 15px "RobotoCondensed"'
          ctx.fillStyle = 'rgb(255, 255, 255)'
          ctx.fillText(item.name, X + 5, Y + 5 + 16, COVER_SIZE - 10)
          ctx.font = '13px "RobotoCondensed-Light"'
          if (top === 'albums' || top === 'tracks') {
            ctx.fillStyle = 'rgb(240, 240, 240)'
            ctx.fillText(item.artist.name, X + 5, Y + 5 + 30, COVER_SIZE - 10)
          }
        }

        if (playcount) {
          const PLAYCOUNT_GRADIENT = ctx.createLinearGradient(X + COVER_SIZE, Y + COVER_SIZE, X + (COVER_SIZE * 0.3), Y)
          PLAYCOUNT_GRADIENT.addColorStop(0, 'rgba(0, 0, 0, .6)')
          PLAYCOUNT_GRADIENT.addColorStop(0.14, 'rgba(0, 0, 0, .3)')
          PLAYCOUNT_GRADIENT.addColorStop(0.26, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = PLAYCOUNT_GRADIENT
          ctx.fillRect(X, Y, COVER_SIZE, COVER_SIZE)

          ctx.font = '20px "RobotoMono-Light"'
          ctx.fillStyle = 'rgb(255, 255, 255)'
          const PLAYCOUNT = item.playcount
          const PLAYCOUNT_X = X + COVER_SIZE - ctx.measureText(PLAYCOUNT).width - 5
          const PLAYCOUNT_Y = Y + COVER_SIZE - 5
          ctx.fillText(PLAYCOUNT, PLAYCOUNT_X, PLAYCOUNT_Y)
        }

        // eslint-disable-next-line no-use-before-define
        POS++
      }
    }

    // Images
    const images = await Promise.all(list.slice(0, SIZE * SIZE).filter(i => i.image[0]['#text']).map(i => CanvasUtils.loadCachedImage(LastFM.getBestImage(i.image, 300))))

    ctx.globalCompositeOperation = 'destination-over'
    POS = 0
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        const img = images[POS]
        const X = j * COVER_SIZE
        const Y = i * COVER_SIZE

        if (img) {
          ctx.drawImage(img, X, Y, COVER_SIZE, COVER_SIZE)
        } else {
          ctx.fillStyle = 'black'
          ctx.fillRect(X, Y, COVER_SIZE, COVER_SIZE)
        }

        POS++
      }
    }

    return canvas
  } catch (e) {
    if (e instanceof ResponseError) throw e
    console.error(e)
    throw new ResponseError(500, responses.GENERIC_ERROR)
  }
}
