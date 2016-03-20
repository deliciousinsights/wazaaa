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
  downVoters: [{ type: String, ref: 'User' }],
  excerpt: String,
  postedAt: { type: Date, default: Date.now, index: true },
  poster: { type: String, ref: 'User' },
  score: { type: Number, default: 0, index: true },
  tags: { type: [String], index: true },
  title: String,
  upVoters: [{ type: String, ref: 'User' }],
  url: { type: String, required: true },
})

Object.assign(entrySchema.statics, {
  getEntries(filter) {
    const tags = normalizeTags(
      _.isString(filter) ? filter : filter && filter.tags
    )
    const scope = this.find()
      .select('-comments -upVoters -downVoters')
      .populate('poster')
      .sort({
        score: -1,
        postedAt: -1,
      })

    if (tags.length === 0) {
      return scope
    }

    const op = filter.tagMode === 'any' ? 'in' : 'all'
    return scope.where('tags')[op](tags)
  },

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

  voteBy(user, offset) {
    user = 'id' in user ? user.id : user

    return this.update({
      $inc: { score: offset },
      $addToSet: { [offset > 0 ? 'upVoters' : 'downVoters']: user },
    })
  },

  votedBy(user) {
    user = 'id' in user ? user.id : user
    return this.upVoters.includes(user) || this.downVoters.includes(user)
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
