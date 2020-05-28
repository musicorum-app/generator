const { promisify } = require('util')
const { loadImage } = require('canvas')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const Constants = require('../utils/Constants.js')

const readFileAsync = promisify(fs.readFile)
const statAsync = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)

module.exports = class CacheFileManager {
  constructor (musicorum) {
    this.musicorum = musicorum
  }

  static async loadCacheJSONFile (fileName) {
    const pathName = path.resolve(__dirname, '..', '..', 'cache', fileName)
    const data = await readFileAsync(pathName, { encoding: 'utf8' })
    return JSON.parse(data)
  }

  static async saveImageFromBuffer (filePath, buffer) {
    if (!filePath) throw new Error('Invalid file path on cache image saving')
    try {
      await writeFile(filePath, buffer)
      console.log(chalk.green(' CACHE SAVED ') + 'Cache saved at ' + filePath)
    } catch (e) {
      console.error(e)
      console.log(chalk.red(' CACHE SAVE ERROR ' + 'Error while saving cache to ' + filePath))
    }
  }

  static async saveJSONFile (filePath, json) {
    if (typeof json !== 'string') json = JSON.stringify(json)
    if (!filePath) throw new Error('Invalid file path on cache image saving')
    try {
      await writeFile(filePath, json)
      console.log(chalk.green(' JSON SAVED ') + 'Cache saved at ' + filePath)
    } catch (e) {
      console.error(e)
      console.log(chalk.red(' JSON SAVE ERROR ' + 'Error while saving cache to ' + filePath))
    }
  }

  static async getFileSize (fileName) {
    const pathName = path.resolve(__dirname, '..', '..', 'cache', fileName)
    const { size } = await statAsync(pathName)
    return size
  }

  async getImageFromCache (fileName, fallbackUrl) {
    if (!fallbackUrl) throw new Error('Missing image url while fallbacking to url')
    const pathName = path.resolve(Constants.CACHE_IMAGE_PATH, fileName)
    return loadImage(pathName)
      .then(i => i)
      .catch(async () => {
        console.log(chalk.yellow(' CACHE FILE MANAGER ') + ' downloading from ' + fallbackUrl)
        const fn = () => fetch(fallbackUrl).then(r => r.buffer())
        const buffer = await this.musicorum.requestQueue.request('IMAGE', fn)
        CacheFileManager.saveImageFromBuffer(pathName, buffer)
        return loadImage(buffer)
      })
  }
}
