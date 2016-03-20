import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema({
  _id: { type: String, required: true },
  name: String,
  provider: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
})

Object.assign(userSchema.statics, {
  findOrCreateByAuth(id, name, provider, done) {
    this.update(
      // Recherche
      { _id: id, provider },
      // Mise à jour (l'id est supposé être celui de la recherche)
      { $set: { name }, $setOnInsert: { joinedAt: Date.now() } },
      // Activation du mode upsert (insertion si non trouvé)
      { upsert: true },
      // Forwarder l'erreur éventuelle, mais à défaut transmettre l'id comme valeur résultante.
      (err) => done(err, id)
    )
  },
})

const Model = mongoose.model('User', userSchema)

export default Model
