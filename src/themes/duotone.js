const { CanvasUtils, LastFM } = require('../')
const Theme = require('./Theme.js')
const { createCanvas, loadImage } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

const sample = {
  period: '1month',
  top: 'artist',
  pallete: 'purplish',
  messages: {
    title: 'most played artists',
    subtitle: 'from last month',
    scrobbles: ['scrobbles', 'last month']
  }
}

const colorsPallete = {
  purplish: ['#16006F', '#F7396F'],
  natural: ['#1A2A56', '#00D574'],
  divergent: ['#a21685', '#63acbb'],
  sun: ['#EA1264', '#D7FD31']
}

module.exports = class DuoToneTheme extends Theme {
  async generate (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, top, messages, pallete } = options
    const colors = colorsPallete[pallete]

    const { user: userInfo } = await lastfm.getUserInfo(user)
    console.log(userInfo)
    if (!userInfo) throw new ResponseError(404, responses.USER_NOT_FOUND)

    const playcount = await lastfm.getTotalScrobbles(user, period)
    const list = await lastfm.getList(user, top, period, 6)
    // const playcount = { precise: false, playcount: 200 }

    const WIDTH = 1200
    const HEIGHT = 600

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    // Background

    ctx.fillStyle = colors[1]
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const userImage = await this.loadUserImage(userInfo, 400)

    // ctx.drawDuotoneImage(userImage, colors, 0, 0, 400, 600)
    const DUOTONE_BACK_WIDTH = 360
    const DUOTONE_SIZE = HEIGHT

    ctx.drawDuotoneImage(userImage, colors, DUOTONE_BACK_WIDTH - DUOTONE_SIZE, 0, DUOTONE_SIZE, DUOTONE_SIZE)

    const AVATAR_SIZE = 400
    const AVATAR_X = 60
    const AVATAR_Y = HEIGHT / 2 - (AVATAR_SIZE / 2)

    ctx.drawImage(userImage, AVATAR_X, AVATAR_Y, AVATAR_SIZE, AVATAR_SIZE)

    // Account gradient

    const GRADIENT_HEIGHT = 120
    const GRADIENT_Y = AVATAR_Y + AVATAR_SIZE - GRADIENT_HEIGHT

    const ACCOUNT_GRADIENT = ctx.createLinearGradient(AVATAR_X, GRADIENT_Y, AVATAR_X, AVATAR_Y + AVATAR_SIZE)
    ACCOUNT_GRADIENT.addColorStop(0, CanvasUtils.createRGBAFromHex(colors[0], 0))
    ACCOUNT_GRADIENT.addColorStop(0.4, CanvasUtils.createRGBAFromHex(colors[0], 0.5))
    ACCOUNT_GRADIENT.addColorStop(1, CanvasUtils.createRGBAFromHex(colors[0], 0.7))

    ctx.fillStyle = ACCOUNT_GRADIENT
    ctx.fillRect(AVATAR_X, GRADIENT_Y, AVATAR_SIZE, GRADIENT_HEIGHT)

    // Background images

    ctx.globalAlpha = 0.57
    for (const i in list) {
      const item = list[i]
      const image = await this.getItemImage(top, item)
      const IMAGE_SIZE = 170
      const IMAGE_MARGIN_Y = (HEIGHT - IMAGE_SIZE * 3) / 4
      const IMAGE_MARGIN_X = IMAGE_MARGIN_Y
      const IMAGE_STARTING_Y = WIDTH - IMAGE_MARGIN_Y - IMAGE_SIZE
      const IMAGE_X = (i >= 3 ? IMAGE_STARTING_Y : IMAGE_STARTING_Y - IMAGE_SIZE - IMAGE_MARGIN_X)
      const IMAGE_Y = IMAGE_MARGIN_Y + (IMAGE_SIZE + IMAGE_MARGIN_Y) * (i >= 3 ? i - 3 : i)

      ctx.drawDuotoneImage(image, colors, IMAGE_X, IMAGE_Y, IMAGE_SIZE, IMAGE_SIZE)
    }
    ctx.globalAlpha = 1

    // Account info

    const ACCOUNT_INFO_MARGIN_X = 10
    const ACCOUNT_INFO_X = AVATAR_X + ACCOUNT_INFO_MARGIN_X

    ctx.fillStyle = colors[1]
    ctx.font = '55px "Montserrat Black"'
    const SCROBBLES_MEASURE = ctx.measureText(playcount.toString())
    const SCROBBLES_WIDTH = SCROBBLES_MEASURE.width
    const SCROBBLES_HEIGHT = SCROBBLES_MEASURE.actualBoundingBoxAscent
    const SCROBBLES_MARGIN_Y = 15
    const SCROBBLES_Y = AVATAR_Y + AVATAR_SIZE - SCROBBLES_MARGIN_Y

    ctx.fillText(playcount.toString(), ACCOUNT_INFO_X, SCROBBLES_Y, 200)

    ctx.font = '25px "Montserrat ExtraBold"'
    const NAME_MARGIN_Y = 10
    const NAME_Y = SCROBBLES_Y - NAME_MARGIN_Y - SCROBBLES_HEIGHT
    ctx.fillText(user.toUpperCase(), ACCOUNT_INFO_X, NAME_Y, AVATAR_SIZE - (ACCOUNT_INFO_MARGIN_X * 2))

    // Scrobbles text

    const SCROBBLES_TEXT_MARGIN_X = 13
    const SCROBBLES_TEXT_X = ACCOUNT_INFO_X + SCROBBLES_WIDTH + SCROBBLES_TEXT_MARGIN_X
    ctx.font = '18px "Montserrat SemiBold"'
    ctx.fillText(messages.scrobbles[1], SCROBBLES_TEXT_X, SCROBBLES_Y)

    const SCROBBLES_TEXT_FIRST_Y = SCROBBLES_Y - ctx.measureText(playcount.toString()).actualBoundingBoxAscent - 10
    ctx.fillText(messages.scrobbles[0], SCROBBLES_TEXT_X, SCROBBLES_TEXT_FIRST_Y)

    // Title & subtitle

    const TITLES_MARGIN = 20
    const TITLE_Y = 65
    const SUBTITLE_MARGIN = 24

    ctx.fillStyle = colors[0]
    ctx.font = '50px "Montserrat Black"'
    ctx.fillText(messages.title.toUpperCase(), DUOTONE_BACK_WIDTH + TITLES_MARGIN, TITLE_Y)

    ctx.font = '22px "Montserrat Black"'
    ctx.fillText(messages.subtitle.toUpperCase(), DUOTONE_BACK_WIDTH + TITLES_MARGIN, TITLE_Y + SUBTITLE_MARGIN)

    const LIST_MARGIN_X = 20
    const LIST_MARGIN_Y = 65
    const LIST_X = AVATAR_X + AVATAR_SIZE + LIST_MARGIN_X
    const LIST_Y = AVATAR_Y + LIST_MARGIN_Y

    const LIST_ITEM_MARGIN = 80
    const FIXED_POSITION_WIDTH = 60

    // List text drawing
    for (const i in list) {
      const item = list[i]
      const text = item.name
      let subtext
      if (top === 'artists') {
        subtext = null
      } else {
        subtext = item.artist['#text'] || item.artist.name
      }

      const POSITION_X = LIST_X
      const POSITION_Y = LIST_Y + LIST_ITEM_MARGIN * i

      ctx.font = '55px "Montserrat Black"'
      ctx.fillText(Number(i) + 1, POSITION_X, POSITION_Y)

      if (subtext) {
        const TEXT_X = LIST_X + FIXED_POSITION_WIDTH
        ctx.font = '35px "Montserrat Black"'
        ctx.fillText(text, TEXT_X, POSITION_Y - 17, WIDTH - TEXT_X - LIST_MARGIN_X)

        ctx.font = '20px "Montserrat"'
        ctx.fillText(subtext, TEXT_X, POSITION_Y + 10, WIDTH - TEXT_X - LIST_MARGIN_X)
      } else {
        const TEXT_X = LIST_X + FIXED_POSITION_WIDTH
        ctx.font = '40px "Montserrat Black"'
        ctx.fillText(text, TEXT_X, POSITION_Y - 5, WIDTH - TEXT_X - LIST_MARGIN_X)
      }
    }

    return canvas
  }
}
