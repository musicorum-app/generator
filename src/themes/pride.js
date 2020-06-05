const { CanvasUtils } = require('../')
const Theme = require('./Theme.js')
const { createCanvas, loadImage } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')
const getColors = require('get-image-colors')
const FileType = require('file-type')
const chroma = require('chroma-js')
const MiscUtils = require('../utils/MiscUtils.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

const flags = {
  lgbt: {
    colors: ['#f00', '#FF8E00', '#ffff7d', '#00ff00', '#00C0C0', '#00f', '#8E008E'],
    rows: [1, 1, 1, 1, 1, 1, 1]
  },
  lesbian: {
    colors: ['#D42C00', '#FD9855', '#fff', '#D161A2', '#A20161'],
    rows: [1, 1, 1, 1, 1]
  },
  bisexual: {
    colors: ['#ff0000', '#ff00ff', '#0000ff'],
    rows: [2, 1, 2],
    colorsToDraw: ['#d0026d', '#d0026d', '#974d92', '#0036a3', '#0036a3']
  },
  pansexual: {
    colors: ['#f82088', '#ffe36d', '#3a65ff'],
    rows: [2, 2, 2],
    colorsToDraw: ['#f82088', '#f82088', '#f8d200', '#f8d200', '#20acf8', '#20acf8']
  },
  nonBinary: {
    colors: ['#FCF434', '#fff', '#f0f', '#000'],
    rows: [2, 2, 2, 2]
  },
  asexual: {
    colors: ['#000', '#A3A3A3', '#fff', '#800080'],
    rows: [2, 2, 2, 2]
  },
  genderFluid: {
    colors: ['#FF75A2', '#fff', '#BE18D6', '#000', '#333EBD'],
    rows: [1, 1, 1, 1, 1]
  },
  transgender: {
    colors: ['#5BCEFA', '#F5A9B8', '#fff', '#F5A9B8', '#5BCEFA'],
    rows: [1, 1, 1, 1, 1]
  }
}

module.exports = class PrideTheme extends Theme {
  async generate (options) {
    const lastfm = this.musicorum.lastfm

    let { user, flag: selectedFlag } = options
    if (!user) throw new ResponseError(400, responses.MISSING_PARAMS)
    if (!Object.keys(flags).includes(selectedFlag)) selectedFlag = 'lgbt'

    const flag = flags[selectedFlag]
    const { colors, colorsToDraw, rows } = flag

    const SIZE_X = 10
    const SIZE_Y = rows.reduce((a, b) => a + b, 0)

    const COVER_SIZE = 120
    const CANVAS_SIZE_X = COVER_SIZE * SIZE_X
    const CANVAS_SIZE_Y = COVER_SIZE * SIZE_Y

    const albums = await lastfm.getList(user, 'albums', 'overall', 100)
    console.log('request done.')

    const canvas = createCanvas(CANVAS_SIZE_X, CANVAS_SIZE_Y)
    const ctx = canvas.getContext('2d')

    let images = await Promise.all(albums.map(async a => {
      try {
        const album = await this.getAlbumFromCache(a)
        if (!album) return null
        const fn = () => album.getBufferImage(this.musicorum.cacheFileManager)
        const img = await this.musicorum.requestQueue.request('IMAGE_READ', fn)
        const { mime } = await FileType.fromBuffer(img)
        const palette = await getColors(img, {
          count: 1,
          type: mime
        })

        return {
          color: palette[0],
          img: await loadImage(img)
        }
      } catch (e) {
        console.error(e)
      }
    }))

    const differencer = (color, a, b) => chroma.distance(color, a.color.hex(), 'rgb') - chroma.distance(color, b.color.hex(), 'rgb')
    const lightnessSorter = (a, b) => b.color.hsl()[1] - a.color.hsl()[1]
    const items = []

    for (let i = 0; i < rows.length; i++) {
      const s = rows[i]
      const n = s * SIZE_X
      // if (selectedFlag === 'lgbt') {
      //   items.push(...images
      //     .filter(a => !!a)
      //     .sort((a, b) => b.color.hsl().reduce((a, b) => a * b, 1) - a.color.hsl()[0])
      //     .slice(0, SIZE_X * SIZE_Y))
      //     // .sort((a, b) => chroma.distance(a.color.hex(), b.color.hex(), 'rgb') - chroma.distance(b.color.hex(), a.color.hex(), 'rgb')))
      //   return
      // }
      const invertLightness = selectedFlag === 'transgender' && i > 2
      images = images.filter(a => !!a)
        .sort((a, b) => differencer(colors[i], a, b))
      items.push(...images
        .slice(0, n)
        .sort((a, b) => lightnessSorter(invertLightness ? b : a, invertLightness ? a : b)))
      if (selectedFlag === 'lgbt') {
        images.splice(0, n)
      }
      await MiscUtils.wait(400)
    }

    console.log(images[0])
    ctx.drawImage(images[0].img, 0, 0, 200, 200)

    // const items1 = images.filter(a => !!a)
    //   .sort((a, b) => differencer(colors[0], a, b))
    //   .slice(0, 20)
    //   .sort((a, b) => lightnessSorter(a, b))
    //
    // const items2 = images.filter(a => !!a)
    //   .sort((a, b) => differencer(colors[1], a, b))
    //   .slice(0, 20)
    //   .sort((a, b) => lightnessSorter(a, b))
    //
    // const items3 = images.filter(a => !!a)
    //   .sort((a, b) => differencer(colors[2], a, b))
    //   .slice(0, 20)
    //   .sort((a, b) => lightnessSorter(a, b))
    //
    // const items = [...items1, ...items2, ...items3]

    let POS = 0
    for (let i = 0; i < SIZE_Y; i++) {
      for (let j = 0; j < SIZE_X; j++) {
        const item = items[POS]
        if (!item) {
          break
        }
        const X = j * COVER_SIZE
        const Y = i * COVER_SIZE

        ctx.drawImage(item.img, X, Y, COVER_SIZE, COVER_SIZE)
        // ctx.fillStyle = item.color.hex()
        // ctx.fillRect(X, Y, COVER_SIZE, 20)
        // ctx.fillStyle = 'black'
        // ctx.fillText(chroma.distance(colors[2], item.color.hex(), 'rgb'), X, Y + 18, 200)

        POS++
      }
    }

    const MARGIN = 50
    const finalCanvas = createCanvas(CANVAS_SIZE_X + MARGIN, CANVAS_SIZE_Y)
    const ftx = finalCanvas.getContext('2d')

    if (colorsToDraw) {
      for (let i = 0; i < colorsToDraw.length; i++) {
        ftx.fillStyle = colorsToDraw[i]
        ftx.fillRect(0, COVER_SIZE * i, CANVAS_SIZE_X + MARGIN, COVER_SIZE)
      }
    } else {
      for (let i = 0; i < rows.length; i++) {
        ftx.fillStyle = colors[i]
        ftx.fillRect(0, COVER_SIZE * i * rows[i], CANVAS_SIZE_X + MARGIN, COVER_SIZE * rows[i])
      }
    }

    ftx.drawImage(canvas, MARGIN / 2, 0, CANVAS_SIZE_X, CANVAS_SIZE_Y)

    return finalCanvas
  }

  async generateStory (options) {
    return this.generate(options)
  }
}
