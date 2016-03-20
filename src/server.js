import chalk from 'chalk'
import { createServer } from 'http'

import app from './app'
import attachWebSockets from './controllers/web-sockets'
import dbConnect from './models/connection'

const PORT = Number(process.env.PORT) || 3000

dbConnect(() => {
  console.log(chalk`{green ✔ Connection established to mongoDB database}`)

  const server = createServer(app)
  attachWebSockets(server)
  server.listen(PORT, () => {
    console.log(chalk`{green ✔ Server listening on port} {cyan ${PORT}}`)
  })
})
