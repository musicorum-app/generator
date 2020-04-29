const { CanvasUtils } = require('../')
const Theme = require('./Theme.js')
const { createCanvas } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

const colorsPallete = {
  purplish: ['#16006F', '#F7396F'],
  natural: ['#1A2A56', '#00D574'],
  divergent: ['#7a004f', '#80f8f8'],
  sun: ['#EA1264', '#D7FD31'],
  yellish: ['#141209', '#ffea00'],
  horror: ['#000000', '#dc2c2c']
}

module.exports = class DuoToneTheme extends Theme {
  async generate (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, top, messages, pallete } = options
    const colors = colorsPallete[pallete]

    const { user: userInfo } = await lastfm.getUserInfo(user)
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

    ctx.globalAlpha = 0.37
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
        ctx.font = '35px "Montserrat Black, Code2000"'
        ctx.fillText(text, TEXT_X, POSITION_Y - 17, WIDTH - TEXT_X - LIST_MARGIN_X)

        ctx.font = '20px "Montserrat, Code2000"'
        ctx.fillText(subtext, TEXT_X, POSITION_Y + 10, WIDTH - TEXT_X - LIST_MARGIN_X)
      } else {
        const TEXT_X = LIST_X + FIXED_POSITION_WIDTH
        ctx.font = '40px "Montserrat Black, Code2000"'
        ctx.fillText(text, TEXT_X, POSITION_Y - 5, WIDTH - TEXT_X - LIST_MARGIN_X)
      }
    }

    const CREDIT_MARGIN = 8
    ctx.textAlign = 'end'
    ctx.font = '15px "Montserrat"'
    ctx.fillText('musicorumapp.com', WIDTH - CREDIT_MARGIN, HEIGHT - CREDIT_MARGIN)

    return canvas
  }

  async generateStory (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, top, messages, pallete } = options
    const colors = colorsPallete[pallete]

    const { user: userInfo } = await lastfm.getUserInfo(user)
    if (!userInfo) throw new ResponseError(404, responses.USER_NOT_FOUND)

    const playcount = await lastfm.getTotalScrobbles(user, period)
    const list = await lastfm.getList(user, top, period, 8)
    // const playcount = { precise: false, playcount: 200 }

    const WIDTH = 720
    const HEIGHT = 1280

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    // Background

    ctx.fillStyle = colors[1]
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const userImage = await this.loadUserImage(userInfo, 400)

    // ctx.drawDuotoneImage(userImage, colors, 0, 0, 400, 600)
    const DUOTONE_BACK_WIDTH = 280
    const DUOTONE_SIZE = WIDTH

    ctx.drawDuotoneImage(userImage, colors, 0, -DUOTONE_BACK_WIDTH, DUOTONE_SIZE, DUOTONE_SIZE)

    const AVATAR_SIZE = 470
    const AVATAR_X = WIDTH / 2 - (AVATAR_SIZE / 2)
    const AVATAR_Y = 100

    ctx.drawImage(userImage, AVATAR_X, AVATAR_Y, AVATAR_SIZE, AVATAR_SIZE)

    const GRADIENT_HEIGHT = 120
    const GRADIENT_Y = AVATAR_Y + AVATAR_SIZE - GRADIENT_HEIGHT

    const ACCOUNT_GRADIENT = ctx.createLinearGradient(AVATAR_X, GRADIENT_Y, AVATAR_X, AVATAR_Y + AVATAR_SIZE)
    ACCOUNT_GRADIENT.addColorStop(0, CanvasUtils.createRGBAFromHex(colors[0], 0))
    ACCOUNT_GRADIENT.addColorStop(0.4, CanvasUtils.createRGBAFromHex(colors[0], 0.5))
    ACCOUNT_GRADIENT.addColorStop(1, CanvasUtils.createRGBAFromHex(colors[0], 0.7))

    ctx.fillStyle = ACCOUNT_GRADIENT
    ctx.fillRect(AVATAR_X, GRADIENT_Y, AVATAR_SIZE, GRADIENT_HEIGHT)

    // Background images

    ctx.globalAlpha = 0.37
    for (const i in list) {
      const item = list[i]
      const image = await this.getItemImage(top, item)
      const IMAGE_SIZE = 110
      const IMAGE_MARGIN_Y = 12
      const IMAGE_MARGIN_X = IMAGE_MARGIN_Y
      const IMAGE_STARTING_Y = WIDTH - IMAGE_MARGIN_Y - IMAGE_SIZE
      const IMAGE_X = (i >= 4 ? IMAGE_STARTING_Y : IMAGE_STARTING_Y - IMAGE_SIZE - IMAGE_MARGIN_X)
      const SECOND_ROW_Y = i >= 4 ? 0 : IMAGE_SIZE + IMAGE_MARGIN_Y
      const IMAGE_Y = AVATAR_SIZE + AVATAR_Y + 40 + IMAGE_MARGIN_Y + (IMAGE_SIZE + IMAGE_MARGIN_Y) * (i >= 4 ? i - 4 : i) + SECOND_ROW_Y

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

    const TITLE_Y = AVATAR_SIZE + AVATAR_Y + 60
    const SUBTITLE_MARGIN = 24

    ctx.fillStyle = colors[0]
    ctx.font = '40px "Montserrat Black"'
    ctx.textAlign = 'center'
    ctx.fillText(messages.title.toUpperCase(), WIDTH / 2, TITLE_Y)
    const TITLE_W = ctx.measureText(messages.title.toUpperCase()).width
    const SUBTITLE_X = WIDTH / 2 + TITLE_W / 2

    ctx.textAlign = 'end'
    ctx.font = '22px "Montserrat Black"'
    ctx.fillText(messages.subtitle.toUpperCase(), SUBTITLE_X, TITLE_Y + SUBTITLE_MARGIN)
    ctx.textAlign = 'start'

    const LIST_MARGIN_X = 20
    const LIST_MARGIN_Y = 100
    const LIST_X = 35
    const LIST_Y = TITLE_Y + LIST_MARGIN_Y

    const LIST_ITEM_MARGIN = 70
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

      ctx.font = '50px "Montserrat Black"'
      ctx.fillText(Number(i) + 1, POSITION_X, POSITION_Y)

      if (subtext) {
        const TEXT_X = LIST_X + FIXED_POSITION_WIDTH
        ctx.font = '35px "Montserrat Black, Code2000"'
        ctx.fillText(text, TEXT_X, POSITION_Y - 17, WIDTH - TEXT_X - LIST_MARGIN_X)

        ctx.font = '20px "Montserrat, Code2000"'
        ctx.fillText(subtext, TEXT_X, POSITION_Y + 10, WIDTH - TEXT_X - LIST_MARGIN_X)
      } else {
        const TEXT_X = LIST_X + FIXED_POSITION_WIDTH
        ctx.font = '40px "Montserrat Black, Code2000"'
        ctx.writeScalableText(text, TEXT_X, POSITION_Y - 5, WIDTH - TEXT_X - LIST_MARGIN_X,
          '%S%px "Montserrat Black, Code2000"', 40)
      }
    }

    const CREDIT_MARGIN = 8
    ctx.textAlign = 'end'
    ctx.font = '15px "Montserrat"'
    ctx.fillText('musicorumapp.com', WIDTH - CREDIT_MARGIN, HEIGHT - CREDIT_MARGIN)

    return canvas
  }
}
