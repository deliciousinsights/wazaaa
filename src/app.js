import express from 'express'
import { readFileSync } from 'fs'
import createLogger from 'morgan'
import path from 'path'

import entriesController from './controllers/entries'
import mainController from './controllers/main'

const app = express()
const isDev = app.get('env') === 'development'
const isTest = app.get('env') === 'test'
const publicPath = path.resolve(__dirname, '../public')

app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static(publicPath))

if (!isTest) {
  app.use(createLogger(isDev ? 'dev' : 'combined'))
}

app.locals.title = 'Wazaaa'
app.locals.__assets = JSON.parse(
  readFileSync(path.resolve(publicPath, 'manifest.json'), 'utf-8')
)

if (isDev) {
  app.locals.pretty = true
}

app.use((req, res, next) => {
  const { query, url } = req
  Object.assign(res.locals, {
    flash: [],
    query,
    url,
  })
  next()
})

app.use(mainController)
app.use('/entries', entriesController)

export default app
