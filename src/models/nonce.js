/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Statsig
 */

var mongoose = require('mongoose')
var uuid = require('uuid')

var COLLECTION = 'nonce'

var nonceSchema = mongoose.Schema({
  email: String,
  nonce: { type: String, select: true },
  expires: { type: Date, select: true }
})

nonceSchema.statics.createNew = function (email, callback) {
  const nonce = uuid.v4()
  let expires = new Date()
  expires.setMinutes(expires.getMinutes() + 2)

  return this.collection.findOneAndUpdate(
    { email },
    { $set: { email, nonce, expires } },
    { new: true, upsert: true },
    (err, obj) => {
      return callback(err, err ? null : nonce)
    }
  )
}

nonceSchema.statics.validate = function (email, nonce, callback) {
  return this.collection.findOne({ email }, (err, obj) => {
    if (err) {
      return callback(err, false)
    }
    return callback(null, obj.nonce === nonce && obj.expires.getTime() > Date.now())
  })
}

module.exports = mongoose.model(COLLECTION, nonceSchema)
