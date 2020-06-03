const { CanvasUtils, LastFM } = require('../')
const Theme = require('./Theme.js')
const { createCanvas, loadImage } = require('canvas')
const responses = require('../http/responses.js')
const ResponseError = require('../http/ResponseError.js')

CanvasUtils.init()
CanvasUtils.registerFonts()

module.exports = class TopsTheme extends Theme {
  async generate (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, modules, messages } = options

    const title = messages.title.replace(/(%USER%)/g, user)

    const { user: userInfo } = await lastfm.getUserInfo(user)
    if (!userInfo) throw new ResponseError(404, responses.USER_NOT_FOUND)

    const lists = await Promise.all([
      lastfm.getList(user, modules[0].type, period, 5),
      lastfm.getList(user, modules[1].type, period, 5)
    ])
    const playcount = await lastfm.getTotalScrobbles(user, period)
    // const playcount = { precise: false, playcount: 200 }

    const WIDTH = 660
    const HEIGHT = 400

    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    // Text & Gradient

    if (!userInfo.image || !userInfo.image.length || !userInfo.image[0]['#text']) {
      const BG_GRADIENT = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
      BG_GRADIENT.addColorStop(0, '#e02f2f')
      BG_GRADIENT.addColorStop(1, '#7f0e00')
      ctx.fillStyle = BG_GRADIENT
      ctx.fillRect(0, 0, WIDTH, HEIGHT)
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const CENTER_X = WIDTH / 2
    const AVATAR_SIZE = 180
    const AVATAR_Y = 60

    ctx.font = '35px "ProductSans"'
    ctx.fillStyle = 'rgb(255, 255, 255)'
    const TITLE_W = ctx.measureText(title).width
    ctx.fillText(title, CENTER_X - (TITLE_W / 2), 40)

    ctx.font = 'bold 25px "Roboto"'
    const NAME_W = ctx.measureText(userInfo.realname || user).width
    ctx.fillText(userInfo.realname || user, CENTER_X - (NAME_W / 2), AVATAR_Y + AVATAR_SIZE + 30)

    ctx.font = '20px "RobotoCondensed Light"'
    ctx.fillStyle = 'rgba(255, 255, 255, .6)'
    const USERNAME_W = ctx.measureText('@' + user).width
    ctx.fillText('@' + user, CENTER_X - (USERNAME_W / 2), AVATAR_Y + AVATAR_SIZE + 60)

    ctx.font = '15px "RobotoCondensed Light"'
    const SCROBBLES_W = ctx.measureText(messages.scrobbles).width
    ctx.fillText(messages.scrobbles, CENTER_X - (SCROBBLES_W / 2), AVATAR_Y + AVATAR_SIZE + 140)

    ctx.font = 'bold 40px "RobotoMono"'
    ctx.fillStyle = 'rgb(255, 255, 255)'
    const PLAYCOUNT_W = ctx.measureText(playcount).width
    ctx.fillText(playcount, CENTER_X - (PLAYCOUNT_W / 2), AVATAR_Y + AVATAR_SIZE + 115)

    const MODULE_INNER_MARGIN = WIDTH * 0.35

    const COVER_SIZE = 120
    const COVER_Y = HEIGHT / 2 - COVER_SIZE / 2
    const COVER_MARGIN = COVER_Y + COVER_SIZE + 25

    for (let t = 0; t < lists.length; t++) {
      const list = lists[t]
      if (!list[0]) continue
      const X_MODULE_CENTER = WIDTH / 2 + (t === 1 ? MODULE_INNER_MARGIN : -Math.abs(MODULE_INNER_MARGIN))
      const COVER_X = X_MODULE_CENTER - COVER_SIZE / 2

      const type = modules[t].type

      const img = await this.getItemImage(type, list[0])

      ctx.drawImage(img, COVER_X, COVER_Y, COVER_SIZE, COVER_SIZE)

      ctx.font = '15px "RobotoCondensed Light, ArialUnicode"'
      ctx.fillStyle = 'rgba(255, 255, 255, .6)'
      const TOP_TITLE_W = ctx.measureText(modules[t].message).width
      ctx.fillText(modules[t].message, X_MODULE_CENTER - (TOP_TITLE_W / 2), COVER_Y - 10)

      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      console.log(list[0])
      const NAME_W = ctx.measureText(list[0].name).width
      ctx.fillText(list[0].name, X_MODULE_CENTER - (NAME_W / 2), COVER_MARGIN)

      if (modules[t].type !== 'artists') {
        ctx.fillStyle = 'rgba(255, 255, 255, .5)'
        const SUB_NAME_W = ctx.measureText(list[0].artist.name).width
        ctx.fillText(list[0].artist.name, X_MODULE_CENTER - (SUB_NAME_W / 2), COVER_MARGIN + 20)
      }

      const PLAYCOUNT_GRADIENT = ctx.createLinearGradient(COVER_X + COVER_SIZE, COVER_Y + COVER_SIZE, COVER_X + (COVER_SIZE * 0.3), COVER_Y)
      PLAYCOUNT_GRADIENT.addColorStop(0, 'rgba(0, 0, 0, .7)')
      PLAYCOUNT_GRADIENT.addColorStop(0.20, 'rgba(0, 0, 0, .4)')
      PLAYCOUNT_GRADIENT.addColorStop(0.36, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = PLAYCOUNT_GRADIENT
      ctx.fillRect(COVER_X, COVER_Y, COVER_SIZE, COVER_SIZE)

      ctx.font = '17px "RobotoMono-Light"'
      ctx.fillStyle = 'rgb(255, 255, 255)'
      const PLAYCOUNT = list[0].playcount
      const PLAYCOUNT_X = COVER_X + COVER_SIZE - ctx.measureText(PLAYCOUNT).width - 5
      const PLAYCOUNT_Y = COVER_Y + COVER_SIZE - 5
      ctx.fillText(PLAYCOUNT, PLAYCOUNT_X, PLAYCOUNT_Y)

      // const TOP_LIST_MARGIN = 80

      // ctx.font = '13px "RobotoCondensed"'
      // ctx.fillStyle = 'rgba(255, 255, 255, .7)'

      // const texts = list.slice(1, 5).map((l, i) => `${i + 2}. ${l.name}`)
      // const highest = texts.reduce((a, b) => a.length > b.length ? a : b)
      // for (let i = 0; i < texts.length; i++) {
      //   const text = texts[i]

      //   const LIST_ITEM_X = X_MODULE_CENTER - (ctx.measureText(highest).width / 2)
      //   const LIST_ITEM_Y = COVER_Y + COVER_SIZE + TOP_LIST_MARGIN + 16 * i
      //   ctx.fillText(text, LIST_ITEM_X, LIST_ITEM_Y)
      // }
    }

    const CREDIT_MARGIN = 8
    ctx.textAlign = 'end'
    ctx.font = '14px "Montserrat"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('musicorumapp.com', WIDTH - CREDIT_MARGIN, HEIGHT - CREDIT_MARGIN)

    const [avatar] = await Promise.all([
      loadImage(userInfo.image[0]['#text'] ? LastFM.getBestImage(userInfo.image, 300) : 'https://lastfm-img2.akamaized.net/i/u/avatar320/818148bf682d429dc215c1705eb27b98')
    ])

    ctx.roundImage(avatar, CENTER_X - (AVATAR_SIZE / 2), AVATAR_Y, AVATAR_SIZE, AVATAR_SIZE)

    ctx.globalCompositeOperation = 'destination-over'
    ctx.drawBlurredImage(avatar, 18, 0, ((WIDTH - HEIGHT) / 2) * -1, WIDTH, WIDTH)

    return canvas
  }

  async generateStory (options) {
    const lastfm = this.musicorum.lastfm
    const { user, period, modules, messages } = options

    const title = messages.title.replace(/(%USER%)/g, user)

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

    if (!userInfo.image || !userInfo.image.length || !userInfo.image[0]['#text']) {
      const BG_GRADIENT = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
      BG_GRADIENT.addColorStop(0, '#e02f2f')
      BG_GRADIENT.addColorStop(1, '#7f0e00')
      ctx.fillStyle = BG_GRADIENT
      ctx.fillRect(0, 0, WIDTH, HEIGHT)
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const CENTER_X = WIDTH / 2

    const AVATAR_Y = 120
    const AVATAR_SIZE = 500

    ctx.font = '40px "ProductSans, ArialUnicode"'
    ctx.fillStyle = 'rgb(255, 255, 255)'
    const TITLE_W = ctx.measureText(title).width
    ctx.fillText(title, CENTER_X - (TITLE_W / 2), 75)

    ctx.font = 'bold 57px "Roboto"'
    const NAME_W = ctx.measureText(userInfo.realname || user).width
    ctx.fillText(userInfo.realname || user, CENTER_X - (NAME_W / 2), AVATAR_Y + AVATAR_SIZE + 60)

    ctx.font = '30px "Roboto Light"'
    ctx.fillStyle = 'rgba(255, 255, 255, .6)'
    const USERNAME_W = ctx.measureText('@' + user).width
    ctx.fillText('@' + user, CENTER_X - (USERNAME_W / 2), AVATAR_Y + AVATAR_SIZE + 95)

    // Playcount
    ctx.font = 'bold 70px "RobotoMono"'
    ctx.fillStyle = 'rgb(255, 255, 255)'
    const PLAYCOUNT_W = ctx.measureText(playcount).width
    ctx.fillText(playcount, CENTER_X - (PLAYCOUNT_W / 2), HEIGHT - 74)

    ctx.fillStyle = 'rgba(255, 255, 255, .6)'
    ctx.font = '20px "RobotoCondensed Light"'
    const SCROBBLES_W = ctx.measureText(messages.scrobbles).width
    ctx.fillText(messages.scrobbles, CENTER_X - (SCROBBLES_W / 2), HEIGHT - 50)

    const COVER_SIZE = 290
    const COVER_Y = 790
    const MODULE_MARGIN = (WIDTH - (COVER_SIZE * 2)) / 3

    for (let t = 0; t < lists.length; t++) {
      const list = lists[t]
      const COVER_X = MODULE_MARGIN * (t + 1) + (t === 1 ? COVER_SIZE : 0)
      const X_MODULE_CENTER = COVER_X + COVER_SIZE * 0.5

      const type = modules[t].type

      const img = await this.getItemImage(type, list[0])

      ctx.drawImage(img, COVER_X, COVER_Y, COVER_SIZE, COVER_SIZE)

      ctx.font = '15px "Roboto Light, ArialUnicode"'
      ctx.fillStyle = 'rgba(255, 255, 255, .6)'
      ctx.textAlign = 'center'
      ctx.fillText(modules[t].message, X_MODULE_CENTER, COVER_Y - 10)

      const MAX_WIDTH = WIDTH / 2 - 30

      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.writeScalableText(list[0].name, X_MODULE_CENTER, COVER_Y + COVER_SIZE + 35,
        MAX_WIDTH, '%S%px "RobotoCondensed Light, ArialUnicode"', 29)

      if (modules[t].type !== 'artists') {
        ctx.fillStyle = 'rgba(255, 255, 255, .5)'
        ctx.writeScalableText(list[0].artist.name, X_MODULE_CENTER, COVER_Y + COVER_SIZE + 65,
          MAX_WIDTH, '%S%px "RobotoCondensed Light, ArialUnicode"', 20)
      }

      // const TOP_LIST_MARGIN = 80

      // ctx.font = '13px "RobotoCondensed"'
      // ctx.fillStyle = 'rgba(255, 255, 255, .7)'

      // const texts = list.slice(1, 5).map((l, i) => `${i + 2}. ${l.name}`)
      // const highest = texts.reduce((a, b) => a.length > b.length ? a : b)
      // for (let i = 0; i < texts.length; i++) {
      //   const text = texts[i]

      //   const LIST_ITEM_X = X_MODULE_CENTER - (ctx.measureText(highest).width / 2)
      //   const LIST_ITEM_Y = COVER_Y + COVER_SIZE + TOP_LIST_MARGIN + 16 * i
      //   ctx.fillText(text, LIST_ITEM_X, LIST_ITEM_Y)
      // }
    }

    const CREDIT_MARGIN = 15
    ctx.textAlign = 'end'
    ctx.font = '14px "Montserrat"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('musicorumapp.com', WIDTH - CREDIT_MARGIN, HEIGHT - CREDIT_MARGIN)

    const avatar = await loadImage(userInfo.image[0]['#text'] ? LastFM.getBestImage(userInfo.image, 500) : 'https://lastfm-img2.akamaized.net/i/u/avatar320/818148bf682d429dc215c1705eb27b98')

    ctx.roundImage(avatar, CENTER_X - (AVATAR_SIZE / 2), AVATAR_Y, AVATAR_SIZE, AVATAR_SIZE)

    ctx.globalCompositeOperation = 'destination-over'
    ctx.drawBlurredImage(avatar, 20, (WIDTH / 3) * -1, 0, HEIGHT, HEIGHT)

    return canvas
  }
}
