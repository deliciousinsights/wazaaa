import mongoose, { Schema } from 'mongoose'
import _ from 'underscore'

const entrySchema = new Schema({})

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
