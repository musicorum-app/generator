import { handleURL } from '../utils'
import fetch from 'node-fetch'

export default class Worker {
  constructor (url, {
    name,
    engine,
    scheme,
    themes,
    version
  }) {
    this.url = url

    this.name = name
    this.engine = engine
    this.scheme = scheme
    this.themes = themes
    this.version = version
  }

  async generate (theme, payload) {
    return fetch(this.url + 'generate', {
      method: 'POST',
      headers: {
        'content-type': 'application.json'
      },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
  }
}
