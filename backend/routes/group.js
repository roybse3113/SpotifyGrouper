const express = require('express')

const router = express.Router()
const User = require('../models/user')
const Group = require('../models/group')
const isAuthenticated = require('../middlewares/isAuthenticated')

// filter system for groups (i.e. age, songs, genres, etc)

// give options for ways in which users could be grouped?
// by shared followed artists, top artists, top tracks, etc
// by top tracks/artists (probably the most realistic), not everyone follows their top artists
router.get('/match', async (req, res, next) => {
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
router.get('/join', async (req, res, next) => {
  const id = '61a033dd77d30f274c9ebaa9'
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
router.get('/leave', async (req, res, next) => {
  const id = '61a033dd77d30f274c9ebaa9'
  const userID = req.session.id
  try {
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
