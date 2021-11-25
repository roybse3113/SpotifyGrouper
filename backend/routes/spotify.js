const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node')

const router = express.Router()

const Group = require('../models/group')
const User = require('../models/user')

const isAuthenticated = require('../middlewares/isAuthenticated')

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify',
]

const spotifyApi = new SpotifyWebApi({
  redirectUri: 'http://localhost:3000/spotify/callback',
  clientId: '12f646865f7041a18173f24f4b9f153d',
  clientSecret: 'c78b8e3c43bc45a0a3e7c20dae01a572',
})

// First retrieve an access token

router.get('/login', async (req, res) => {
  console.log(req.session.username)
  res.redirect(spotifyApi.createAuthorizeURL(scopes))
})

router.get('/callback', async (req, res) => {
  const { error, code, state } = req.query

  if (error) {
    console.error('Callback Error:', error)
    res.send(`Callback Error: ${error}`)
    return
  }

  await spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const { access_token, refresh_token, expires_in } = data.body

      spotifyApi.setAccessToken(access_token)
      spotifyApi.setRefreshToken(refresh_token)

      console.log('access_token:', access_token)
      console.log('refresh_token:', refresh_token)

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      )

      res.send(`signed in`)

      setInterval(async () => {
        const refresh_data = await spotifyApi.refreshAccessToken()
        const { refresh_access_token } = refresh_data.body

        console.log('The access token has been refreshed!')
        console.log('access_token:', refresh_access_token)

        spotifyApi.setAccessToken(refresh_access_token)
      }, (expires_in / 2) * 1000)
    })
    .catch(err => {
      console.error('Error getting Tokens:', err)
      res.send(`Error getting Tokens: ${err}`)
    })
})

router.get('/about', async (req, res) => {
  try {
    const userInfo = await spotifyApi.getMe()
    if (userInfo) {
      res.send(userInfo)
      console.log(userInfo)
    }
  } catch (err) {
    console.log('error')
  }
})

router.get('/playlists', async (req, res) => {
  try {
    const playlists = await spotifyApi.getUserPlaylists()
    if (playlists) {
      res.send(playlists)
      console.log(playlists)
    }
  } catch (err) {
    console.log('error')
  }
})

router.get('/topArtists', async (req, res) => {
  try {
    const artists = await spotifyApi.getMyTopArtists()
    const list = []
    if (artists) {
      artists.body.items.forEach(ele => {
        list.push(ele.name)
      })
      req.session.topArtists = list
      res.send(list)
      const { id, topArtists } = req.session
      await User.updateOne({ _id: id }, { topArtists })
    }
  } catch (err) {
    console.log('error')
  }
})

router.get('/topTracks', async (req, res) => {
  try {
    const tracks = await spotifyApi.getMyTopTracks()
    const list = []
    if (tracks) {
      tracks.body.items.forEach(ele => {
        list.push(ele.name)
      })
      req.session.topTracks = list
      res.send(list)
      const { id, topTracks } = req.session
      await User.updateOne({ _id: id }, { topTracks })
    }
  } catch (err) {
    console.log('error')
  }
})

router.get('/followedArtists', async (req, res) => {
  try {
    const artists = await spotifyApi.getFollowedArtists()
    const list = []
    if (artists) {
      artists.body.artists.items.forEach(ele => {
        list.push(ele.name)
      })
      req.session.followedArtists = list
      res.send(req.session.followedArtists)
      const { id, followedArtists } = req.session
      await User.updateOne({ _id: id }, { followedArtists })
    }
  } catch (err) {
    console.log('error')
  }
})

module.exports = router
