import { Router } from 'express'
import fetch from 'isomorphic-fetch'
import unfluff from 'unfluff'

import Entry from '../models/Entry'

const router = new Router()

router.get('/', listEntries)
router.post('/', createEntry)
router.get('/new', newEntry)
router.get('/:id', showEntry)
router.patch('/:id/downvote', downvoteEntry)
router.patch('/:id/upvote', upvoteEntry)
router.post('/:id/comments', commentEntry)

export default router

function commentEntry(req, res) {
  res.send('COMING SOON: commentEntry')
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
  res.send('COMING SOON: downvoteEntry')
}

function listEntries(req, res) {
  res.render('entries/index', { pageTitle: 'Les bookmarks', entries: [] })
}

function newEntry(req, res) {
  res.render('entries/new', { pageTitle: 'Nouveau bookmark' })
}

async function showEntry(req, res) {
  try {
    const entry = await Entry.getEntry(req.params.id)
    if (!entry) {
      throw new Error(`No entry found for ID ${req.params.id}`)
    }

    entry.comments = [] // FIXME
    res.render('entries/show', { pageTitle: entry.title, entry })
  } catch (err) {
    req.flash('info', `Ce bookmark n’existe pas (ou plus) ${err.message}`)
    res.redirect('/entries')
  }
}

function upvoteEntry(req, res) {
  res.send('COMING SOON: upvoteEntry')
}
