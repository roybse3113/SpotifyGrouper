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

// Algorithm for k-combinations
/**
 * Copyright 2012 Akseli Palén.
 * Created 2012-07-15.
 * Licensed under the MIT license.
 */
function k_combinations(set, k) {
  let i
  let j
  let combs
  let head
  let tailcombs
  if (k > set.length || k <= 0) {
    return []
  }
  if (k === set.length) {
    return [set]
  }
  if (k === 1) {
    combs = []
    for (i = 0; i < set.length; i++) {
      combs.push([set[i]])
    }
    return combs
  }
  combs = []
  for (i = 0; i < set.length - k + 1; i++) {
    head = set.slice(i, i + 1)
    tailcombs = k_combinations(set.slice(i + 1), k - 1)
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]))
    }
  }
  return combs
}

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
    let unique = true
    allGroups.forEach(group => {
      let diff = false
      if (group.members.length === usersToMatch.length) {
        const freq = new Map()
        group.members.forEach(member => {
          const memID = member._id.toString()
          if (freq.has(memID)) {
            freq.set(memID, freq.get(memID) + 1)
          } else {
            freq.set(memID, 1)
          }
        })
        usersToMatch.forEach(member => {
          const memID = member._id.toString()
          if (freq.has(memID)) {
            freq.set(memID, freq.get(memID) - 1)
          }
        })
        freq.forEach((val, key) => {
          if (val !== 0) diff = true
        })
        if (!diff) unique = false
      }
    })

    if (unique) {
      let list = []

      if (!users) {
        next(new Error('no users'))
      }

      let artists = []
      const artistObjects = []

      const combinations = k_combinations(usersToMatch, 3)

      combinations.forEach(comb => {
        const map = new Map()
        const sharedArtists = []
        const test = []
        comb.forEach(user => test.push(user.username))
        comb.forEach(user => {
          user.followedArtists.forEach(artist => {
            if (!map.has(artist)) {
              map.set(artist, 1)
            } else {
              map.set(artist, map.get(artist) + 1)
              if (map.get(artist) === 3) sharedArtists.push(artist)
            }
          })
        })
        if (sharedArtists.length >= 3) {
          artists = [...sharedArtists]
          list = [...comb]
          if (artistObjects.length < 3) {
            list[0].artistList.forEach(artist => {
              if (artists.includes(artist.id)) artistObjects.push(artist)
            })
          }
        }
      })

      // usersToMatch.forEach(user1 => {
      //   usersToMatch.forEach(user2 => {
      //     if (user2 !== user1) {
      //       // compare current user with all other users
      //       const map = new Map()
      //       let cnt = 0
      //       user1.followedArtists.forEach(artist => {
      //         map.set(artist, 1)
      //       })
      //       user2.followedArtists.forEach(artist => {
      //         if (map.has(artist)) {
      //           map.set(artist, map.get(artist) - 1)
      //         }
      //       })
      //       map.forEach((val, key) => {
      //         if (val === 0) {
      //           cnt++
      //           if (!artists.includes(key)) {
      //             artists.push(key)
      //             user1.artistList.forEach(artist => {
      //               if (artist.id === key && !artistObjects.includes(artist)) {
      //                 artistObjects.push(artist)
      //               }
      //             })
      //           }
      //         }
      //       })

      //       if (cnt >= 3) {
      //         if (!list.includes(user1)) list.push(user1)
      //         if (!list.includes(user2)) list.push(user2)
      //       }
      //     }
      //   })
      // })
      // console.log('list of users', list)

      if (list.length > 0) {
        const group = await Group.create({ members: list })
        const id = group._id.toString()
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
            // only reset availability for each user if made group
            usersToMatch.forEach(async user => {
              await User.updateOne({ _id: user._id }, { availability: false })
            })
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
  const { id } = req.body
  try {
    const group = await Group.findById({ _id: id })
    let membership = false
    group.members.forEach(member => {
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
          mapTracks.set(track.id, mapTracks.get(track.id) - 1)
          if (mapTracks.get(track.id) === 0) {
            mapTracks.delete(track.id)
            toRemove.push(track.id)
          }
        }
      })

      group.mostPlayed.forEach(song => {
        if (!toRemove.includes(song.id)) allTracks.push(song)
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

      const members = []
      group.members.forEach(member => {
        if (member._id.toString() !== userID) members.push(member)
      })

      const groups = []
      user.groups.forEach(g => {
        if (g._id !== id) groups.push(g)
      })

      await User.updateOne({ _id: userID }, { groups })
      if (members.length === 0) {
        await Group.findOneAndDelete({ _id: id })
      } else {
        await Group.updateOne({ _id: id }, { members })
      }

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
      let pre = null
      // find the song
      const songs = group.recommendedSongs
      songs.forEach(song => {
        if (song.id === songId) pre = song
      })
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
