const { Schema, model } = require('mongoose')
const User = require('./user').schema

const groupSchema = new Schema({
  name: { type: String },
  members: [{ type: User }],
  artists: [{ type: String }],
  mostPlayed: [{ type: String }],
  mapTracks: { type: Map },
})

module.exports = model('Group', groupSchema)
