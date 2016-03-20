// Application principale
// ======================
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

// Mongoose exige désormais qu’on fournisse notre propre implémentation de promesses,
// plutôt que l’ancienne `mpromise` intégrée.  On se cale sur les promesses natives
// dès maintenant, pour ne pas polluer tant le serveur que les tests.
mongoose.Promise = Promise

// Crée le conteneur principal de web app (`app`), connecte le serveur HTTP dessus
// (`server`) et détermine le chemin complet des assets statiques.
const app = express()
const isDev = app.get('env') === 'development'
const isTest = app.get('env') === 'test'
const publicPath = path.resolve(__dirname, '../public')

// Configuration
// -------------

app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'pug')

// Fichiers statiques.  En le chargeant tôt, on court-circuite immédiatement
// le reste des middlewares en cas de fichier statique…
app.use(express.static(publicPath))
app.use(parseHTMLForms({ extended: true }))
app.use(methodOverride((req) => req.body._method))

if (!isTest) {
  app.use(createLogger(isDev ? 'dev' : 'combined'))
}

// `cookieSession` stocke la session complète en cookie, pas en mémoire serveur,
// ce qui résiste aux redémarrages (notamment en dev avec `nodemon`) mais pose des
// contraintes de taille (4Ko max JSONifié + base64-encodé).
app.use(
  cookieSession({
    name: 'wazaaa:session',
    secret: 'Node.js c’est de la balle !',
  })
)
if (!isTest) {
  app.use(csrfProtect())
}

// Rien à voir avec Adobe Flash!  Ce sont des flashes de session--des messages qui ne
// sont retenus que jusqu’au prochain render de la session.
app.use(flash())
// Authentification avec [Passport](http://passportjs.com)
app.use(passport.initialize())
app.use(passport.session())

// Variables automatiques dans les vues
// ------------------------------------

// Variables locales partagées par toutes les vues
app.locals.title = 'Wazaaa'
app.locals.__assets = JSON.parse(
  readFileSync(path.resolve(publicPath, 'manifest.json'), 'utf-8')
)

// Helpers pour nos vues
populateHelpers(app.locals)

// Configuration uniquement hors production
if (isDev) {
  // Variable spéciale utilisée par Jade pour ne pas minifier le HTML
  app.locals.pretty = true
}

// Rend l’URL, le flash, les paramètres de requête et l’utilisateur courant
// accessibles à toutes les vues
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

// Middlewares et routes applicatifs
// ---------------------------------

app.use(mainController)
app.use('/entries', entriesController)
app.use('/users', usersController)

export default app
