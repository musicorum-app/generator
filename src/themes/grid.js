const { CanvasUtils } = require('../')
const Theme = require('./Theme.js')
const { createCanvas } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

module.exports = class GridTheme extends Theme {
  async generate (options) {
    const lastfm = this.musicorum.lastfm

    let { user, top, period, playcount, names } = options
    if (!user) throw new ResponseError(400, responses.MISSING_PARAMS)
    if (!top) top = 'albums'
    if (!period) period = '1month'

    const SIZE = options.size < 3 || options.size > 20 ? 3 : options.size
    const topList = await lastfm.getUserTop(user, top, period, SIZE * SIZE)
    let list = topList.topalbums || topList.topartists || topList.toptracks
    if (!list) throw new ResponseError(404, responses.USER_NOT_FOUND)
    list = list.album || list.track || list.artist

    const canvasSize = SIZE < 11 ? 1300 : SIZE > 16 ? 2400 : 1890

    const canvas = createCanvas(canvasSize, canvasSize)
    const ctx = canvas.getContext('2d')

    const COVER_SIZE = canvas.width / SIZE

    await Promise.all([
      (async () => {
        if (!names && !playcount) return
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
              ctx.globalCompositeOperation = 'source-over'
              const GRADIENT = ctx.createLinearGradient(X, Y, X, Y + COVER_SIZE)
              GRADIENT.addColorStop(0, 'rgba(0, 0, 0, .5)')
              GRADIENT.addColorStop(0.10, 'rgba(0, 0, 0, .4)')
              GRADIENT.addColorStop(0.28, 'rgba(0, 0, 0, 0)')

              ctx.fillStyle = GRADIENT
              ctx.fillRect(X, Y, COVER_SIZE, COVER_SIZE)

              ctx.font = 'bold 15px "RobotoCondensed, Code2000"'
              ctx.fillStyle = 'rgb(255, 255, 255)'
              ctx.writeScalableText(item.name, X + 5, Y + 5 + 16 + (SIZE > 9 ? -8 : 0), COVER_SIZE - 10,
                'bold %S%px "RobotoCondensed, Code2000"', SIZE > 9 ? 13 : 15)
              ctx.font = '13px "RobotoCondensed-Light, Code2000"'
              if (top === 'albums' || top === 'tracks') {
                ctx.fillStyle = 'rgb(240, 240, 240)'
                ctx.writeScalableText(item.artist.name, X + 5, Y + 5 + 30 + (SIZE > 9 ? -8 : 0),
                  COVER_SIZE - 10, '%S%px "RobotoCondensed-Light, Code2000"', SIZE > 9 ? 10 : 13)
              }
            }

            if (playcount) {
              ctx.globalCompositeOperation = 'source-over'
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
      })(),
      (async () => {
        const images = list.slice(0, SIZE * SIZE)
        const fns = []

        let POS = 0
        for (let i = 0; i < SIZE; i++) {
          for (let j = 0; j < SIZE; j++) {
            const img = images[POS]
            const X = j * COVER_SIZE
            const Y = i * COVER_SIZE
            fns.push([
              [X, Y],
              () => this.getItemImage(top, img)
            ])
            POS++
          }
        }

        await Promise.all(fns.map(async ([position, fn]) => {
          const image = await fn()
          ctx.globalCompositeOperation = 'destination-over'
          ctx.drawImage(image, position[0], position[1], COVER_SIZE, COVER_SIZE)
        }))
      })()
    ])

    return canvas
  }

  async generateStory (options) {
    const lastfm = this.musicorum.lastfm

    let { user, top, period, playcount, names } = options
    if (!user) throw new ResponseError(400, responses.MISSING_PARAMS)
    if (!top) top = 'albums'
    if (!period) period = '1month'

    const topList = await lastfm.getUserTop(user, top, period, 13)
    let list = topList.topalbums || topList.topartists || topList.toptracks
    if (!list) throw new ResponseError(404, responses.USER_NOT_FOUND)
    list = list.album || list.track || list.artist

    const WIDTH = 720
    const HEIGHT = 1280

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const mainImage = await this.getItemImage(top, list[0], 600)

    ctx.drawImage(mainImage, 0, 0, WIDTH, WIDTH)

    const mainItem = list.shift()

    if (names) {
      const GRADIENT = ctx.createLinearGradient(0, 0, 0, WIDTH)
      GRADIENT.addColorStop(0.87, 'rgba(0, 0, 0, 0)')
      GRADIENT.addColorStop(0.93, 'rgba(0, 0, 0, .4)')
      GRADIENT.addColorStop(0.97, 'rgba(0, 0, 0, .5)')

      ctx.fillStyle = GRADIENT
      ctx.fillRect(0, 0, WIDTH, WIDTH)

      ctx.font = 'bold 20px "RobotoCondensed, Code2000"'
      ctx.fillStyle = 'rgb(255, 255, 255)'
      ctx.writeScalableText(mainItem.name, 5, WIDTH - 5 - 30, WIDTH - 100,
        'bold %S%px "RobotoCondensed, Code2000"', 20)
      ctx.font = '16px "RobotoCondensed-Light, Code2000"'
      if (top === 'albums' || top === 'tracks') {
        ctx.fillStyle = 'rgb(240, 240, 240)'
        ctx.writeScalableText(mainItem.artist.name, 5, WIDTH - 5 - 13,
          WIDTH - 100, '%S%px "RobotoCondensed-Light, Code2000"', 16)
      }
    }

    if (playcount) {
      ctx.font = '30px "RobotoMono-Light"'
      ctx.fillStyle = 'rgb(255, 255, 255)'
      const PLAYCOUNT = mainItem.playcount
      const PLAYCOUNT_X = WIDTH - ctx.measureText(PLAYCOUNT).width - 5
      const PLAYCOUNT_Y = WIDTH - 8
      ctx.fillText(PLAYCOUNT, PLAYCOUNT_X, PLAYCOUNT_Y)
    }

    const images = await Promise.all(list.map(async (i) => this.getItemImage(top, i)))

    const IMAGE_SIZE = WIDTH / 4

    let POS = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        const X = j * IMAGE_SIZE
        const Y = i * IMAGE_SIZE + WIDTH

        const item = list[POS]

        ctx.drawImage(images[i][j], X, Y, IMAGE_SIZE, IMAGE_SIZE)

        if (names) {
          const GRADIENT = ctx.createLinearGradient(X, Y, X, Y + IMAGE_SIZE)
          GRADIENT.addColorStop(0, 'rgba(0, 0, 0, .5)')
          GRADIENT.addColorStop(0.28, 'rgba(0, 0, 0, .4)')
          GRADIENT.addColorStop(0.54, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = GRADIENT
          ctx.fillRect(X, Y, IMAGE_SIZE, IMAGE_SIZE)

          ctx.font = 'bold 15px "RobotoCondensed, Code2000"'
          ctx.fillStyle = 'rgb(255, 255, 255)'
          ctx.writeScalableText(item.name, X + 5, Y + 5 + 16, IMAGE_SIZE - 10,
            'bold %S%px "RobotoCondensed, Code2000"', 15)
          ctx.font = '13px "RobotoCondensed-Light, Code2000"'
          if (top === 'albums' || top === 'tracks') {
            ctx.fillStyle = 'rgb(240, 240, 240)'
            ctx.writeScalableText(item.artist.name, X + 5, Y + 5 + 30,
              IMAGE_SIZE - 10, '%S%px "RobotoCondensed-Light, Code2000"', 13)
          }
        }

        if (playcount) {
          const PLAYCOUNT_GRADIENT = ctx.createLinearGradient(X + IMAGE_SIZE, Y + IMAGE_SIZE, X + (IMAGE_SIZE * 0.3), Y)
          PLAYCOUNT_GRADIENT.addColorStop(0, 'rgba(0, 0, 0, .6)')
          PLAYCOUNT_GRADIENT.addColorStop(0.14, 'rgba(0, 0, 0, .3)')
          PLAYCOUNT_GRADIENT.addColorStop(0.26, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = PLAYCOUNT_GRADIENT
          ctx.fillRect(X, Y, IMAGE_SIZE, IMAGE_SIZE)

          ctx.font = '20px "RobotoMono-Light"'
          ctx.fillStyle = 'rgb(255, 255, 255)'
          const PLAYCOUNT = item.playcount
          const PLAYCOUNT_X = X + IMAGE_SIZE - ctx.measureText(PLAYCOUNT).width - 5
          const PLAYCOUNT_Y = Y + IMAGE_SIZE - 5
          ctx.fillText(PLAYCOUNT, PLAYCOUNT_X, PLAYCOUNT_Y)
        }
        POS++
      }
    }
    return canvas
  }
}
