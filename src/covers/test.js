const CanvasUtils = require('../utils/CanvasUtils.js')
const { createCanvas, loadImage } = require('canvas')

CanvasUtils.init()
CanvasUtils.registerFonts()

module.exports = async (user, image) => {
  const canvas = createCanvas(300, 300)
  const ctx = canvas.getContext('2d')

  // const color = '#F9C80E'
  const img = await loadImage(image)
  ctx.drawImage(img, 0, 0, 300, 300)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(0, 0, 300, 300)

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = '20px "Montserrat Black"'
  ctx.fillText(user, 150, 280, 300)
  const logo = await loadImage(CanvasUtils.assetsSrc + '/svgs/logo.svg')

  ctx.drawImage(logo, 239, 15, 48, 15)

  return canvas
}
