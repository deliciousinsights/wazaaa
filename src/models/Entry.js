import mongoose, { Schema } from 'mongoose'
import _ from 'underscore'

const entrySchema = new Schema({
  comments: [
    {
      text: { type: String, required: true },
      author: { type: String, ref: 'User' },
      postedAt: { type: Date, default: Date.now, index: true },
    },
  ],
  excerpt: String,
  postedAt: { type: Date, default: Date.now, index: true },
  poster: { type: String, ref: 'User' },
  tags: { type: [String], index: true },
  title: String,
  url: { type: String, required: true },
})

Object.assign(entrySchema.statics, {
  getEntry(id) {
    return this.findById(id).populate('poster comments.author')
  },

  post(fields) {
    fields.tags = normalizeTags(fields.tags)
    return this.create(fields)
  },
})

Object.assign(entrySchema.methods, {
  comment(author, text) {
    return this.update({ $push: { comments: { author, text } } })
  },
})

const Model = mongoose.model('Entry', entrySchema)

export default Model

function normalizeTags(tags) {
  tags = _.flatten([_.isString(tags) ? tags.trim() : tags])
  tags = _.chain(tags)
    .compact()
    .map((s) => s.toLowerCase().split(/[,\s]+/))
    .flatten()
    .invoke('trim')
    .value()
    .sort()
  return [...new Set(tags)]
}
