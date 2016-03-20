import authenticator from 'passport'

const LAYER_ID = '::passport:stub'

function stubPassport(app) {
  const stack = app._router.stack
  let backups = null
  if (!stack.some((layer) => layer.name === LAYER_ID)) {
    stack.unshift({
      handle: stubbedPassportMiddleware,
      handle_request: stubbedPassportMiddleware,
      match: () => true,
      name: LAYER_ID,
      path: '',
    })
    backups = {
      _deserializers: authenticator._deserializers,
      _serializers: authenticator._serializers,
    }
    authenticator._deserializers.splice(0, +Infinity, (user, done) =>
      done(null, user)
    )
    authenticator._serializers.splice(0, +Infinity, (user, done) =>
      done(null, user)
    )
  }

  let activeUser = null

  return {
    login,
    logIn: login,
    logout,
    logOut: logout,
    uninstall: uninstalledStubbedPassportMiddleware,
  }

  function login(user) {
    activeUser = user
  }

  function logout() {
    activeUser = null
  }

  function stubbedPassportMiddleware(req, res, next) {
    const passport = {
      _userProperty: 'user',
      _key: 'passport',
    }

    Object.defineProperty(req, '_passport', {
      get() {
        return {
          get instance() {
            return passport
          },
          get session() {
            return { user: activeUser }
          },
        }
      },
    })
    next()
  }

  function uninstalledStubbedPassportMiddleware() {
    const indices = stack.reduce((acc, layer, index) => {
      if (layer.name === LAYER_ID) {
        acc.push(index)
      }
      return acc
    }, [])
    indices.reverse().forEach((index) => stack.splice(index, 1))
    authenticator._deserializers.splice(0, +Infinity, ...backups._deserializers)
    authenticator._serializers.splice(0, +Infinity, ...backups._serializers)
  }
}

export { stubPassport as stub }
export default stubPassport
