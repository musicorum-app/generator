const fs = require('fs')
const { promisify } = require('util')

module.exports = class MiscUtils {

}

module.exports.readdir = promisify(fs.readdir)
module.exports.readFile = promisify(fs.readFile)
