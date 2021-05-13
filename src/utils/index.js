import {
  readFileSync
} from 'fs'
import YAML from 'yaml'
import * as path from 'path'

export function handleURL (url) {
  return url.endsWith('/') ? url : url + '/'
}

export function loadConfiguration () {
  const file = readFileSync(path.resolve(__dirname, '..', '..', 'config.yaml'), 'utf8')
  return YAML.parse(file)
}
