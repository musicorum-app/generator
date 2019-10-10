const { Router } = require('express')
const router = Router()

module.exports = class Routers {
  constructor (musicorum) {
    this.musicorum = musicorum
    this.routers()
  }

  routers () {
    router.all('/', (req, res) => {
      res.json({ status: 'OK' })
    })

    router.post('/generate', async (req, res) => {
      // TODO: Snapshot cache system
      res.set({ 'Content-Type': 'image/png' })
      res.status(200)
      const { theme, options } = req.body
      const img = await this.musicorum.themes[theme]({ musicorum: this.musicorum }, options)
      img.pngStream().pipe(res)
    })
  }

  get router () {
    return router
  }
}
