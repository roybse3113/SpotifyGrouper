const express = require('express')

const router = express.Router()
const User = require('../models/user')
const Group = require('../models/group')
const Song = require('../models/song')
const isAuthenticated = require('../middlewares/isAuthenticated')

// filter system for groups (i.e. age, songs, genres, etc)

// give options for ways in which users could be grouped?
// by shared followed artists, top artists, top tracks, etc
// by top tracks/artists (probably the most realistic), not everyone follows their top artists
router.post('/match', async (req, res, next) => {
  try {
    const users = await User.find()
    const list = []

    if (!users) {
      next(new Error('no users'))
    }

    const artists = []
    users.forEach(user1 => {
      users.forEach(user2 => {
        if (user2 !== user1) {
          // compare current user with all other users
          const map = new Map()
          let cnt = 0
          user1.followedArtists.forEach(artist => {
            map.set(artist, 1)
          })
          user2.followedArtists.forEach(artist => {
            if (map.has(artist)) {
              map.set(artist, map.get(artist) - 1)
            }
          })
          map.forEach((val, key) => {
            if (val === 0) {
              cnt++
              if (!artists.includes(key)) artists.push(key)
            }
          })

          if (cnt >= 3) {
            if (!list.includes(user1)) list.push(user1)
            if (!list.includes(user2)) list.push(user2)
          }
        }
      })
    })
    if (list.length > 0) {
      const group = await Group.create({ members: list })
      const id = group._id.toString()
      await Group.updateOne({ _id: id }, { artists })

      const updatedUsers = []

      // add new group to each user
      list.forEach(async member => {
        const groups = [...member.groups, id]
        await User.updateOne({ _id: member._id.toString() }, { groups })
        const currUser = await User.findById({ _id: member._id.toString() })
        updatedUsers.push(currUser)

        // update the group containing the users
        if (updatedUsers.length === list.length) {
          await Group.updateOne({ _id: id }, { members: updatedUsers })
        }
      })

      // for keeping track of most played songs in group

      let mapTracks = new Map()
      users.forEach(user => {
        const { topTracks } = user
        topTracks.forEach(track => {
          if (mapTracks.has(track)) {
            mapTracks.set(track, mapTracks.get(track) + 1)
          } else {
            mapTracks.set(track, 1)
          }
        })
      })
      const mostPlayed = []
      mapTracks = new Map(
        [...mapTracks.entries()].sort(
          (a, b) => mapTracks.get(b) - mapTracks.get(a)
        )
      )
      await Group.updateOne({ _id: id }, { mapTracks })
      mapTracks.forEach((val, key) => {
        mostPlayed.push(key)
      })
      await Group.updateOne({ _id: id }, { mostPlayed })

      // ------------

      res.send('group created')
    } else {
      next(new Error('not enough shared artists'))
    }
  } catch (err) {
    next(err)
  }
})

// assuming access to the group ID
router.post('/join', isAuthenticated, async (req, res, next) => {
  const { id } = req.body
  // const id = '61a033dd77d30f274c9ebaa9'
  const userID = req.session.id
  try {
    const group = await Group.findById({ _id: id })
    let { mapTracks } = group
    const user = await User.findById({ _id: userID })
    const members = [...group.members, user]

    // update the most played tracks including new user
    user.topTracks.forEach(track => {
      if (mapTracks.has(track)) {
        mapTracks.set(track, mapTracks.get(track) + 1)
      } else {
        mapTracks.set(track, 1)
      }
    })

    const mostPlayed = []
    mapTracks = new Map(
      [...mapTracks.entries()].sort(
        (a, b) => mapTracks.get(b) - mapTracks.get(a)
      )
    )
    await Group.updateOne({ _id: id }, { mapTracks })
    mapTracks.forEach((val, key) => {
      mostPlayed.push(key)
    })
    await Group.updateOne({ _id: id }, { mostPlayed })
    // -------------------

    await Group.updateOne({ _id: id }, { members })
    res.send('joined group')
  } catch (err) {
    next(err)
  }
})

// assuming access to the group ID
router.post('/leave', isAuthenticated, async (req, res, next) => {
  const { id } = req.body
  // const id = '61a033dd77d30f274c9ebaa9'
  const userID = req.session.id
  try {
    // check that user is in the group
    // can only leave if already in group
    const currUser = await User.findById({ _id: userID })
    let inGroup = false
    currUser.groups.forEach(g => {
      if (g === id) inGroup = true
    })

    if (inGroup) {
      const group = await Group.findById({ _id: id })
      let { mapTracks } = group
      const user = await User.findById({ _id: userID })

      // update the most played tracks including new user
      user.topTracks.forEach(track => {
        if (mapTracks.has(track)) {
          mapTracks.set(track, mapTracks.get(track) - 1)
          if (mapTracks.get(track) === 0) {
            mapTracks.delete(track)
          }
        }
      })

      const mostPlayed = []
      mapTracks = new Map(
        [...mapTracks.entries()].sort(
          (a, b) => mapTracks.get(b) - mapTracks.get(a)
        )
      )
      await Group.updateOne({ _id: id }, { mapTracks })
      mapTracks.forEach((val, key) => {
        mostPlayed.push(key)
      })
      await Group.updateOne({ _id: id }, { mostPlayed })
      // -------------------

      const members = []
      group.members.forEach(member => {
        if (member._id.toString() !== userID) members.push(member)
      })
      await Group.updateOne({ _id: id }, { members })
      res.send('left group')
    } else {
      res.send('not in group')
    }
  } catch (err) {
    next(err)
  }
})

router.post('/upvoteSong', isAuthenticated, async (req, res, next) => {
  const userId = req.session.id
  const { groupId, songId } = req.body

  try {
    // check that user is in the group
    const user = await User.findById({ _id: userId })
    let inGroup = false
    user.groups.forEach(g => {
      if (g === groupId) inGroup = true
    })

    if (inGroup) {
      const group = await Group.findById({ _id: groupId })
      // group.recommendedSongs.forEach(async song => {
      //   if (song._id.toString() === songId) {
      //     await Song.updateOne({ _id: songId }, { $inc: { numVotes: 1 } })
      //   }
      // })
      // check that user did not already vote on this song
      const pre = await Song.findById({ _id: songId })
      if (!pre.voters.includes(userId)) {
        // add user to voter list to keep track
        const voters = [...pre.voters, userId]
        await Song.updateOne({ _id: songId }, { voters })
        // update the count
        await Song.updateOne({ _id: songId }, { $inc: { numVotes: 1 } })
        const recommendedSongs = []
        group.recommendedSongs.forEach(song => {
          if (song._id.toString() !== songId) recommendedSongs.push(song)
        })

        const currSong = await Song.findOne({ _id: songId })

        // if the song is upvoted by at least half the group, it is added
        // if added, remove or don't add song to/from recommended
        if (2 * currSong.numVotes >= group.members.length) {
          const communityPlaylist = [...group.communityPlaylist, currSong]
          await Group.updateOne({ _id: groupId }, { communityPlaylist })
        } else {
          recommendedSongs.push(currSong)
        }

        await Group.updateOne({ _id: groupId }, { recommendedSongs })
        // res.send(recommendedSongs)

        res.send('upvoted song')
      } else {
        res.send('already voted on this song')
      }
    } else {
      res.send('not in group')
    }
  } catch (err) {
    next(err)
  }
})

router.post('/downvoteSong', isAuthenticated, async (req, res, next) => {
  const userId = req.session.id
  const { groupId, songId } = req.body

  try {
    // check that user is in the group
    const user = await User.findById({ _id: userId })
    let inGroup = false
    user.groups.forEach(g => {
      if (g === groupId) inGroup = true
    })

    if (inGroup) {
      const group = await Group.findById({ _id: groupId })
      // group.recommendedSongs.forEach(async song => {
      //   if (song._id.toString() === songId) {
      //     await Song.updateOne({ _id: songId }, { $inc: { numVotes: 1 } })
      //   }
      // })
      // check that user did not already vote on this song
      const pre = await Song.findById({ _id: songId })
      if (!pre.voters.includes(userId)) {
        // add user to voter list to keep track
        const voters = [...pre.voters, userId]
        await Song.updateOne({ _id: songId }, { voters })
        // update the count
        await Song.updateOne({ _id: songId }, { $inc: { numVotes: -1 } })
        const recommendedSongs = []
        group.recommendedSongs.forEach(song => {
          if (song._id.toString() !== songId) recommendedSongs.push(song)
        })

        const currSong = await Song.findOne({ _id: songId })

        await Group.updateOne({ _id: groupId }, { recommendedSongs })
        // res.send(recommendedSongs)

        res.send('downvoted song')
      } else {
        res.send('already voted on this song')
      }
    } else {
      res.send('not in group')
    }
  } catch (err) {
    next(err)
  }
})

router.get('/groups', async (req, res, next) => {
  try {
    const groups = await Group.find()
    res.json(groups)
  } catch (err) {
    next(err)
  }
})

module.exports = router
