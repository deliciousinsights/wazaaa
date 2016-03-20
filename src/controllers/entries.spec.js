import chai, { expect } from 'chai'
import nock from 'nock'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import request from 'supertest'

import { didFlash } from '../../test/custom-assertions'
import generateFakeEntry from '../../test/factories/entries'
import stubPassport from '../../test/stubs/passport-stub'
import app from '../app'
import Entry from '../models/Entry'
import * as ws from './web-sockets'

chai.use(sinonChai)

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
      sandbox.stub(Entry, 'tags').returns(Promise.resolve([]))

      return request(app)
        .get('/entries')
        .expect(200)
        .expect(/bookmarks/)
    })

    it('should render the entry creation form on `/entries/new`', () => {
      sandbox.stub(Entry, 'tags').returns(Promise.resolve([]))

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

    it('should trigger a proper-payload websocket broadcast on entry creation', () => {
      const entry = generateFakeEntry({ url: 'http://www.example.com' })
      const spy = sandbox.stub(ws, 'broadcast')
      sandbox.stub(Entry, 'post').returns(Promise.resolve(entry))
      nock(entry.url)
        .get('/')
        .reply(
          200,
          '<head><title>That was fast</title></head><body><p>42 tips to mock your network code</body>'
        )

      return request(app)
        .post('/entries')
        .send(`url=${entry.url}`)
        .expect(302)
        .expect('location', `/entries/${entry.id}`)
        .then((res) => {
          expect(spy).to.have.been.calledWith('new-entry', entry)
        })
    })
  })
})
