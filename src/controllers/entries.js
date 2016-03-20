import { Router } from 'express'
import fetch from 'isomorphic-fetch'
import unfluff from 'unfluff'

import Entry from '../models/Entry'

const router = new Router()

router.use('/:id', loadAndVerifyEntry)

router.get('/', listEntries)
router.post('/', createEntry)
router.get('/new', newEntry)
router.get('/:id', showEntry)
router.patch('/:id/downvote', downvoteEntry)
router.patch('/:id/upvote', upvoteEntry)
router.post('/:id/comments', commentEntry)

export default router

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

async function createEntry(req, res) {
  try {
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

function downvoteEntry(req, res) {
  voteOnEntry(req, res, -1)
}

async function listEntries(req, res) {
  try {
    const entries = await Entry.getEntries(req.query)
    res.render('entries/index', { pageTitle: 'Les bookmarks', entries })
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

function newEntry(req, res) {
  res.render('entries/new', { pageTitle: 'Nouveau bookmark' })
}

function showEntry(req, res) {
  const { entry } = req
  res.render('entries/show', { pageTitle: entry.title, entry })
}

function upvoteEntry(req, res) {
  voteOnEntry(req, res, +1)
}

async function voteOnEntry(req, res, offset) {
  const { entry, user } = req
  try {
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
