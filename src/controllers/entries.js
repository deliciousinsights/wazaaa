import { Router } from 'express'
import fetch from 'isomorphic-fetch'
import unfluff from 'unfluff'

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
    const entry = {
      excerpt: analysis.text.slice(0, 100) + '…',
      poster: req.user,
      tags: req.body.tags,
      title: analysis.title,
      url: req.body.url,
    }

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

function showEntry(req, res) {
  res.send('COMING SOON: showEntry')
}

function upvoteEntry(req, res) {
  res.send('COMING SOON: upvoteEntry')
}
