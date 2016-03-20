import objectId from 'bson-objectid'
import faker from 'faker'

export function generateFakeEntry(fields = {}) {
  const basis = {
    id: objectId().toHexString(),
    url: faker.internet.url(),
    title: faker.lorem.sentence(),
    excerpt: faker.lorem.text(),
    postedAt: faker.date.past(),
    tags: [],
    poster: {
      name: 'Alphonse Robichu',
      email: 'alphonse@robichu.name',
      id: '@alphonse',
    },
    comments: [],

    score: 0,

    upVoters: [],
    downVoters: [],
  }

  return {
    ...basis,
    ...fields,
    toJSON() {
      return this
    },
  }
}

export default generateFakeEntry
