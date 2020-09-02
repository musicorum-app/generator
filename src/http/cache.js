const { Router } = require('express')
const responses = require('./responses.js')
const router = Router()
const chunker = require('../utils/chunker.js')

module.exports = (musicorum) => {
  router.route('/cache/artists')
    .post(async (req, res) => {
      const { authorization } = req.headers
      if (authorization !== process.env.API_ADMIN_TOKEN) return res.status(403).json(responses.METHOD_NOT_ALLOWED)
      const { artists } = req.body

      if (!artists) return res.status(400).json(responses.MISSING_PARAMS)
      if (!Array.isArray(artists)) return res.status(400).json(responses.INVALID_PARAMS)
      if (!artists.length) return res.status(400).json(responses.INVALID_PARAMS)

      const ids = await chunker(a => musicorum.dataManager.getArtist(a), artists, 6, 200)

      res.json({
        artists: ids.filter(r => !!r).map(r => r.spotify)
      })
    })
    .all((_, res) => {
      res.status(405).json(responses.METHOD_NOT_ALLOWED)
    })

  router.route('/cache/tracks')
    .post(async (req, res) => {
      const { authorization } = req.headers
      if (authorization !== process.env.API_ADMIN_TOKEN) return res.status(403).json(responses.METHOD_NOT_ALLOWED)
      const { tracks } = req.body

      if (!tracks) return res.status(400).json(responses.MISSING_PARAMS)
      if (!Array.isArray(tracks)) return res.status(400).json(responses.INVALID_PARAMS)
      if (!tracks.length) return res.status(400).json(responses.INVALID_PARAMS)

      const items = tracks.filter(({ name, artist }) => name && artist).map(({ name, artist }) => ({
        name,
        artist: { name: artist }
      }))

      const ids = await chunker(item => musicorum.dataManager.getTrack(item), items, 6, 200)

      res.json({
        tracks: ids.filter(r => !!r).map(r => r.spotify)
      })
    })
    .all((_, res) => {
      res.status(405).json(responses.METHOD_NOT_ALLOWED)
    })

  return router
}
