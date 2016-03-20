import request from 'supertest'
import sinon from 'sinon'

import app from '../app'
import { didFlash } from '../../test/custom-assertions'
import Entry from '../models/Entry'
import generateFakeEntry from '../../test/factories/entries'
import User from '../models/User'

describe('Entries controller', () => {
  const sandbox = sinon.sandbox.create()

  beforeEach(() => {
    sandbox
      .stub(User, 'findOne')
      .returns(Promise.resolve({ _id: '@alphonse', name: 'Alphonse Robichu' }))
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should route to listing on `/entries`', () => {
    return request(app)
      .get('/entries')
      .expect(200)
      .expect(/bookmarks/)
  })

  it('should render the entry creation form on `/entries/new`', () => {
    return request(app)
      .get('/entries/new')
      .expect(200)
      .expect(/Nouveau bookmark/)
  })

  it('should load a valid entry URL just fine', () => {
    const entry = generateFakeEntry()
    sandbox.stub(Entry, 'getEntry').returns(Promise.resolve(entry))

    return request(app)
      .get(`/entries/${entry.id}`)
      .expect(200)
      .expect(new RegExp(entry.title))
  })

  it('should deny an invalid-BSON entry URL', () => {
    return request(app)
      .get('/entries/foobar')
      .expect(302)
      .expect('location', '/entries')
      .then((res) => {
        didFlash(res, 'info', /Ce bookmark n[’']existe pas/)
      })
  })
})
