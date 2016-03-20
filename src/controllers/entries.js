import { Router } from 'express'

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

function createEntry(req, res) {
  console.log(req.body)
  res.send('COMING SOON: createEntry')
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
