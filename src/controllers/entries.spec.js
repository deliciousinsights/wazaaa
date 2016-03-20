import request from 'supertest'

import app from '../app'

describe('Entries controller', () => {
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
})
