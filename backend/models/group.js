const { Schema, model } = require('mongoose')

const groupSchema = new Schema({
  groupname: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

module.exports = model('Group', groupSchema)
