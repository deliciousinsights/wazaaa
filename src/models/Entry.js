// Modèle pour les bookmarks
// =========================
import mongoose, { Schema } from 'mongoose'
import _ from 'underscore'

// Le schéma qui va bien
// ---------------------

// Mongoose nous encourage fortement à produire des **schémas** pour nos documents
// (on dit « documents », pas « enregistrements » en bases documentaires, tout comme
// on dit « collections » et pas « tables »).  Ça n'a rien d'obligatoire, les bases
// documentaires étant traditionnellement *schema-less* et nous autorisant à tripatouiller
// chaque document comme bon nous semble, mais c'est de bon ton pour plusieurs raisons :
//
// * Ça « documente » les propriétés (pas « champs »…) auxquelles s'attendre, et pas seulement
//   leurs noms mais aussi leurs types, valeurs par défaut, contraintes, et éventuelle
//   indexation.
// * Ça permet à Mongoose de garantir certains aspects, dont les valeurs par défaut et la
//   définition effective des index.
// * Si on passe le schéma en [mode strict](http://mongoosejs.com/docs/guide.html#strict),
//   ça force son respect par nos documents (en ignorant les propriétés inconnues ou en levant
//   carrément une exception).
//
// [En savoir plus sur les schémas Mongoose](http://mongoosejs.com/docs/guide.html)
const entrySchema = new Schema({
  // Collection intégrée/incluse, avec son propre sous-schéma
  comments: [
    {
      text: { type: String, required: true },
      author: { type: String, ref: 'User' },
      postedAt: { type: Date, default: Date.now, index: true },
    },
  ],
  downVoters: [{ type: String, ref: 'User' }],
  excerpt: String,
  // Notez la fonction `Date.now` (non appelée, juste référencée) en valeur par défaut
  postedAt: { type: Date, default: Date.now, index: true },
  // Liaison mongoDB par référence plutôt que par inclusion ; on est ici sur du N-N
  // et il y aura sans doute bien moins d'utilisateurs que de bookmarks, ce qui rend l'inclusion
  // [encore moins adaptée](http://docs.mongodb.org/manual/tutorial/model-referenced-one-to-many-relationships-between-documents/#data-modeling-publisher-and-books).
  // Vu que notre modèle `User` a une clé primaire non pas de type `ObjectId`
  // (cas par défaut) mais de type `String`, on se cale là-dessus.  Préciser le champ `ref` ouvre
  // la voie à la fonctionnalité super cool [`.populate`](http://mongoosejs.com/docs/populate.html) pour le *eager loading*.
  poster: { type: String, ref: 'User' },
  score: { type: Number, default: 0, index: true },
  // L'index portant sur tout le tableau et non sur chaque élément, on fait un schéma dont le type est un tableau,
  // et non un tableau dont le type est un schéma (comme pour `comments` ou `upVoters` ci-après).
  tags: { type: [String], index: true },
  title: String,
  upVoters: [{ type: String, ref: 'User' }],
  url: { type: String, required: true },
})

// Méthodes statiques
// ------------------
//
// Chaque modèle produit par Mongoose sur base de ce schéma disposera de ces méthodes statiques.
// Notre objectif principal ici est d'isoler autant que possible les contrôleurs (et le reste de la codebase,
// de façon générale) des détails techniques de l'API Mongoose/mongoDB, tout en produisant systématiquement
// des promesses plutôt qu'une API basée sur *callbacks*.
Object.assign(entrySchema.statics, {
  // Fournit une liste triée (plus hauts scores d'abord, plus récents d'abord par score) des bookmarks,
  // filtrée par des tags éventuels, avec *eager loading* des infos d'utilisateur (auteur, commentateur).
  getEntries(filter) {
    // `normalizeTags` est un normaliseur centralisé pour le listing et la création, voire plus bas.
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

    // Plutôt que de se galérer à construire plusieurs objets de requêtage imbriqués, autant
    // se contenter d'appeler le bon opérateur (`in` ou `all`) en chaînage du `where` approprié
    // (ce qui est plus lisible d'ailleurs, surtout quand l'opérateur est statique dans le code
    // au lieu d'être dynamique, comme ici).
    const op = filter.tagMode === 'any' ? 'in' : 'all'
    return scope.where('tags')[op](tags)
  },

  // Récupère un bookmark donné avec les infos d'utilisateur pré-chargées.
  getEntry(id) {
    return this.findById(id).populate('poster comments.author')
  },

  // Crée un bookmark.  Note : ici, pas besoin de `.exec()` final car `.create` n'est pas une
  // requête (aucun intérêt d’y chaîner des `.where`, etc.) et donc ne renvoie pas une `Query`
  // mais directement une promesse, faute de *callback* passé en dernier argument.
  post(fields) {
    fields.tags = normalizeTags(fields.tags)
    return this.create(fields)
  },

  // Renvoie une liste dédoublonnée de tous les tags présents dans les propriétés `tags` (de type
  // tableau) des bookmarks.  On note ici toute la puissance de mongoDB pour traiter des documents
  // imbriqués aux types variés, en l'occurrence grâce à l'opérateur
  // [`$unwind`](http://docs.mongodb.org/manual/reference/operator/aggregation/unwind/#pipe._S_unwind)
  // dans la *pipeline* de [l’aggrégation](http://docs.mongodb.org/manual/reference/method/db.collection.aggregate/#db.collection.aggregate).
  // De [nombreux opérateurs avancés](http://docs.mongodb.org/manual/reference/operator/aggregation/) existent.
  tags() {
    return this.aggregate([
      { $unwind: '$tags' },
      { $sortByCount: '$tags' },
    ]).then((tuples) => tuples.map(({ _id }) => _id))
  },
})

// Méthodes d'instance
// -------------------
//
// Chaque document produit par Mongoose sur base de ce schéma disposera de ces méthodes d'instance.
//
// On pourrait démarrer chaque extension par `entrySchema.methods.truc = function truc…` mais autant
// simplifier en exploitant `_.extend`, plutôt.
Object.assign(entrySchema.methods, {
  // Ajout d'un commentaire au bookmark
  comment(author, text) {
    // L'opérateur de mise à jour [`$push`](http://docs.mongodb.org/manual/reference/operator/update/push/#up._S_push)
    // permet l'ajout à une propriété tableau. Rappel : l`appel de `.exec()` sans argument sur un objet `Query` de
    // Mongoose le transforme en promesse.
    return this.update({ $push: { comments: { author, text } } })
  },

  // Ajout d'un vote (up/down) au bookmark
  voteBy(user, offset) {
    user = 'id' in user ? user.id : user

    return this.update({
      // L'opérateur [`$inc`](http://docs.mongodb.org/manual/reference/operator/update/inc/#up._S_inc)
      // incrémente/décrémente de manière atomique un champ numérique.
      $inc: { score: offset },
      // L'opérateur [`$addToSet`](http://docs.mongodb.org/manual/reference/operator/update/addToSet/#up._S_addToSet)
      // diffère de `$push` en ce qu'il garantit tout seul l'unicité dans le tableau (pas de doublons).
      $addToSet: { [offset > 0 ? 'upVoters' : 'downVoters']: user },
    })
  },

  // Détermine si un utilisateur a déjà voté pour ce bookmark
  votedBy(user) {
    user = 'id' in user ? user.id : user
    return this.upVoters.includes(user) || this.downVoters.includes(user)
  },
})

// Nos modules de modèle renvoient toujours un modèle Mongoose, basé sur notre schéma.
const Model = mongoose.model('Entry', entrySchema)

export default Model

// Histoire d'autoriser un peu n'importe quelle forme pour nos tags, suivant qui les fournits, on normalise ici.
// L'idée est d'accepter des `String`s comme des tableaux de `String`, chacune pouvant contenir plusieurs tags
// séparés par des espaces et/ou des virgules, avec d'éventuels doublons et variations de casse, etc.
//
// On normalise tout ça à grands renforts [d'Underscore](http://underscorejs.org/) en un tableau simple de chaînes
// uniques, triées, sans *whitepsace* autour, en minuscules.
function normalizeTags(tags) {
  // 1. N'avoir qu'un niveau de tableau, peu importe ce qui nous est passé.
  tags = _.flatten([_.isString(tags) ? tags.trim() : tags])
  // 2. Virer les `null` et `undefined` éventuels, passer en minuscules, découper sur séparateurs éventuels,
  // ré-aplatir (le `.split` a engendré un tableau de tableaux), virer le whitespace autour, et finalement trier le tout.
  // Notez le chaînage initial histoire de pouvoir enquiller les appels façon Objet plutôt que d'imbriquer des appels
  // de type `_.method(…)` à n'en plus finir (on récupère la valeur obtenue au final avec `.value()`).
  tags = _.chain(tags)
    .compact()
    .map((s) => s.toLowerCase().split(/[,\s]+/))
    .flatten()
    .invoke('trim')
    .value()
    .sort()
  // 3. Dédoublonner grâce à `Set`
  return [...new Set(tags)]
}
