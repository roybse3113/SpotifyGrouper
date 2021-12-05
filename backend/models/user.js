const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  id: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  followedArtists: [{ type: String }],
  topTracks: [{ type: Object }],
  topArtists: [{ type: String }],
  artistList: [{ type: Object }],
  groups: [{ type: String }],
  availability: { type: Boolean, default: false },
})

module.exports = model('User', userSchema)
