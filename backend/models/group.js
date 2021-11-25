const { Schema, model } = require('mongoose')
const User = require('./user').schema

const groupSchema = new Schema({
  members: [{ type: User }],
})

module.exports = model('Group', groupSchema)
