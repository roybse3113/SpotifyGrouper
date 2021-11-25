const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  followedArtists: [{ type: String }],
  topTracks: [{ type: String }],
  topArtists: [{ type: String }],
})

module.exports = model('User', userSchema)
