import { AssertionError } from 'chai'

export function didFlash(res, key, value = null) {
  const flash = getFlash(res)
  if (!(key in flash)) {
    const knownKeys = Object.keys(flash)
      .sort()
      .map((k) => `'${k}'`)
      .join(', ')
    throw new AssertionError(
      `Missing key '${key}' in flash (available keys: ${knownKeys})`
    )
  }

  if (value == null) {
    return
  }

  if (typeof value === 'string' && flash[key] !== value) {
    throw new AssertionError(
      `expected '${key}' flash '${value}', got '${flash[key]}'`
    )
  }

  if (value instanceof RegExp && !value.test(flash[key])) {
    throw new AssertionError(
      `expected '${key}' flash to match ${value}, got non-matching '${
        flash[key]
      }'`
    )
  }
}

export function getFlash(res) {
  return getSession(res).flash || {}
}

export function getSession(res) {
  const cookies = res.headers['set-cookie'] || []
  const cookie = cookies.find((s) => s.startsWith('wazaaa:session='))
  const b64 = cookie.match(/^wazaaa:session=(.+?);/)[1]
  if (!b64) return {}

  return JSON.parse(Buffer.from(b64, 'base64').toString())
}
