const { Schema, model } = require('mongoose')

const songSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  numVotes: { type: Number, default: 0 },
  voters: [{ type: String }],
})

module.exports = model('Song', songSchema)
