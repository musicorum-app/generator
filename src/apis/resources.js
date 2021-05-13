import { handleURL, loadConfiguration } from '../utils'
import fetch from 'node-fetch'

const config = loadConfiguration()
const url = handleURL(config.resource_url)

export default class ResourcesAPI {
  static getArtistsResources (artists) {
    return fetch(url + 'find/artists', {
      method: 'POST',
      body: JSON.stringify({ artists }),
      headers: {
        'content-type': 'application/json'
      }
    }).then(r => r.json())
  }

  static getTracksResources (tracks) {
    return fetch(url + 'find/tracks', {
      method: 'POST',
      body: JSON.stringify({ tracks }),
      headers: {
        'content-type': 'application/json'
      }
    }).then(r => r.json())
  }

  static getAlbumsResources (albums) {
    return fetch(url + 'find/albums', {
      method: 'POST',
      body: JSON.stringify({ albums }),
      headers: {
        'content-type': 'application/json'
      }
    }).then(r => r.json())
  }
}
