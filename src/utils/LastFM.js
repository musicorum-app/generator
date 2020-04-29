const fetch = require('node-fetch')
const chalk = require('chalk')

const REGEX = /\/([0-9sx]+)\//g

module.exports = class LastFM {
  constructor (musicorum, apiKey) {
    this.musicorum = musicorum
    this.apiKey = apiKey
    this.cache = {
      artists: [],
      albums: [],
      tracks: []
    }
  }

  async getUserTop (user, top, period, limit) {
    const params = { user, period, limit }
    return this.request('user.gettop' + top, params)
  }

  async getRecentTracks (user, from, to, extended, limit = 50) {
    extended = extended ? 1 : 0
    return this.request('user.getRecentTracks', { user, from, to, extended, limit })
  }

  async getList (user, top, period, limit) {
    const topList = await this.getUserTop(user, top, period, limit)
    let list = topList.topalbums || topList.topartists || topList.toptracks
    list = list.album || list.track || list.artist
    return list
  }

  async getUserInfo (user) {
    return this.request('user.getInfo', { user })
  }

  async getAlbumInfo (album, artist, autocorrect) {
    return this.request('album.getInfo', { album, artist, autocorrect: autocorrect ? 1 : 0 })
  }

  async getTotalScrobblesFromTimestamp (user, from, to) {
    const { recenttracks } = await this.getRecentTracks(user, from, to, false, 1)
    if (!recenttracks) return 0
    return recenttracks['@attr'].total
  }

  async getTotalScrobbles (user, period) {
    if (period === 'overall') {
      const playcount = await this.getUserInfo(user).then(u => u.user.playcount)
      return playcount
    }

    const seconds = {
      '7day': 604800,
      '1month': 2592000,
      '3month': 7776000,
      '6month': 15552000,
      '12month': 31536000
    }

    const now = Math.floor(new Date().getTime() / 1000)
    return this.getTotalScrobblesFromTimestamp(user, now - seconds[period], now)
  }

  async request (method, params) {
    const urlParams = new URLSearchParams(params)
    return fetch(`http://ws.audioscrobbler.com/2.0/?method=${method}&api_key=${this.apiKey}&format=json&${urlParams.toString()}`).then(r => r.json())
  }

  static getBestImage (images, size) {
    let url = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
    if (images) {
      if (images[0]) {
        url = images[0]['#text']
      }
    }
    return url.replace(REGEX, `/${size}x${size}/`)
  }

  async getImageURLFromSpotify ([item], type) {
    const imageFromCache = await this.getDataCache(item, type)

    if (imageFromCache) return imageFromCache.image

    let query = encodeURIComponent(item.name)
    if (type === 'tracks') {
      query = `${encodeURIComponent(item.name)}%20artist:${encodeURIComponent(item.artist.name)}`
    }
    if (type === 'albums') {
      query = `${encodeURIComponent(item.name)}%20artist:${encodeURIComponent(item.artist.name)}`
    }
    console.log(chalk.green(' REQUESTING TO SPOTIFY ') + `query: ${query}`)
    const search = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=${type.slice(0, -1)}&q=${query}`)
    // const search = await musicorum.spotify.request({ type: , query })
    const results = search.tracks || search.artists || search.albums
    if (!results || results.items.length === 0) {
      this.saveCacheData(item, type, 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png')
      return 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
    }
    const res = (results.items[0].album || results.items[0])
    if (!res.images.length) {
      this.saveCacheData(item, type, 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png')
      return 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
    }

    if (!res.images[1].url) {
      this.saveCacheData(item, type, 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png')
      return 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
    }

    this.saveCacheData(item, type, res.images[1].url)
    return res.images[1].url
  }

  async saveCacheData (item, type, image) {
    const obj = {
      name: item.name,
      image
    }
    if (type === 'tracks' || type === 'albums') obj.artist = item.artist.name

    this.cache[type].push(obj)
  }

  async getDataCache (item, type) {
    let list = this.cache[type]

    list = list.filter(i => i.name === item.name)
    if (type === 'tracks' || type === 'albums') list = list.filter(i => i.artist === item.artist.name)

    return !list.length ? null : list[0]
  }
}
