import { Router } from 'express'
import passport from 'passport'
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
      console.log(
        `token: ${token}\ntokenSecret: ${tokenSecret}\nprofile:`,
        profile
      )
      User.findOrCreateByAuth(
        `@${profile.username}`,
        profile.displayName,
        'twitter',
        done
      )
    }
  )
)

const router = new Router()

export default router
