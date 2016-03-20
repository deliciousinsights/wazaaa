import chalk from 'chalk'
import { createServer } from 'http'

import app from './app'

const PORT = Number(process.env.PORT) || 3000

const server = createServer(app)
server.listen(PORT, () => {
  console.log(chalk`{green ✔ Server listening on port} {cyan ${PORT}}`)
})
