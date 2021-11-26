const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  id: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  followedArtists: [{ type: String }],
  topTracks: [{ type: String }],
  topArtists: [{ type: String }],
  group: { type: String },
})

module.exports = model('User', userSchema)
