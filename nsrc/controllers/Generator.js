module.exports = {
  generate (req, res) {
    const { theme, options } = req.body

    res
      .set({ 'Content-Type': 'image/png' })
      .status(200)

    const image = await
  }
}