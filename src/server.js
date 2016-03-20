import chalk from 'chalk'
import { createServer } from 'http'

const server = createServer((req, res) => {
  res.end('WAZAAA!')
})

server.listen(3000, () => {
  console.log(chalk`{green ✔ Server listening on port} {cyan 3000}`)
})
