const CanvasUtils = require('../utils/CanvasUtils.js')
const { createCanvas, loadImage } = require('canvas')

CanvasUtils.init()
CanvasUtils.registerFonts()

module.exports = async (user, image) => {
  const SIZE = 400
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  const color = '#FD0F57'
  const img = await loadImage(image)
  ctx.drawImage(img, 0, 0, SIZE, SIZE)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.fillRect(0, 0, SIZE, SIZE)

  const BAR_HEIGHT = 40

  ctx.fillStyle = color
  ctx.fillRect(0, 0, SIZE, BAR_HEIGHT)

  ctx.font = 'italic 115px "Montserrat Black"'
  ctx.textAlign = 'center'
  ctx.fillText('2020', SIZE / 2, 340)

  ctx.fillStyle = 'white'
  ctx.font = 'italic 40px "Montserrat Black"'
  ctx.fillText('rewind', SIZE / 2, SIZE - 20)

  ctx.fillStyle = 'black'
  ctx.textAlign = 'start'
  ctx.font = '20px "Montserrat Black"'
  ctx.fillText(user, 12, (BAR_HEIGHT / 2) + 6, SIZE - 60)

  const logo = await loadImage(CanvasUtils.assetsSrc + '/svgs/rewind_logo.svg')
  ctx.drawImage(logo, 345, 10, 50, 19)

  return canvas
}
