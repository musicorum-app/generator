const { Router } = require('express')
const responses = require('./responses.js')
const ResponseError = require('./ResponseError.js')
const router = Router()
const sharp = require('sharp')
const Sentry = require('@sentry/node')
const crypto = require('crypto')
const MiscUtils = require('../utils/MiscUtils.js')

Sentry.init({ dsn: 'https://71e513cd826c403a98df4e163b510f75@o379578.ingest.sentry.io/5214235' })

module.exports = class Routers {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.routers()
  }

  routers () {
    router.route('/generate')
      .post(async (req, res) => {
        const { theme, options, raw } = req.body
        const source = req.headers['x-source'] ? req.headers['x-source'].toLowerCase() : 'unknown'
        if (!theme || !options) {
          res.status(400).json(responses.MISSING_PARAMS)
          return
        }
        if (!Object.keys(this.musicorum.themes).includes(theme)) {
          res.status(404).json(responses.THEME_NOT_FOUND)
          return
        }
        const start = new Date()
        console.log('STARTING IMAGE GENERATION FOR THEME ' + theme + ' FROM SOURCE ' + source)
        try {
          const img = await this.musicorum.themes[theme].preGenerate(options)
          if (raw && !!process.env.ALLOW_RAW) {
            res.setHeader('Content-Type', 'image/png')
            img.pngStream().pipe(res)
            return
          }
          const prefix = 'data:image/jpeg;base64,'
          const sharped = await sharp(img.toBuffer()).jpeg({ quality: Number(process.env.QUALITY) || 90 }).toBuffer()
          const base64 = prefix + sharped.toString('base64')
          const duration = (new Date().getTime() - start.getTime())
          const signature = crypto.createHash('sha256').update(`${base64}@${process.env.UPLOAD_TOKEN}`).digest('base64')
          res.status(200).json({
            duration,
            signature,
            base64: base64
          })
          // res.set({ 'Content-Type': 'image/webp' })
          // img.pngStream().pipe(sharp().webp()).pipe(res)
          console.log('IMAGE GENERATION ENDED SUCCESSFULLY IN ' + duration + 'ms')
          this.musicorum.controlsAPI.registerGeneration(theme, start.getTime(), duration, 'SUCCESS', source)
        } catch (e) {
          const duration = (new Date().getTime() - start.getTime())
          if (e instanceof ResponseError) return res.status(e.code).json(e.response)
          res.status(500).json(responses.GENERIC_ERROR)
          console.log('IMAGE GENERATION ENDED WITH ERROR IN ' + duration + 'ms')
          console.error(e)
          Sentry.captureException(e)
          await this.musicorum.controlsAPI.registerGeneration(theme, start.getTime(), duration, 'ERROR', source)
        }
      })
      .all((_, res) => {
        res.status(405).json(responses.METHOD_NOT_ALLOWED)
      })

    router.route('/cache/artists')
      .post(async (req, res) => {
        const { authorization } = req.headers
        if (authorization !== process.env.API_ADMIN_TOKEN) return res.status(403).json(responses.METHOD_NOT_ALLOWED)
        const { artists } = req.body

        if (!artists) return res.status(400).json(responses.MISSING_PARAMS)
        if (!Array.isArray(artists)) return res.status(400).json(responses.INVALID_PARAMS)
        if (!artists.length) return res.status(400).json(responses.INVALID_PARAMS)

        const mapper = async a => (new Promise(resolve => {
          resolve(this.musicorum.dataManager.getArtist(a))
        }))
        const promises = []

        artists.forEach(a => {
          promises.push(async () => (
            mapper(a)
          ))
        })
        const ids = []

        const chunks = MiscUtils.chunkArray(promises, 5)

        for (let i = 0; i < chunks.length; i++) {
          const res = await Promise.all(chunks[i].map(f => f()))
          await MiscUtils.wait(300)
          ids.push(...res.filter(r => !!r).map(r => r.spotify))
        }

        res.json({
          artists: ids
        })
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
