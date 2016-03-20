// Contrôleur des bookmarks
// ========================
import { Router } from 'express'
import fetch from 'isomorphic-fetch'
import unfluff from 'unfluff'

import Entry from '../models/Entry'
import { broadcast } from './web-sockets'

// Chaque contrôleur exporte un routeur Express.
const router = new Router()

// Middleware vérifiant qu'on est authentifié (Passport aura rempli `req.user`)
router.use(requireAuthentication)

// Middleware pré-chargeant l'entité bookmark (`Entry`) pour toute URL REST de
// type identité (`/entries/BSON_ID` éventuellement suivie d'une fin de chemin).
// Si l'entité n'existe pas, on ramène au listing.
router.use('/:id', loadAndVerifyEntry)

// Routes RESTful choisies + quelques actions modifiantes
router.get('/', listEntries)
router.post('/', createEntry)
router.get('/new', newEntry)
router.get('/:id', showEntry)
router.patch('/:id/downvote', downvoteEntry)
router.patch('/:id/upvote', upvoteEntry)
router.post('/:id/comments', commentEntry)

export default router

// Ajout d'un commentaire à un bookmark.  D'un point de vue strictement « conventions » on
// aurait dû faire un contrôleur dédié avec une action `create` mais j'ai trouvé ça un peu
// *overkill* sur ce coup, donc bon…
async function commentEntry(req, res) {
  try {
    await req.entry.comment(req.user, req.body.text)
    req.flash('success', 'Votre commentaire a bien été ajouté.')
  } catch (err) {
    req.flash(
      'error',
      `Votre commentaire n’a pas pu être ajouté : ${err.message}`
    )
  }
  res.redirect(`/entries/${req.entry.id}`)
}

// Création d'un bookmark
async function createEntry(req, res) {
  try {
    // Merci `isomorphic-fetch` qui nous fournit un requêtage HTTP par promesse,
    // dont la valeur d'accomplissement est la réponse, qu’on chaîne avec une promesse sur
    // le corps de réponse, en tant que texte !
    const urlReq = await fetch(req.body.url)
    const html = await urlReq.text()
    const analysis = unfluff(html)
    const entry = await Entry.post({
      excerpt: analysis.text.slice(0, 100) + '…',
      poster: req.user,
      tags: req.body.tags,
      title: analysis.title,
      url: req.body.url,
    })

    // On notifie par websockets les clients concernés.  Attention au champ `poster`, qui
    // n'a pas été prérempli suite à cette simple création, mais que le côté client voudra
    // utiliser : on simule son remplissage à la main :-)
    const notif = entry.toJSON()
    notif.poster = req.user
    broadcast('new-entry', notif)

    req.flash('success', `Votre bookmark « ${entry.title} » a bien été créé.`)
    res.redirect(`/entries/${entry.id}`)
  } catch (err) {
    req.flash(
      'error',
      `Une erreur est survenue en traitant cette URL : ${err.message}`
    )
    res.redirect('/entries/new')
  }
}

// Downvote d'un bookmark.  Le code est tellement similaire à celui de l'upvote qu'on l'a factorisé.
function downvoteEntry(req, res) {
  voteOnEntry(req, res, -1)
}

// Listing des bookmarks.  La seule petite complexité rajoutée est qu'on a besoin, séparément,
// d'un `Entry.getEntries` et d'un `Entry.tags`.  Elles sont ici séquentielles mais on pourrait facilement
// les paralléliser avec un équivalent de `Promise.all`, ce qui allègerait aussi ce code : essayez donc !
async function listEntries(req, res) {
  try {
    const [tags, entryCount, entries] = await Promise.all([
      Entry.tags(),
      Entry.count(),
      Entry.getEntries(req.query),
    ])
    res.render('entries/index', {
      pageTitle: 'Les bookmarks',
      entries,
      entryCount,
      tags,
    })
  } catch (err) {
    req.flash('error', `Impossible d’afficher les bookmarks : ${err.message}`)
    res.redirect('/')
  }
}

const NON_RESOURCE_IDS = ['new']

async function loadAndVerifyEntry(req, res, next) {
  if (NON_RESOURCE_IDS.includes(req.params.id)) {
    return next()
  }

  try {
    const entry = await Entry.getEntry(req.params.id)
    // Souci SQL ou entité introuvable : on sera gérés par le dernier callback
    // de rejet de promesse.
    if (!entry) {
      throw new Error(`No entry found for ID ${req.params.id}`)
    }

    req.entry = entry
    next()
  } catch (err) {
    req.flash('info', `Ce bookmark n’existe pas (ou plus) ${err.message}`)
    res.redirect('/entries')
  }
}

// Formulaire de création d'un bookmark.
async function newEntry(req, res) {
  const tags = await Entry.tags()
  res.render('entries/new', { pageTitle: 'Nouveau bookmark', tags })
}

function requireAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  req.flash('info', 'Vous devez être authentifié·e pour accéder aux bookmarks.')
  res.redirect('/')
}

// Affichage d'un bookmark.
function showEntry(req, res) {
  const { entry } = req
  res.render('entries/show', { pageTitle: entry.title, entry })
}

// Upvote d'un bookmark.  Le code est tellement similaire à celui du downvote qu'on l'a factorisé.
function upvoteEntry(req, res) {
  voteOnEntry(req, res, +1)
}

// Code central de vote (up/down) d'un bookmark.
async function voteOnEntry(req, res, offset) {
  const { entry, user } = req
  try {
    // Si l'utilisateur courant a déjà voté pour le bookmark, refuser son lobbying ;-)
    if (entry.votedBy(user)) {
      req.flash('error', 'Vous avez déjà voté pour ce bookmark…')
    } else {
      await entry.voteBy(user, offset)
      req.flash('success', 'Votre vote a bien été pris en compte')
    }
  } catch (err) {
    req.flash(
      'error',
      `Votre vote n’a pas pu être pris en compte : ${err.message}`
    )
  }
  res.redirect(`/entries/${entry.id}`)
}
