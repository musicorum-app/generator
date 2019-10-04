const { Router } = require('express')
const router = Router()

router.all('/', (req, res) => {
  res.json({ status: 'OK' })
})

module.exports = router
