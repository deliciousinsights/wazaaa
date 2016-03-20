/* global db */
var ONE_DAY = 24 * 60 * 60 * 1000

db.users.remove({})
db.users.insert({
  _id: '@porteneuve',
  name: 'ChristophePorteneuve',
  provider: 'twitter',
  joinedAt: new Date(Date.now() - 7 * ONE_DAY),
})
db.users.insert({
  _id: '@charlize',
  name: 'Charlize Theron',
  provider: 'twitter',
  joinedAt: new Date(Date.now() - 5 * ONE_DAY),
})
