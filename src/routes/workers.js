export default ({
  router,
  logger
}) => {
  router.get('/workers', (req, res) => {
    res.send('OK')
  })
}
