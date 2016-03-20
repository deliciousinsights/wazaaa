import { Router } from 'express'
import passport from 'passport'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as TwitterStrategy } from 'passport-twitter'

import User from '../models/User'

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

passport.serializeUser((id, done) => {
  done(null, id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, done)
})

const router = new Router()

router.get('/get-in/twitter', passport.authenticate('twitter'))
router.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/entries',
    failureRedirect: '/',
    failureFlash: true,
  })
)

router.get('/logout', logout)

function logout(req, res) {
  req.logout()
  req.flash('success', 'Vous avez bien été déconnecté·e')
  res.redirect('/')
}

export default router
