const { Router } = require('express')
const responses = require('./responses.js')
const ResponseError = require('./ResponseError.js')
const router = Router()
const sharp = require('sharp')

module.exports = class Routers {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.routers()
  }

  routers () {
    router.route('/generate')
      .post(async (req, res) => {
        const { theme, options, scheduler } = req.body
        const source = scheduler ? 'SCHEDULER' : 'WEB'
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
          const img = await this.musicorum.themes[theme].preGenerate(options)
          const prefix = 'data:image/jpeg;base64,'
          const sharped = await sharp(img.toBuffer()).jpeg({ quality: 100 }).toBuffer()
          const base64 = sharped.toString('base64')
          const duration = (new Date().getTime() - start.getTime())
          res.status(200).json({
            duration,
            base64: prefix + base64
          })
          // res.set({ 'Content-Type': 'image/webp' })
          // img.pngStream().pipe(sharp().webp()).pipe(res)
          console.log('IMAGE GENERATION ENDED SUCCESSFULLY IN ' + duration + 'ms')
          this.musicorum.controlsAPI.registerGeneration(theme, start.getTime(), duration, 'SUCCESS', source).then(res => res.json())
        } catch (e) {
          const duration = (new Date().getTime() - start.getTime())
          if (e instanceof ResponseError) res.status(e.code).json(e.response)
          res.status(500).json(responses.GENERIC_ERROR)
          console.log('IMAGE GENERATION ENDED WITH ERROR IN ' + duration + 'ms')
          console.error(e)
          await this.musicorum.controlsAPI.registerGeneration(theme, start.getTime(), duration, 'ERROR', source)
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
