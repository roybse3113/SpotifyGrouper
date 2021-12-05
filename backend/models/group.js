const { Schema, model } = require('mongoose')
const User = require('./user').schema

const groupSchema = new Schema({
  groupname: { type: String },
  members: [{ type: User }],
  artists: [{ type: Object }],
  mostPlayed: [{ type: Object }],
  mapTracks: { type: Map },
  communityPlaylist: [{ type: Object }],
  recommendedSongs: [{ type: Object }],
})
module.exports = model('Group', groupSchema)
