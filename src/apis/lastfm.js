import LastFm from 'lastfm-node-client'
import { defaultAlbumImage, defaultArtistImage, defaultTrackImage, defaultUserImage } from '../constants'
import HTTPErrorMessage from '../utils/HTTPErrorMessage'
import messages from '../messages'

const lastfm = new LastFm(process.env.LASTFM_KEY)

export default class LastfmAPI {
  constructor (ctx) {
    this.ctx = ctx
  }

  static async getAlbumsCharts (user, period, limit) {
    if (Array.isArray(period)) {
      const chart = await lastfm.userGetWeeklyAlbumChart({
        user,
        from: period[0],
        to: period[1]
      })
      const attr = chart.weeklyalbumchart['@attr']

      return {
        isFromWeekly: true,
        correctPeriod: parseInt(attr.from) === period[0] && parseInt(attr.to) === period[1],
        items: chart.weeklyalbumchart.album
          .slice(0, limit)
          .map(a => ({
            name: a.name,
            artist: a.artist['#text'],
            playcount: parseInt(a.playcount),
            image: defaultAlbumImage
          }))
      }
    } else {
      const res = await lastfm.userGetTopAlbums({
        user,
        limit,
        period: period.toLowerCase()
      })

      return {
        isFromWeekly: false,
        correctPeriod: true,
        attr: res.topalbums['@attr'],
        items: res.topalbums.album
          .slice(0, limit)
          .map(a => ({
            name: a.name,
            artist: a.artist.name,
            playcount: parseInt(a.playcount),
            image: a.image[3]['#text'] && a.image[3]['#text'] !== '' ? a.image[3]['#text'] : defaultAlbumImage
          }))
      }
    }
  }

  static async getArtistsCharts (user, period, limit) {
    if (Array.isArray(period)) {
      const chart = await lastfm.userGetWeeklyArtistChart({
        user,
        from: period[0],
        to: period[1]
      })
      const attr = chart.weeklyartistchart['@attr']

      return {
        isFromWeekly: true,
        correctPeriod: parseInt(attr.from) === period[0] && parseInt(attr.to) === period[1],
        items: chart.weeklyartistchart.artist
          .slice(0, limit)
          .map(a => ({
            name: a.name,
            playcount: parseInt(a.playcount),
            image: defaultArtistImage
          }))
      }
    } else {
      return {
        isFromWeekly: false,
        correctPeriod: true,
        items: await lastfm.userGetTopArtists({
          user,
          limit,
          period: period.toLowerCase()
        })
          .then(r => r.topartists.artist
            .slice(0, limit)
            .map(a => ({
              name: a.name,
              playcount: parseInt(a.playcount),
              image: defaultArtistImage
            }))
          )
      }
    }
  }

  static async getTracksCharts (user, period, limit) {
    if (Array.isArray(period)) {
      const chart = await lastfm.userGetWeeklyTrackChart({
        user,
        from: period[0],
        to: period[1]
      })
      const attr = chart.weeklytrackchart['@attr']

      return {
        isFromWeekly: true,
        correctPeriod: parseInt(attr.from) === period[0] && parseInt(attr.to) === period[1],
        items: chart.weeklytrackchart.track
          .slice(0, limit)
          .map(a => ({
            name: a.name,
            artist: a.artist['#text'],
            playcount: parseInt(a.playcount),
            image: defaultTrackImage
          }))
      }
    } else {
      return {
        isFromWeekly: false,
        correctPeriod: true,
        items: await lastfm.userGetTopTracks({
          user,
          limit,
          period: period.toLowerCase()
        })
          .then(r => r.toptracks.track
            .slice(0, limit)
            .map(a => ({
              name: a.name,
              artist: a.artist.name,
              playcount: parseInt(a.playcount),
              image: defaultTrackImage
            }))
          )
      }
    }
  }

  static async getUserInfo (user) {
    return lastfm.userGetInfo({ user }).then(r => r.user)
  }

  static async getTotalScrobblesFromTimestamp (user, from, to) {
    const { recenttracks } = await lastfm.userGetRecentTracks({
      user,
      from,
      to,
      limit: 1
    })
    return parseInt(recenttracks['@attr'].total)
  }

  async getCachedUserInfo (username) {
    const cache = await this.ctx.redis.getLastfmUserCache(username)
    if (cache && cache !== {} && !!cache.name) return cache

    try {
      const _user = await LastfmAPI.getUserInfo(username)
      const user = {
        username: _user.name,
        name: _user.realname,
        scrobbles: _user.playcount,
        image: _user.image[3]['#text'] || defaultUserImage
      }

      this.ctx.redis.setLastfmUserCache(username, user)
      return user
    } catch (e) {
      if (e.message === 'User not found') {
        throw new HTTPErrorMessage(messages.USER_NOT_FOUND)
      } else {
        throw e
      }
    }
  }

  async getTotalScrobbles (user, period) {
    if (period === 'OVERALL') {
      return parseInt((await this.getCachedUserInfo(user)).scrobbles)
    }

    if (Array.isArray(period)) {
      return LastfmAPI.getTotalScrobblesFromTimestamp(user, ...period)
    }

    const seconds = {
      '7DAY': 604800,
      '1MONTH': 2592000,
      '3MONTH': 7776000,
      '6MONTH': 15552000,
      '12MONTH': 31536000
    }

    const now = ~~(new Date().getTime() / 1000)
    return LastfmAPI.getTotalScrobblesFromTimestamp(user, now - seconds[period], now)
  }
}
