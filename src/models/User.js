// Modèle pour les utilisateurs
// ============================
import mongoose, { Schema } from 'mongoose'

// Le schéma qui va bien
// ---------------------

// Voir la doc de [Entry](entry.html) pour plus de détails.
const userSchema = new Schema({
  _id: { type: String, required: true },
  name: String,
  provider: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
})

// Méthodes statiques
// ------------------
//
// Chaque modèle produit par Mongoose sur base de ce schéma disposera de ces méthodes statiques.
// Il s'agit ici de faciliter la recherche ou la création à la volée d'un `User` par Passport
// lorsqu'un fournisseur d'authentification lui renvoie une identité confirmée.
//
// La capacité [`upsert`](http://docs.mongodb.org/manual/reference/method/db.collection.update/#upsert-parameter)
// de `update` est ici fort utile.
//
// On renvoie non pas le résultat natif (auquel cas fournir `done` en dernier argument de `update` aurait suffi),
// mais l'id du modèle (qu'on connaît déjà à la base, pratique).  C'est ce résultat qui sera, *in fine*,
// passé à la sérialisation dans la session par Passport (voir le contrôleur `users` pour le code).
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

// Nos modules de modèle renvoient toujours un modèle Mongoose, basé sur notre schéma.
const Model = mongoose.model('User', userSchema)

export default Model
