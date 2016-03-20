import sinon from 'sinon'
import request from 'supertest'

import { didFlash } from '../../test/custom-assertions'
import generateFakeEntry from '../../test/factories/entries'
import stubPassport from '../../test/stubs/passport-stub'
import app from '../app'
import Entry from '../models/Entry'

describe('Entries controller', () => {
  let passportStub
  const sandbox = sinon.sandbox.create()

  beforeAll(() => {
    passportStub = stubPassport(app)
  })

  afterAll(() => {
    passportStub.uninstall()
  })

  afterEach(() => {
    passportStub.logout()
    sandbox.restore()
  })

  describe('when logged out', () => {
    it('should redirect+flash on anonymous `/entries`', () => {
      return request(app)
        .get('/entries')
        .expect(302)
        .expect('location', '/')
        .then((res) => {
          didFlash(res, 'info', /Vous devez être authentifié/)
        })
    })
  })

  describe('when logged in', () => {
    beforeEach(() =>
      passportStub.login({ id: '@alphonse', name: 'Alphonse Robichu' })
    )

    it('should route to listing on authenticated `/entries`', () => {
      sandbox.stub(Entry, 'getEntries').returns(Promise.resolve([]))
      sandbox.stub(Entry, 'count').returns(Promise.resolve(0))

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
})
