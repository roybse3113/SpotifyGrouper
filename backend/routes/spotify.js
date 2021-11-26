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

router.get('/about', async (req, res, next) => {
  try {
    const userInfo = await spotifyApi.getMe()
    if (userInfo) {
      res.send(userInfo)
      console.log(userInfo)
    }
  } catch (err) {
    console.log(err)
    // next(err)
  }
})

router.get('/playlists', async (req, res, next) => {
  try {
    const playlists = await spotifyApi.getUserPlaylists()
    if (playlists) {
      res.send(playlists)
      console.log(playlists)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/topArtists', async (req, res, next) => {
  try {
    const artists = await spotifyApi.getMyTopArtists()
    console.log('top artists', artists)
    const list = []
    if (artists) {
      artists.body.items.forEach(ele => {
        list.push(ele.id)
      })
      req.session.topArtists = list
      res.send(list)
      const { id, topArtists } = req.session
      await User.updateOne({ _id: id }, { topArtists })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/topTracks', async (req, res, next) => {
  try {
    const tracks = await spotifyApi.getMyTopTracks()
    console.log('top tracks', tracks)
    const list = []
    if (tracks) {
      tracks.body.items.forEach(ele => {
        list.push(ele.id)
      })
      req.session.topTracks = list
      res.send(list)
      const { id, topTracks } = req.session
      await User.updateOne({ _id: id }, { topTracks })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/followedArtists', async (req, res, next) => {
  try {
    const artists = await spotifyApi.getFollowedArtists()
    const list = []
    if (artists) {
      artists.body.artists.items.forEach(ele => {
        list.push(ele.id)
      })
      req.session.followedArtists = list
      res.send(req.session.followedArtists)
      const { id, followedArtists } = req.session
      await User.updateOne({ _id: id }, { followedArtists })
    }
  } catch (err) {
    next(err)
  }
})

router.get('/devices', async (req, res, next) => {
  try {
    const devices = await spotifyApi.getMyDevices()
    const list = []
    if (devices) {
      res.send(devices)
    }
  } catch (err) {
    next(err)
  }
})

// given group ID, popular playlist
router.post('/makePopularPlaylist', async (req, res, next) => {
  const groupID = '61a026d7ea91ed50bf706ad4'
  const list = []
  try {
    const playlist = await spotifyApi.createPlaylist('Popular Songs Playlist')
    const { id } = playlist.body
    const group = await Group.findById({ _id: groupID })
    group.artists.forEach(async artist => {
      const songsList = await spotifyApi.getArtistTopTracks(artist, 'US')
      const songs = songsList.body.tracks
      for (let i = 0; i < 5; i++) {
        list.push(`spotify:track:${songs[i].id}`)
      }

      if (list.length === 5 * group.artists.length) {
        await spotifyApi.addTracksToPlaylist(id, list)
      }
    })
    res.send('created playlist')
  } catch (err) {
    next(err)
  }
})

// make playlists to introduce you to new genres of music from people in the same group

// given group ID, top tracks playlist
router.post('/makeMostPlayedPlaylist', async (req, res, next) => {
  const groupID = '61a026d7ea91ed50bf706ad4'
  const list = []
  try {
    const playlist = await spotifyApi.createPlaylist('Top Tracks Playlist')
    const { id } = playlist.body

    const userID = req.session.id
    const user = await User.findById({ _id: userID })
    console.log('user', user)
    const userTopTracks = user.topTracks
    console.log('user top tracks', userTopTracks)

    const group = await Group.findById({ _id: groupID })
    group.members.forEach(member => {
      if (member !== user) {
        const { topTracks } = member
        console.log('curr top tracks', topTracks)
        topTracks.forEach(track => {
          if (!userTopTracks.includes(track)) {
            list.push(`spotify:track:${track}`)
          }
        })
      }
    })
    console.log('list', list)
    await spotifyApi.addTracksToPlaylist(id, list)
    res.send('created playlist')
  } catch (err) {
    next(err)
  }
})

// given group ID, community makes playlist
router.post('/makeCommunityPlaylist', async (req, res, next) => {
  const groupID = '61a026d7ea91ed50bf706ad4'
  const list = []
})

module.exports = router
