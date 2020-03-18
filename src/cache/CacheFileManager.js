const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const chalk = require('chalk')

const readFileAsync = promisify(fs.readFile)
const statAsync = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)

module.exports = class CacheFileManager {
  static async loadCacheJSONFile (fileName) {
    const pathName = path.resolve(__dirname, '..', '..', 'cache', fileName)
    const data = await readFileAsync(pathName, { encoding: 'utf8' })
    return JSON.parse(data)
  }

  static async saveImageFromBuffer (filePath, buffer) {
    if (!filePath) throw new Error('Invalid file path on cache image saving')
    try {
      writeFile(filePath, buffer)
      console.log(chalk.green(' CACHE SAVED ') + 'Cache saved at ' + filePath)
    } catch (e) {
      console.log(chalk.red(' CACHE SAVE ERROR ' + 'Error while saving cache to ' + filePath))
    }
  }

  static async getFileSize (fileName) {
    const pathName = path.resolve(__dirname, '..', '..', 'cache', fileName)
    const { size } = await statAsync(pathName)
    return size
  }
}
