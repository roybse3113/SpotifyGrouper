const express = require('express')

const router = express.Router()
const User = require('../models/user')
const isAuthenticated = require('../middlewares/isAuthenticated')

// check to see if logged in or not

router.get('/status', async (req, res, next) => {
  const { username } = req.session
  if (req.session.user) {
    try {
      const user = await User.findOne({ username })
      res.json(user)
    } catch (err) {
      next(err)
    }
  } else {
    res.send('not logged in')
  }
})

// signup
router.post('/signup', async (req, res, next) => {
  const { username, password } = req.body

  if (!req.session.user) {
    if (username.length !== 0) {
      try {
        const user = await User.findOne({ username })
        if (!user) {
          await User.create({ username, password })
          res.send('user created')
        } else {
          res.send('duplicate username')
        }
      } catch (err) {
        next(err)
      }
    } else {
      res.send('username is empty')
    }
  } else {
    res.send('user already signed in')
  }
})

router.post('/login', async (req, res, next) => {
  const { username, password } = req.body

  try {
    if (req.session.user) {
      res.send('user already logged in')
    } else {
      const user = await User.findOne({ username })

      if (!user) {
        res.send('user does not exist')
      } else {
        const { password: passDB } = user

        if (password === passDB) {
          req.session.username = username
          req.session.password = password
          req.session.user = user
          req.session.id = user._id.toString()
          res.send('user logged in successfully')
        } else {
          res.send('user credentials are wrong')
        }
      }
    }
  } catch (err) {
    next(err)
  }
})

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    next(err)
  }
})

// indicate user wants to match
router.post('/available', async (req, res, next) => {
  const userID = req.session.id
  try {
    const user = await User.findById({ _id: userID })
    if (user.availability) {
      await User.updateOne({ _id: userID }, { availability: false })
      res.send('made unavailable')
    } else {
      await User.updateOne({ _id: userID }, { availability: true })
      res.send('made available')
    }
  } catch (err) {
    next(err)
  }
})

// approve group matching if >= 3 people are available
// once have a small group, other users can join
// for each user, ideally would only show groups to join if they share
// enough similarity or number of shared artists
router.get('/getAvailableCount', async (req, res, next) => {
  // console.log('enteredd')
  try {
    const users = await User.find()
    // console.log('users', users)
    let cnt = 0
    users.forEach(user => {
      if (user.availability) cnt++
      // console.log('updated count: ', cnt)
    })
    if (cnt >= 3) res.send('enough users')
    else res.send('not enough users')
  } catch (err) {
    next(err)
  }
})

router.get('/currentUser', async (req, res, next) => {
  try {
    const { id } = req.session
    const user = await User.findOne({ _id: id })
    res.send(user)
  } catch (err) {
    next(err)
  }
})

// logout
router.post('/logout', isAuthenticated, (req, res) => {
  req.session.username = null
  req.session.password = null
  req.session.user = null
  res.send('user has logged out')
})

module.exports = router
