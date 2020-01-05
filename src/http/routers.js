const { Router } = require('express')
const responses = require('./responses.js')
const router = Router()
const sharp = require('sharp')

const sharper = sharp().webp()

module.exports = class Routers {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.routers()
  }

  routers () {
    router.route('/generate')
      .post(async (req, res) => {
        // TODO: Snapshot cache system
        const { theme, options } = req.body
        if (!theme || !options) {
          res.status(400).json(responses.MISSING_PARAMS)
          return
        }
        if (!Object.keys(this.musicorum.themes).includes(theme)) {
          res.status(404).json(responses.THEME_NOT_FOUND)
          return
        }
        const start = new Date()
        console.log('STARTING IMAGE GENERATION FOR THEME ' + theme)
        try {
          const img = await this.musicorum.themes[theme]({ musicorum: this.musicorum }, options)
          res.set({ 'Content-Type': 'image/webp' })
          img.pngStream().pipe(sharp().webp()).pipe(res)
          console.log('IMAGE GENERATION ENDED SUCCESSFULLY IN ' + (new Date().getTime() - start.getTime()) + 'ms')
        } catch (err) {
          res.status(err.code || 500).json(err.response || err.message)
          console.log('IMAGE GENERATION ENDED WITH ERROR IN ' + (new Date().getTime() - start.getTime()) + 'ms')
          console.error(err)
        }
      })
      .all((_, res) => {
        res.status(405).json(responses.METHOD_NOT_ALLOWED)
      })

    router.all('*', (_, res) => {
      res.status(404).json(responses.ENDPOINT_NOT_FOUND)
    })
  }

  get router () {
    return router
  }
}
