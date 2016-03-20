// Contrôleur des accès
// ====================
//
// Dans cette application, on auto-crée les profils sur base des authentifications
// dans les réseaux sociaux, et on ne permet pas ensuite des modifier ou de les fusionner.
// C'est *très* minimaliste, mais on est pressés par le temps et on ne part pas sur la base
// du [Hackathon Starter](https://github.com/sahat/hackathon-starter)…
import { Router } from 'express'
import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'

import User from '../models/User'

// Activer Passport repose sur 4 étapes :
//
// 1. Configurer des stratégies d'authentification (au moins une)
// 2. Associer ces stratégies à des routes (pour de l'OAuth, une route pour demander
//    l'authentification et une pour traiter le callback en redirection)
// 3. Activer le middleware principal qui va gérer la session sérialisée d'authentification
// 4. Fournir les codes de sérialisation/désérialisation vers/depuis la session.
//
// Voici déjà la configuration de la stratégie Twitter.
passport.use(
  new TwitterStrategy(
    {
      // **Ne partagez pas ces clés Twitter n'importe où : [faites les vôtres](https://dev.twitter.com/apps/new) !**
      consumerKey: '0mC7OanUtfH0ZHOn7xD7Aw',
      consumerSecret: 'Ch8Fy2bFgIMnnlPyB9stgTkwO06yOu4Of3PjhiDaXA',
      callbackURL: '/users/auth/twitter/callback',
    },
    (token, tokenSecret, profile, done) => {
      User.findOrCreateByAuth(
        `@${profile.username}`,
        profile.displayName,
        'twitter',
        done
      )
    }
  )
)

// …et la stratégie Facebook
passport.use(
  new FacebookStrategy(
    {
      // **Ne partagez pas ces clés Facebook n'importe où : [faites les vôtres](https://developers.facebook.com/) !**
      clientID: '213376528865347',
      clientSecret: '753494ad3c02f9d9b5fb3617bbd88c1e',
      callbackURL: '/users/auth/facebook/callback',
    },
    (token, tokenSecret, profile, done) => {
      User.findOrCreateByAuth(profile.id, profile.displayName, 'facebook', done)
    }
  )
)

// Sérialisation du résultat de callback des stratégies dans la session.
// Ici on fait en sorte que `User.findOrCreateByAuth` renvoie juste le champ `_id`, ça facilite les choses…
passport.serializeUser((id, done) => {
  done(null, id)
})

// Désérialisation de la session en un vrai modèle (ici `User`), ce qui permettra à Passport de peupler
// `req.user` à l'aide de son middleware principal.
passport.deserializeUser((id, done) => {
  User.findById(id, done)
})

// Chaque contrôleur exporte un routeur Express.
const router = new Router()

// On standardise les routes de tous nos providers OAuth, autant faire une boucle…
for (const provider of ['twitter', 'facebook']) {
  router.get(`/get-in/${provider}`, passport.authenticate(provider))
  router.get(
    `/auth/${provider}/callback`,
    passport.authenticate(provider, {
      successRedirect: '/entries',
      failureRedirect: '/',
      failureFlash: true,
    })
  )
}

router.get('/logout', logout)

function logout(req, res) {
  // `req.logout()` est injectée par le middleware principal de Passport,
  // ce n'est pas une méthode fournie par Express…
  req.logout()
  req.flash('success', 'Vous avez bien été déconnecté·e')
  res.redirect('/')
}

export default router
