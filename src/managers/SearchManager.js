const fetch = require('node-fetch')
const chalk = require('chalk')

const spotifyArtistRegex = /^(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/artist\/([a-zA-Z\d-_]+)/
const spotifyAlbumRegex = /^(?:https?:\/\/|)?(?:www\.)?open\.spotify\.com\/album\/([a-zA-Z\d-_]+)/

module.exports = class SearchManager {
  constructor (musicorum) {
    this.musicorum = musicorum
  }

  async searchArtistFromSpotify (artistName) {
    const query = encodeURIComponent(artistName)
    try {
      // console.log('REQUESTING TO SPOTIFY')
      console.log('Searching for artist ' + chalk.greenBright(artistName))
      const spotifyArtist = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=artist&q="${query}"`)
      if (!spotifyArtist.artists.items) throw new Error('Artist not found')
      const found = spotifyArtist.artists.items
        .filter(a => a.images.length)
        .find(a => a.name.toLowerCase() === artistName.toLowerCase())
      const spotifyObject = found || spotifyArtist.artists.items[0]

      if (!spotifyObject) throw new Error('Artist not found.')
      if (!spotifyObject.images.length) throw new Error('No images for the artist ' + chalk.red(spotifyObject.name) + ' from query ' + chalk.red(artistName))

      return {
        name: spotifyObject.name,
        image: spotifyObject.images[1].url,
        spotify: spotifyObject.id,
        imageID: `a_S${spotifyObject.id}`
      }
    } catch (e) {
      console.log(e)
    }
  }

  async searchAlbumFromSpotify (albumName, artistName) {
    const query = `${encodeURIComponent(albumName)}%20artist:${encodeURIComponent(artistName)}`
    const spotifyAlbum = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=album&q=${query}`)
    const spotifyObject = spotifyAlbum.albums.items[0]

    return {
      name: spotifyObject.name,
      artist: spotifyObject.artists[0].name,
      image: spotifyObject.images[1].url,
      spotify: spotifyObject.id,
      imageID: `r_S${spotifyObject.id}`
    }
  }

  async searchTrackFromSpotify (trackName, artistName) {
    const query = `${encodeURIComponent(trackName)}%20artist:${encodeURIComponent(artistName)}`
    const spotifyAlbum = await this.musicorum.spotify.request(`https://api.spotify.com/v1/search?type=track&q=${query}`)
    const spotifyObject = spotifyAlbum.tracks.items[0]

    if (!spotifyObject) throw new Error('Track not found.')

    return {
      name: spotifyObject.name,
      artist: spotifyObject.artists[0].name,
      image: spotifyObject.album.images[1].url,
      spotify: spotifyObject.id,
      imageID: `T_S${spotifyObject.id}`
    }
  }

  async getSpotifyIdFromArtistMBID (artistName, mbid, fallbackToSpotify = true) {
    if (!mbid && fallbackToSpotify) return this.searchArtistFromSpotify(artistName).then((album) => album.spotify)

    const { relations } = await fetch(`http://musicbrainz.org/ws/2/artist/${mbid}?fmt=json&inc=url-rels`).then(r => r.json())
    const spotifyURL = relations.map(i => i.url.resource).find(u => spotifyArtistRegex.test(u))
    return spotifyArtistRegex.exec(spotifyURL)[1]
  }

  async getSpotifyIdFromAlbumMBID (albumName, artistName, mbid, fallbackToSpotify = true) {
    if (!mbid && fallbackToSpotify) return this.searchAlbumFromSpotify(albumName, artistName).then((album) => album.spotify)

    const { relations } = await fetch(`http://musicbrainz.org/ws/2/release/${mbid}?fmt=json&inc=url-rels`).then(r => r.json())
    const spotifyURL = relations.map(i => i.url.resource).find(u => spotifyAlbumRegex.test(u))

    if (!spotifyURL && fallbackToSpotify) return this.searchAlbumFromSpotify(albumName, artistName).then((album) => album.spotify)

    return spotifyAlbumRegex.exec(spotifyURL)[1]
  }
}
