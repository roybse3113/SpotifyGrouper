const express = require('express')

const router = express.Router()
const User = require('../models/user')
const isAuthenticated = require('../middlewares/isAuthenticated')

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
      console.log('user already logged in')
      res.send('user already logged in')
    } else {
      const user = await User.findOne({ username })

      if (!user) {
        console.log('user does not exist')
        res.send('user does not exist')
      } else {
        const { password: passDB } = user

        if (password === passDB) {
          req.session.username = username
          req.session.password = password
          req.session.user = user
          req.session.id = user._id.toString()
          console.log('id: ', req.session.id)
          res.send('user logged in successfully')
        } else {
          res.send('user credentials are wrong')
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
