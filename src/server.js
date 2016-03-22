import chalk from 'chalk'
import express from 'express'
import { readFileSync } from 'fs'
import { createServer } from 'http'
import createLogger from 'morgan'
import path from 'path'

import mainController from './controllers/main'

const app = express()
const server = createServer(app)
const PORT = Number(process.env.PORT) || 3000
const isDev = app.get('env') === 'development'
const publicPath = path.resolve(__dirname, '../public')

app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.static(publicPath))
app.use(createLogger(isDev ? 'dev' : 'combined'))

app.locals.title = 'Wazaaa'

app.locals.__assets = JSON.parse(
  readFileSync(path.resolve(publicPath, 'manifest.json'), 'utf-8')
)

if (isDev) {
  app.locals.pretty = true
}

app.use((req, res, next) => {
  res.locals.flash = []
  res.locals.url = req.url
  next()
})

app.use(mainController)

server.listen(PORT, () => {
  console.log(chalk`{green ✔ Server listening on port} {cyan ${PORT}}`)
})
