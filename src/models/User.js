import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  _id: { type: String, required: true },
  name: String,
  provider: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
})

const Model = mongoose.model('User', userSchema)

export default Model
