const { createCanvas, registerFont, Context2d, Canvas, loadImage } = require('canvas')
const fetch = require('node-fetch')
const fs = require('fs')
const { promisify } = require('util')
const chalk = require('chalk')
const path = require('path')

const ASSETS_SRC = path.resolve(__dirname, '..', 'assets')

const writeFile = promisify(fs.writeFile)

module.exports = class CanvasUtils {
  static init () {
    Context2d.prototype.writeScalableText = function (text, x, y, maxWidth, style, startingSize) {
      let width = this.measureText(text).width
      let size = startingSize
      while (width > maxWidth) {
        size--
        this.font = style.replace('%S%', size)
        width = this.measureText(text).width
        if (size === 2) break
      }
      this.font = style.replace('%S%', size)
      this.fillText(text, x, y)
    }

    Context2d.prototype.printTextBox = function (text, x, y, lH, fit) {
      fit = fit || 0
      const ctx = this

      if (fit <= 0) {
        ctx.fillText(text, x, y)
        return
      }

      let words = text.split(' ')
      let currentLine = 0
      let idx = 1

      while (words.length > 0 && idx <= words.length) {
        const str = words.slice(0, idx).join(' ')
        const w = ctx.measureText(str).width
        if (w > fit) {
          if (idx === 1) {
            idx = 2
          }
          const { width } = ctx.measureText(words.slice(0, idx - 1).join(' '))

          ctx.fillText(words.slice(0, idx - 1).join(' '), x + (fit - width) / 2, y + (lH * currentLine))
          currentLine++
          words = words.splice(idx - 1)
          idx = 1
        } else idx++
      }
      if (idx > 0) {
        const { width } = ctx.measureText(words.join(' '))
        ctx.fillText(words.join(' '), x + (fit - width) / 2, y + (lH * currentLine))
      }
    }

    Canvas.prototype.blur = function (blur) {
      const ctx = this.getContext('2d')

      const delta = 5
      const alphaLeft = 1 / (2 * Math.PI * delta * delta)
      const step = blur < 3 ? 1 : 2
      let sum = 0
      for (let y = -blur; y <= blur; y += step) {
        for (let x = -blur; x <= blur; x += step) {
          const weight = alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta))
          sum += weight
        }
      }
      for (let y = -blur; y <= blur; y += step) {
        for (let x = -blur; x <= blur; x += step) {
          ctx.globalAlpha = alphaLeft * Math.exp(-(x * x + y * y) / (2 * delta * delta)) / sum * blur
          ctx.drawImage(this, x, y)
        }
      }
      ctx.globalAlpha = 1
    }

    Context2d.prototype.drawBlurredImage = function (image, blur, imageX, imageY, w = image.width, h = image.height) {
      const canvas = createCanvas(w, h)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(image, 0, 0, w, h)
      canvas.blur(blur)
      this.drawImage(canvas, imageX, imageY, w, h)
    }

    Context2d.prototype.roundImageCanvas = function (img, w = img.width, h = img.height, r = w * 0.5) {
      const canvas = createCanvas(w, h)
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(img, 0, 0, w, h)

      ctx.fillStyle = '#fff'
      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath()
      ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2, true)
      ctx.closePath()
      ctx.fill()

      return canvas
    }

    Context2d.prototype.roundImage = function (img, x, y, w, h, r) {
      this.drawImage(this.roundImageCanvas(img, w, h, r), x, y, w, h)
      return this
    }

    Context2d.prototype.createGradientMap = function (tone0, tone1) {
      const rgb0 = CanvasUtils.hexToRGB(tone0)
      const rgb1 = CanvasUtils.hexToRGB(tone1)
      const gradient = []
      for (let i = 0; i < (256 * 4); i += 4) {
        gradient[i] = ((256 - i / 4) * rgb0.r + (i / 4) * rgb1.r) / 256
        gradient[i + 1] = ((256 - i / 4) * rgb0.g + (i / 4) * rgb1.g) / 256
        gradient[i + 2] = ((256 - i / 4) * rgb0.b + (i / 4) * rgb1.b) / 256
        gradient[i + 3] = 255
      }
      return gradient
    }

    Context2d.prototype.grayscale = function (x, y, w, h) {
      const pixels = this.getImageData(x, y, w, h)
      const d = pixels.data
      let min = 255
      let max = 0

      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > max) max = d[i]
        if (d[i] < min) min = d[i]

        const r = d[i]
        const g = d[i + 1]
        const b = d[i + 2]
        const v = 0.3333 * r + 0.3333 * g + 0.3333 * b
        d[i] = d[i + 1] = d[i + 2] = v
      }
      for (let i = 0; i < d.length; i += 4) {
        const v = (d[i] - min) * 255 / (max - min)
        d[i] = d[i + 1] = d[i + 2] = v
      }
      this.putImageData(pixels, x, y)
    }

    Context2d.prototype.canvasDuoToneImage = function (img, [t0, t1], w, h) {
      const canvas = createCanvas(w, h)
      const ctx = canvas.getContext('2d')

      ctx.drawImage(img, 0, 0, w, h)
      ctx.grayscale(0, 0, w, h)
      const pixels = ctx.getImageData(0, 0, w, h)
      const gradient = ctx.createGradientMap(t0, t1)

      const d = pixels.data

      for (let i = 0; i < d.length; i += 4) {
        d[i] = gradient[d[i] * 4]
        d[i + 1] = gradient[d[i + 1] * 4 + 1]
        d[i + 2] = gradient[d[i + 2] * 4 + 2]
      }
      ctx.putImageData(pixels, 0, 0)

      return canvas
    }

    Context2d.prototype.drawDuotoneImage = function (img, grd, x, y, w, h) {
      const canvas = this.canvasDuoToneImage(img, grd, w, h)
      this.drawImage(canvas, x, y)
      return this
    }
  }

  static async loadCachedImage (url) {
    const fileName = url.replace(/\//g, '_').replace(/:/g, '_')
    // TODO: Spotify urls
    const pathName = path.resolve(__dirname, '..', '..', 'cache', fileName)
    return loadImage(pathName)
      .then(i => i)
      .catch(async () => {
        console.log(chalk.yellow(' DOWNLOADING IMAGE ') + 'from ' + url)
        const res = await fetch(url)
        const buffer = await res.buffer()
        CanvasUtils.saveImage(buffer, pathName)
        return loadImage(buffer)
      })
  }

  static saveImage (buffer, filePath) {
    // console.log(chalk.cyan(' SAVING CACHE ') + 'at ' + filePath)

    try {
      writeFile(filePath, buffer)
      console.log(chalk.green(' CACHE SAVED ') + 'at ' + filePath)
    } catch (e) {
      console.log(chalk.red(' CACHE ERROR: ' + e))
    }
  }

  static hexToRGB (hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  static createRGBAFromHex (hex, alpha) {
    const { r, g, b } = CanvasUtils.hexToRGB(hex)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  static registerFonts () {
    // Code2000 fallback
    registerFont(ASSETS_SRC + '/fonts/Code2000.ttf', { family: 'Code2000' })
    // Roboto
    registerFont(ASSETS_SRC + '/fonts/RobotoCondensed-Bold.ttf', { family: 'RobotoCondensed', weight: 'bold' })
    registerFont(ASSETS_SRC + '/fonts/RobotoCondensed-BoldItalic.ttf', { family: 'RobotoCondensed', weight: 'bold', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/RobotoCondensed-Italic.ttf', { family: 'RobotoCondensed', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/RobotoCondensed-Light.ttf', { family: 'RobotoCondensed Light' })
    registerFont(ASSETS_SRC + '/fonts/RobotoCondensed-LightItalic.ttf', { family: 'RobotoCondensed-Light', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/RobotoCondensed-Regular.ttf', { family: 'RobotoCondensed' })
    registerFont(ASSETS_SRC + '/fonts/Roboto-Light.ttf', { family: 'Roboto Light' })
    registerFont(ASSETS_SRC + '/fonts/Roboto-Regular.ttf', { family: 'Roboto' })
    registerFont(ASSETS_SRC + '/fonts/Roboto-Thin.ttf', { family: 'Roboto Thin' })
    registerFont(ASSETS_SRC + '/fonts/RobotoMono-Bold.ttf', { family: 'RobotoMono', weight: 'bold' })
    registerFont(ASSETS_SRC + '/fonts/RobotoMono-Light.ttf', { family: 'RobotoMono-Light' })
    registerFont(ASSETS_SRC + '/fonts/RobotoMono-Medium.ttf', { family: 'RobotoMono-Medium' })
    registerFont(ASSETS_SRC + '/fonts/RobotoMono-Regular.ttf', { family: 'RobotoMono' })
    registerFont(ASSETS_SRC + '/fonts/RobotoMono-Thin.ttf', { family: 'RobotoMono-Thin' })
    registerFont(ASSETS_SRC + '/fonts/Wizardless.ttf', { family: 'Wizardless' })
    // ProductSans
    registerFont(ASSETS_SRC + '/fonts/ProductSans-Regular.ttf', { family: 'ProductSans' })
    registerFont(ASSETS_SRC + '/fonts/ProductSans-Bold.ttf', { family: 'ProductSans', weight: 'bold' })
    // Montserrat
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Black.ttf', { family: 'Montserrat', weight: 'black' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-BlackItalic.ttf', { family: 'Montserrat', weight: 'black', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Bold.ttf', { family: 'Montserrat', weight: 'bold' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-BoldItalic.ttf', { family: 'Montserrat', weight: 'bold', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-ExtraBold.ttf', { family: 'Montserrat', weight: 'extrabold' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-ExtraBoldItalic.ttf', { family: 'Montserrat', weight: 'extrabold', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Light.ttf', { family: 'Montserrat', weight: 'light' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-LightItalic.ttf', { family: 'Montserrat', weight: 'light', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Medium.ttf', { family: 'Montserrat', weight: 'medium' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-MediumItalic.ttf', { family: 'Montserrat', weight: 'medium', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Regular.ttf', { family: 'Montserrat', weight: 'regular' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Italic.ttf', { family: 'Montserrat', weight: 'regular', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-SemiBold.ttf', { family: 'Montserrat', weight: 'semibold' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-SemiBoldItalic.ttf', { family: 'Montserrat', weight: 'semibold', style: 'italic' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-Thin.ttf', { family: 'Montserrat', weight: 'thin' })
    registerFont(ASSETS_SRC + '/fonts/Montserrat-ThinItalic.ttf', { family: 'Montserrat', weight: 'thin', style: 'italic' })
  }
}
