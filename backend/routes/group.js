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
    const usersToMatch = []
    const users = await User.find()
    users.forEach(user => {
      if (user.availability) usersToMatch.push(user)
    })

    // check that another group doesn't have the same exact people
    // >= 1 new person

    const allGroups = await Group.find()
    console.log('all groups', allGroups)
    let unique = true
    allGroups.forEach(group => {
      let diff = false
      if (group.members.length === usersToMatch.length) {
        const freq = new Map()
        group.members.forEach(member => {
          const memID = member._id.toString()
          console.log('id', memID)
          if (freq.has(memID)) {
            freq.set(memID, freq.get(memID) + 1)
          } else {
            freq.set(memID, 1)
          }
        })
        console.log('gorup members', freq)
        usersToMatch.forEach(member => {
          const memID = member._id.toString()
          if (freq.has(memID)) {
            freq.set(memID, freq.get(memID) - 1)
          }
        })
        console.log('userstoMtach', freq)
        freq.forEach((val, key) => {
          if (val !== 0) diff = true
        })
        console.log('diff', diff)
        console.log('freq', freq)
        if (!diff) unique = false
        console.log('unique', unique)
      }
    })

    if (unique) {
      usersToMatch.forEach(async user => {
        await User.updateOne({ _id: user._id }, { availability: false })
      })

      const list = []

      if (!users) {
        next(new Error('no users'))
      }

      const artists = []
      const artistObjects = []

      usersToMatch.forEach(user1 => {
        usersToMatch.forEach(user2 => {
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
                if (!artists.includes(key)) {
                  artists.push(key)
                  user1.artistList.forEach(artist => {
                    if (artist.id === key && !artistObjects.includes(artist)) {
                      artistObjects.push(artist)
                    }
                  })
                }
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
        console.log('objects', artistObjects)
        await Group.updateOne({ _id: id }, { artists: artistObjects })
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

        const allTracks = []
        const mapTracks = new Map()
        users.forEach(user => {
          const { topTracks } = user
          topTracks.forEach(track => {
            if (mapTracks.has(track.id)) {
              mapTracks.set(track.id, mapTracks.get(track.id) + 1)
            } else {
              mapTracks.set(track.id, 1)
              allTracks.push(track)
            }
          })
        })
        const sol = []
        const mostPlayed = []
        mapTracks.forEach((val, key) => sol.push(key))
        sol.sort((a, b) => mapTracks.get(b) - mapTracks.get(a))
        sol.forEach(song => {
          allTracks.forEach(track => {
            if (song === track.id) mostPlayed.push(track)
          })
        })
        await Group.updateOne({ _id: id }, { mapTracks })
        await Group.updateOne({ _id: id }, { mostPlayed })

        // ------------

        res.send('group created')
      } else {
        next(new Error('not enough shared artists'))
      }
    } else {
      res.send('already group with same members')
    }

    // reset user availability to false to prevent continuous matching
    // groups automatically are not made if same users,
    // ensures at least one unique user each time
  } catch (err) {
    next(err)
  }
})

router.post('/member', async (req, res, next) => {
  const userID = req.session.id
  console.log('ididid', userID)
  const { id } = req.body
  console.log('id', id)
  try {
    const group = await Group.findById({ _id: id })
    let membership = false
    group.members.forEach(member => {
      console.log(member._id.toString(), userID)
      if (member._id.toString() === userID) membership = true
    })
    if (membership) res.send('yes')
    else res.send('no')
  } catch (err) {
    next(err)
  }
})

// assuming access to the group ID
router.post('/join', isAuthenticated, async (req, res, next) => {
  const { id } = req.body
  // const id = '61a033dd77d30f274c9ebaa9'
  const userID = req.session.id
  console.log('userid', userID)
  try {
    const group = await Group.findById({ _id: id })
    const { mapTracks } = group
    const user = await User.findById({ _id: userID })
    // determine if the user is compatible to join the group

    let compatible = false
    let cnt = 0
    group.artists.forEach(artist => {
      if (user.followedArtists.includes(artist.id)) {
        cnt++
      }
    })
    console.log('cnt', cnt)
    if (cnt >= 3) compatible = true

    if (compatible) {
      const members = [...group.members, user]

      // keep track of the songs already in the most played songs
      const allTracks = [...group.mostPlayed]

      // update the most played tracks including new user
      user.topTracks.forEach(track => {
        if (mapTracks.has(track.id)) {
          mapTracks.set(track.id, mapTracks.get(track.id) + 1)
        } else {
          mapTracks.set(track.id, 1)
          allTracks.push(track)
        }
      })
      const sol = []
      const mostPlayed = []
      mapTracks.forEach((val, key) => sol.push(key))
      sol.sort((a, b) => mapTracks.get(b) - mapTracks.get(a))

      sol.forEach(song => {
        allTracks.forEach(track => {
          if (song === track.id) mostPlayed.push(track)
        })
      })

      await Group.updateOne({ _id: id }, { mapTracks })
      await Group.updateOne({ _id: id }, { mostPlayed })
      // -------------------

      const groups = [...user.groups, id]
      await User.updateOne({ _id: userID }, { groups })
      await Group.updateOne({ _id: id }, { members })
      res.send('joined group')
    } else {
      res.send('incompatible')
    }
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
      const { mapTracks } = group
      const user = await User.findById({ _id: userID })

      const allTracks = []
      const toRemove = []

      // update the most played tracks including new user
      user.topTracks.forEach(track => {
        if (mapTracks.has(track.id)) {
          console.log(track.name, 'After: ', mapTracks.get(track.id))
          mapTracks.set(track.id, mapTracks.get(track.id) - 1)
          console.log(track.name, 'Before: ', mapTracks.get(track.id))
          if (mapTracks.get(track.id) === 0) {
            mapTracks.delete(track.id)
            toRemove.push(track.id)
          }
        }
      })

      console.log('to remove', toRemove)
      group.mostPlayed.forEach(song => {
        console.log('songid', song.id)
        if (!toRemove.includes(song.id)) allTracks.push(song)
      })
      console.log('all remaining tracks', allTracks)

      const sol = []
      const mostPlayed = []
      mapTracks.forEach((val, key) => sol.push(key))
      sol.sort((a, b) => mapTracks.get(b) - mapTracks.get(a))

      sol.forEach(song => {
        allTracks.forEach(track => {
          if (song === track.id) mostPlayed.push(track)
        })
      })

      await Group.updateOne({ _id: id }, { mapTracks })
      await Group.updateOne({ _id: id }, { mostPlayed })

      const members = []
      group.members.forEach(member => {
        if (member._id.toString() !== userID) members.push(member)
      })

      const groups = []
      user.groups.forEach(g => {
        console.log(g._id)
        if (g._id !== id) groups.push(g)
      })

      await User.updateOne({ _id: userID }, { groups })

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
  console.log('groupId', groupId)
  console.log('songId', songId)
  try {
    // check that user is in the group
    const user = await User.findById({ _id: userId })
    let inGroup = false
    user.groups.forEach(g => {
      if (g === groupId) inGroup = true
    })

    if (inGroup) {
      const group = await Group.findById({ _id: groupId })
      let pre = null
      // find the song
      const songs = group.recommendedSongs
      songs.forEach(song => {
        if (song.id === songId) pre = song
      })
      console.log('pre', pre)
      if (!pre.upvoters.includes(userId)) {
        // add user to voter list to keep track
        const upvoters = [...pre.upvoters, userId]
        // update the count
        let numVotes = pre.numVotes + 1

        // if user already downvoted song, remove from downvoters list
        const downvoters = []
        pre.downvoters.forEach(voter => {
          if (voter !== userId) downvoters.push(voter)
          else numVotes = pre.numVotes + 2
        })

        const updatedSong = {
          id: pre.id,
          name: pre.name,
          numVotes,
          upvoters,
          downvoters,
          artists: pre.artists,
        }

        const recommendedSongs = []
        songs.forEach(song => {
          if (song.id !== songId) recommendedSongs.push(song)
        })

        // if the song is upvoted by at least half the group, it is added
        // if added, remove or don't add song to/from recommended
        if (2 * updatedSong.numVotes >= group.members.length) {
          const communityPlaylist = [...group.communityPlaylist, updatedSong]
          await Group.updateOne({ _id: groupId }, { communityPlaylist })
        } else {
          recommendedSongs.push(updatedSong)
        }

        await Group.updateOne({ _id: groupId }, { recommendedSongs })

        res.send('upvoted song')
      } else {
        console.log('already voted')
        res.send('already voted on this song')
      }
    } else {
      console.log('not in group')
      res.send('not in group')
    }
  } catch (err) {
    console.log('error')
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
      let pre = null
      // find the song
      const songs = group.recommendedSongs
      songs.forEach(song => {
        if (song.id === songId) pre = song
      })
      if (!pre.downvoters.includes(userId)) {
        // add user to voter list to keep track
        const downvoters = [...pre.downvoters, userId]
        let numVotes = pre.numVotes - 1

        // if user already downvoted song, remove from downvoters list
        const upvoters = []
        pre.upvoters.forEach(voter => {
          if (voter !== userId) upvoters.push(voter)
          else numVotes = pre.numVotes - 2
        })

        const updatedSong = {
          id: pre.id,
          name: pre.name,
          numVotes,
          upvoters,
          downvoters,
          artists: pre.artists,
        }

        const recommendedSongs = []

        songs.forEach(song => {
          if (song.id !== songId) recommendedSongs.push(song)
        })

        // if enough downvotes, remove from recommended
        if (updatedSong.numVotes > -group.members.length / 2) {
          recommendedSongs.push(updatedSong)
        }

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
