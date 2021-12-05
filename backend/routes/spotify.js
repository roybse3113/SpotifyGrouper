const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node')

const router = express.Router()

const Group = require('../models/group')
const User = require('../models/user')
const Song = require('../models/song')

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
  res.redirect(spotifyApi.createAuthorizeURL(scopes))
})

router.get('/callback', async (req, res) => {
  const { error, code, state } = req.query

  if (error) {
    res.send(`Callback Error: ${error}`)
    return
  }

  await spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const { access_token, refresh_token, expires_in } = data.body

      spotifyApi.setAccessToken(access_token)
      spotifyApi.setRefreshToken(refresh_token)

      setInterval(async () => {
        const refresh_data = await spotifyApi.refreshAccessToken()
        const { refresh_access_token } = refresh_data.body

        spotifyApi.setAccessToken(refresh_access_token)
      }, (expires_in / 2) * 1000)
    })
    .catch(err => {
      res.send(`Error getting Tokens: ${err}`)
    })

  res.redirect('/')
})

router.get('/about', async (req, res, next) => {
  try {
    const userInfo = await spotifyApi.getMe()
    if (userInfo) {
      res.send(userInfo)
      // console.log(userInfo)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/playlists', async (req, res, next) => {
  try {
    const playlists = await spotifyApi.getUserPlaylists()
    if (playlists) {
      res.send(playlists)
      // console.log(playlists)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/topArtists', async (req, res, next) => {
  try {
    const artists = await spotifyApi.getMyTopArtists()
    // console.log('top artists', artists)
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
    // console.log('top tracks', tracks)
    const list = []
    if (tracks) {
      tracks.body.items.forEach(ele => {
        list.push({ name: ele.name, id: ele.id })
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
    const artistList = []
    if (artists) {
      artists.body.artists.items.forEach(ele => {
        list.push(ele.id)
        artistList.push({ name: ele.name, id: ele.id })
      })
      req.session.followedArtists = list
      res.send(req.session.followedArtists)
      const { id, followedArtists } = req.session
      await User.updateOne({ _id: id }, { followedArtists })
      await User.updateOne({ _id: id }, { artistList })
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
  const { groupID } = req.body
  // const groupID = '61a026d7ea91ed50bf706ad4'
  const list = []
  try {
    const playlist = await spotifyApi.createPlaylist('Popular Songs Playlist')
    const { id } = playlist.body
    const group = await Group.findById({ _id: groupID })
    group.artists.forEach(async artist => {
      const songsList = await spotifyApi.getArtistTopTracks(artist.id, 'US')
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
  const { groupID } = req.body
  // const groupID = '61a026d7ea91ed50bf706ad4'
  const list = []
  try {
    const playlist = await spotifyApi.createPlaylist(
      'Most Played Tracks Playlist',
    )
    const { id } = playlist.body

    const group = await Group.findById({ _id: groupID })

    group.mostPlayed.forEach(song => {
      list.push(`spotify:track:${song.id}`)
    })

    await spotifyApi.addTracksToPlaylist(id, list)
    res.send('created playlist')
  } catch (err) {
    next(err)
  }
})

// given group ID, top recommended playlist
router.post('/makeRecommendedPlaylist', async (req, res, next) => {
  const { groupID } = req.body
  const list = []
  try {
    const playlist = await spotifyApi.createPlaylist('Recommended Playlist')
    const { id } = playlist.body

    const group = await Group.findById({ _id: groupID })

    const seed_artists = []
    group.artists.forEach(artist => seed_artists.push(artist.id))
    const recommendedList = await spotifyApi.getRecommendations({
      min_energy: 0.4,
      seed_artists,
      min_popularity: 50,
    })

    recommendedList.body.tracks.forEach(track => {
      list.push(`spotify:track:${track.id}`)
    })
    await spotifyApi.addTracksToPlaylist(id, list)
    res.send('created playlist')
  } catch (err) {
    next(err)
  }
})

router.post('/search', async (req, res, next) => {
  const { track, artist } = req.body
  try {
    // check if user is in group
    const songs = await spotifyApi.searchTracks(
      `track: ${track} artist: ${artist}`,
    )
    const list = []
    if (songs.body.tracks.items.length !== 0) {
      songs.body.tracks.items.forEach(song => {
        const songArtists = []
        song.artists.forEach(a => songArtists.push(a.name))
        // const curr = await Song.create({
        //   id: song.id,
        //   name: song.name,
        //   artists: songArtists,
        // })
        const curr = {
          id: song.id,
          name: song.name,
          numVotes: 0,
          upvoters: [],
          downvoters: [],
          artists: songArtists,
        }
        list.push(curr)
      })
      res.send(list)
    } else {
      res.send('no results found')
    }
  } catch (err) {
    next(err)
  }
})

// given group ID, recommend to the community playlist
router.post('/recommendSong', async (req, res, next) => {
  const userId = req.session.id
  const { songName, songID, groupID } = req.body
  // const groupID = '61a026d7ea91ed50bf706ad4'
  try {
    // check if user is in group
    const user = await User.findById({ _id: userId })
    // console.log(user)
    let inGroup = false
    user.groups.forEach(g => {
      // console.log(g, groupID)
      if (g === groupID) inGroup = true
    })

    if (inGroup) {
      // const newSong = await Song.create({
      //   id: songID,
      //   name: songName,
      // })
      const newSong = {
        id: songID,
        name: songName,
        numVotes: 0,
        upvoters: [],
        downvoters: [],
        artists: [],
      }
      const group = await Group.findById({ _id: groupID })
      let duplicate = false
      group.recommendedSongs.forEach(curr => {
        if (curr.id === songID) duplicate = true
      })
      if (!duplicate) {
        const recommendedSongs = [...group.recommendedSongs, newSong]
        await Group.updateOne({ _id: groupID }, { recommendedSongs })
        res.send('recommended to group')
      } else {
        res.send('song is already recommended')
      }
    } else {
      res.send('not in group')
    }
  } catch (err) {
    next(err)
  }
})

// add the community playlist as a playlist
router.post('/useCommunityPlaylist', async (req, res, next) => {
  const { groupID } = req.body
  try {
    const group = await Group.findById({ _id: groupID })

    if (group.communityPlaylist.length > 0) {
      const playlist = await spotifyApi.createPlaylist('Community Playlist')
      const { id } = playlist.body

      const list = []
      group.communityPlaylist.forEach(song => {
        list.push(`spotify:track:${song.id}`)
      })

      await spotifyApi.addTracksToPlaylist(id, list)
      res.send('created playlist')
    } else {
      res.send('empty list')
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
