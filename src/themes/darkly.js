const { CanvasUtils, LastFM } = require('..')
const Theme = require('./Theme.js')
const { createCanvas, loadImage } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

module.exports = class DarklyTheme extends Theme {
  async generate (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, modules, messages, color, accent } = options

    const title = messages.title[0].replace(/(%USER%)/g, user.toUpperCase())

    const { user: userInfo } = await lastfm.getUserInfo(user)
    if (!userInfo) throw new ResponseError(404, responses.USER_NOT_FOUND)

    const lists = await Promise.all([
      lastfm.getList(user, modules[0].type, period, 5),
      lastfm.getList(user, modules[1].type, period, 5)
    ])
    const playcount = await lastfm.getTotalScrobbles(user, period)
    // const playcount = { precise: false, playcount: 200 }

    const WIDTH = 840
    const HEIGHT = 740

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    // Text

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const AVATAR_SIZE = 330
    const AVATAR_MARGIN = 50

    ctx.font = 'italic 78px "Montserrat Black"'
    ctx.fillStyle = color
    ctx.writeScalableText(title, AVATAR_SIZE + AVATAR_MARGIN * 1.4, AVATAR_MARGIN + 70,
      WIDTH - AVATAR_SIZE - (AVATAR_MARGIN * 2), 'italic %S%px "Montserrat Black"', 78)

    ctx.textAlign = 'end'
    ctx.font = 'italic 47px "Montserrat Black"'
    ctx.writeScalableText(messages.title[1], WIDTH - AVATAR_MARGIN * 0.5, AVATAR_MARGIN + 120,
      WIDTH - AVATAR_SIZE - (AVATAR_MARGIN * 2), 'italic %S%px "Montserrat Black"', 40)
    ctx.textAlign = 'start'

    ctx.font = '70px "Montserrat Black"'
    ctx.fillStyle = accent
    const SCROBBLES_W = ctx.measureText(playcount).width
    ctx.fillText(playcount, AVATAR_SIZE + AVATAR_MARGIN * 1.2, AVATAR_MARGIN + AVATAR_SIZE - 2)

    ctx.font = '30px "Montserrat Black"'
    ctx.fillText(messages.scrobbles, AVATAR_SIZE + AVATAR_MARGIN * 1.3 + SCROBBLES_W, AVATAR_MARGIN + AVATAR_SIZE - 4)

    // ctx.font = 'bold 25px "Roboto"'
    // const NAME_W = ctx.measureText(userInfo.realname || user).width
    // ctx.fillText(userInfo.realname || user, CENTER_X - (NAME_W / 2), AVATAR_Y + AVATAR_SIZE + 30)

    // ctx.font = '20px "RobotoCondensed Light"'
    // ctx.fillStyle = 'rgba(255, 255, 255, .6)'
    // const USERNAME_W = ctx.measureText('@' + user).width
    // ctx.fillText('@' + user, CENTER_X - (USERNAME_W / 2), AVATAR_Y + AVATAR_SIZE + 60)

    // ctx.font = '15px "RobotoCondensed Light"'
    // const SCROBBLES_W = ctx.measureText(messages.scrobbles).width
    // ctx.fillText(messages.scrobbles, CENTER_X - (SCROBBLES_W / 2), AVATAR_Y + AVATAR_SIZE + 140)

    // ctx.font = 'bold 40px "RobotoMono"'
    // ctx.fillStyle = 'rgb(255, 255, 255)'
    // const PLAYCOUNT_W = ctx.measureText(playcount).width
    // ctx.fillText(playcount, CENTER_X - (PLAYCOUNT_W / 2), AVATAR_Y + AVATAR_SIZE + 115)

    const MODULE_MARGIN = AVATAR_MARGIN

    for (let t = 0; t < lists.length; t++) {
      const list = lists[t]
      const X_MODULE = ((WIDTH / 2) * t) + MODULE_MARGIN
      const Y_MODULE = AVATAR_MARGIN + AVATAR_SIZE + MODULE_MARGIN + 10

      const { message } = modules[t]

      ctx.font = '45px "Montserrat Black"'
      ctx.fillStyle = color
      ctx.fillText(message, X_MODULE, Y_MODULE)

      // const TOP_LIST_MARGIN = 80

      // ctx.font = '13px "RobotoCondensed"'
      // ctx.fillStyle = 'rgba(255, 255, 255, .7)'

      ctx.font = 'bold 30px "Montserrat"'
      ctx.fillStyle = accent
      const texts = list.map(l => l.name)

      const LIST_MARGIN = 53

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i]

        const LIST_ITEM_X = X_MODULE
        const LIST_ITEM_Y = Y_MODULE + (i * LIST_MARGIN) + 40
        ctx.writeScalableText(text, LIST_ITEM_X, LIST_ITEM_Y,
          (WIDTH / 2) - MODULE_MARGIN * 2, '%S%px Montserrat, ArialUnicode', 30)
      }
    }

    const CREDIT_MARGIN = 8
    ctx.textAlign = 'end'
    ctx.font = '20px "Montserrat"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('musicorumapp.com', WIDTH - CREDIT_MARGIN, HEIGHT - CREDIT_MARGIN)

    const [avatar] = await Promise.all([
      loadImage(userInfo.image[0]['#text'] ? LastFM.getBestImage(userInfo.image, 300) : 'https://lastfm-img2.akamaized.net/i/u/avatar320/818148bf682d429dc215c1705eb27b98')
    ])

    ctx.drawImage(avatar, AVATAR_MARGIN, AVATAR_MARGIN, AVATAR_SIZE, AVATAR_SIZE)

    return canvas
  }

  async generateStory (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, modules, messages, color, accent } = options

    const title = messages.title[0].replace(/(%USER%)/g, user.toUpperCase())

    const { user: userInfo } = await lastfm.getUserInfo(user)
    if (!userInfo) throw new ResponseError(404, responses.USER_NOT_FOUND)

    const lists = await Promise.all([
      lastfm.getList(user, modules[0].type, period, 5),
      lastfm.getList(user, modules[1].type, period, 5)
    ])
    const playcount = await lastfm.getTotalScrobbles(user, period)

    const WIDTH = 720
    const HEIGHT = 1280

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    // Text

    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const AVATAR_SIZE = 330
    const TITLE_MARGIN = 35

    ctx.font = 'italic 78px "Montserrat Black"'
    ctx.fillStyle = color
    ctx.writeScalableText(title, TITLE_MARGIN, TITLE_MARGIN + 88,
      WIDTH - (TITLE_MARGIN * 2), 'italic %S%px "Montserrat Black"', 78)

    ctx.textAlign = 'end'
    ctx.font = 'italic 47px "Montserrat Black"'
    ctx.writeScalableText(messages.title[1], WIDTH - TITLE_MARGIN * 0.5, TITLE_MARGIN + 130,
      WIDTH - (TITLE_MARGIN * 2), 'italic %S%px "Montserrat Black"', 40)
    ctx.textAlign = 'start'

    ctx.font = '70px "Montserrat Black"'
    ctx.fillStyle = accent
    ctx.fillText(playcount, AVATAR_SIZE + TITLE_MARGIN * 1.2, TITLE_MARGIN + AVATAR_SIZE + 116)

    ctx.font = '30px "Montserrat Black"'
    ctx.fillText(messages.scrobbles, AVATAR_SIZE + TITLE_MARGIN * 1.2, TITLE_MARGIN + AVATAR_SIZE + 148)

    const MODULE_MARGIN = TITLE_MARGIN
    const IMAGES_MARGIN = TITLE_MARGIN + AVATAR_SIZE + 170
    const IMAGE_SIZE = 114
    const IMAGE_INNER_MARGIN = 28

    for (let t = 0; t < lists.length; t++) {
      const list = lists[t]
      const X_MODULE = MODULE_MARGIN
      const Y_MODULE = TITLE_MARGIN + AVATAR_SIZE + 200 + t * 380

      const { message } = modules[t]

      ctx.font = '45px "Montserrat Black"'
      ctx.fillStyle = color
      ctx.fillText(message, X_MODULE, Y_MODULE)

      // const TOP_LIST_MARGIN = 80

      // ctx.font = '13px "RobotoCondensed"'
      // ctx.fillStyle = 'rgba(255, 255, 255, .7)'

      ctx.font = 'bold 30px "Montserrat"'
      ctx.fillStyle = accent
      const texts = list.map(l => l.name)

      const LIST_MARGIN = 60

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i]

        const LIST_ITEM_X = X_MODULE
        const LIST_ITEM_Y = Y_MODULE + (i * LIST_MARGIN) + 46
        ctx.writeScalableText(text, LIST_ITEM_X, LIST_ITEM_Y,
          WIDTH - IMAGE_SIZE - MODULE_MARGIN * 2, '%S%px Montserrat, ArialUnicode', 30)
      }
    }

    for (let i = 0; i < lists[0].length; i++) {
      const item = lists[0][i]

      const image = await this.getItemImage(modules[0].type, item)

      const X = WIDTH - MODULE_MARGIN / 2 - IMAGE_SIZE
      const Y = IMAGES_MARGIN + (IMAGE_SIZE + IMAGE_INNER_MARGIN) * i
      ctx.drawImage(image, X, Y, IMAGE_SIZE, IMAGE_SIZE)
    }

    const CREDIT_MARGIN = 8
    ctx.textAlign = 'end'
    ctx.font = '20px "Montserrat"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('musicorumapp.com', WIDTH - CREDIT_MARGIN, HEIGHT - CREDIT_MARGIN)

    const avatar = await loadImage(userInfo.image[0]['#text'] ? LastFM.getBestImage(userInfo.image, 300) : 'https://lastfm-img2.akamaized.net/i/u/avatar320/818148bf682d429dc215c1705eb27b98')

    ctx.drawImage(avatar, TITLE_MARGIN, TITLE_MARGIN + 150, AVATAR_SIZE, AVATAR_SIZE)

    return canvas
  }
}
