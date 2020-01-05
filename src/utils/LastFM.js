const fetch = require('node-fetch')

const REGEX = /\/([0-9sx]+)\//g

module.exports = class LastFM {
  constructor (musicorum, apiKey) {
    this.musicorum = musicorum
    this.apiKey = apiKey
  }

  async getUserTop (user, top, period, limit) {
    const params = { user, period, limit }
    return this.request('user.gettop' + top, params)
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

  async getTotalScrobbles (user, top, period) {
    if (period === 'overall') {
      const playcount = await this.getUserInfo(user).then(u => u.user.playcount)
      return { precise: true, playcount }
    }

    const topList = await this.getUserTop(user, top, period, period === '12month' ? 500 : 300)
    const list = topList.topalbums || topList.topartists || topList.toptracks
    let playcount = (list.album || list.track || list.artist)
      .map(i => i.playcount)
      .reduce((a, b) => Number(a) + Number(b))
    const precise = list['@attr'].totalPages === '1'
    if (!precise) {
      playcount += Number(list['@attr'].total) - Number(list['@attr'].perPage)
    }
    return { precise, playcount }
  }

  async request (method, params) {
    const urlParams = new URLSearchParams(params)
    return fetch(`http://ws.audioscrobbler.com/2.0/?method=${method}&api_key=${this.apiKey}&format=json&${urlParams.toString()}`).then(r => r.json())
  }

  static getBestImage (images, size) {
    return images[0]['#text'].replace(REGEX, `/${size}x${size}/`)
  }

  async getImageURLFromSpotify ([item], type) {
    let query = item.name
    if (type === 'tracks') {
      query = `${encodeURIComponent(item.name)}%20artist:${encodeURIComponent(item.artist.name)}`
    }
    const search = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=${type}&q=${query}`)
    // const search = await musicorum.spotify.request({ type: , query })
    const results = search.tracks || search.artists || search.albums
    if (!results || results.items.length === 0) {
      return 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
    }
    const res = (results.items[0].album || results.items[0])
    if (!res.images.length) {
      return 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png'
    }
    return res.images[1].url
  }
}
