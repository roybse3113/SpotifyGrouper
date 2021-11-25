const express = require('express')

const router = express.Router()
const User = require('../models/user')
const Group = require('../models/group')
const isAuthenticated = require('../middlewares/isAuthenticated')

// signup
router.get('/match', async (req, res, next) => {
  try {
    const users = await User.find()
    const list = []
    if (users) {
      users.forEach(user => {
        list.push(user)
      })
      console.log('list: ', list)
      await Group.create({ members: list })
      res.send('group created')
    }
  } catch (err) {
    next(err)
  }
})

module.exports = router
