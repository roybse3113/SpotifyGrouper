const express = require('express')
const mongoose = require('mongoose')
const session = require('cookie-session')

const AccountRouter = require('./routes/account')

const app = express()

const MONGO_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/Spotify-Grouper'

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

app.get('/', (req, res) => {
  return res.send('ello world!')
})

app.use(express.json())

app.use(
  session({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 1000 * 24 * 60 * 60,
  })
)

app.use('/account', AccountRouter)

// error handling middleware at bottom of stack
app.use((err, req, res, next) => {
  // res.status(200).send('Error: ', err.message)
  res.status(err.status || 500)
  res.status(200).json({
    message: err.message,
    error: err,
  })
})

// Start listening for requests
app.listen(3000, () => {
  console.log('Listening on port 3000')
})
