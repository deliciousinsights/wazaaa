import { expect } from 'chai'
import sinon from 'sinon'

import populateHelpers from './helpers'

const scope = {}
populateHelpers(scope)

describe('formatDate', () => {
  const { formatDate } = scope
  let clock

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should use French', () => {
    expect(formatDate(new Date())).to.contain('janvier')
  })

  it('should honor a custom format', () => {
    expect(formatDate(new Date(), 'YYYY-MM-DD')).to.equal('1970-01-01')
  })

  it('should default to current datetime', () => {
    expect(formatDate()).to.equal(formatDate(new Date()))
  })

  it('should default to a fixed, long-form format', () => {
    expect(formatDate(new Date())).to.equal('jeudi 1 janvier 1970 à 01:00')
  })

  it('should honor the `postedAt` property of its argument, if present', () => {
    expect(formatDate({ postedAt: 1459246921006 }, 'YYYY-MM-DD')).to.equal(
      '2016-03-29'
    )
  })
})

describe('pluralize', () => {
  const { pluralize } = scope

  it('should use untouched singular if below 2', () => {
    expect(pluralize(0, 'wombat')).to.equal('0 wombat')
    expect(pluralize(1, 'wombat')).to.equal('1 wombat')
    expect(pluralize(1, 'wombat', 'wizzbangs')).to.equal('1 wombat')
  })

  it('should use s-suffixed singular if above 1 and no custom plural', () => {
    expect(pluralize(2, 'wombat')).to.equal('2 wombats')
    expect(pluralize(42, 'wombat')).to.equal('42 wombats')
  })

  it('should use custom plural if provided and above 1', () => {
    expect(pluralize(3, 'axis', 'axes')).to.equal('3 axes')
  })
})
