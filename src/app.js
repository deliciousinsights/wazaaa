import { urlencoded as parseHTMLForms } from 'body-parser'
import flash from 'connect-flash'
import cookieSession from 'cookie-session'
import csrfProtect from 'csurf'
import express from 'express'
import { readFileSync } from 'fs'
import methodOverride from 'method-override'
import mongoose from 'mongoose'
import createLogger from 'morgan'
import passport from 'passport'
import path from 'path'

import populateHelpers from './common/helpers'
import entriesController from './controllers/entries'
import mainController from './controllers/main'
import usersController from './controllers/users'

mongoose.Promise = Promise

const app = express()
const isDev = app.get('env') === 'development'
const isTest = app.get('env') === 'test'
const publicPath = path.resolve(__dirname, '../public')

app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static(publicPath))
app.use(parseHTMLForms({ extended: true }))
app.use(methodOverride((req) => req.body._method))

if (!isTest) {
  app.use(createLogger(isDev ? 'dev' : 'combined'))
}

app.use(
  cookieSession({
    name: 'wazaaa:session',
    secret: 'Node.js c’est de la balle !',
  })
)
if (!isTest) {
  app.use(csrfProtect())
}

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.locals.title = 'Wazaaa'
app.locals.__assets = JSON.parse(
  readFileSync(path.resolve(publicPath, 'manifest.json'), 'utf-8')
)

populateHelpers(app.locals)

if (isDev) {
  app.locals.pretty = true
}

app.use((req, res, next) => {
  const { query, url, user } = req
  Object.assign(res.locals, {
    csrfToken: (isTest && '__TEST__') || req.csrfToken(),
    flash: req.flash(),
    query,
    url,
    user,
  })
  next()
})

app.use(mainController)
app.use('/entries', entriesController)
app.use('/users', usersController)

export default app