// Point d’entrée du serveur
// =========================
import chalk from 'chalk'
import { createServer } from 'http'

import app from './app'
import attachWebSockets from './controllers/web-sockets'
import dbConnect from './models/connection'

// Connexion à la base
dbConnect(() => {
  console.log(chalk`{green ✔ Connection established to mongoDB database}`)

  // Configuration et middleware pour tous les environnements (dev, prod, etc.)
  const PORT = Number(process.env.PORT) || 3000

  // Crée le conteneur principal de web app (`app`), connecte le serveur HTTP dessus
  // (`server`) et détermine le chemin complet des assets statiques.
  const server = createServer(app)
  // Activation de Socket.IO et mise à disposition au travers d'un
  // singleton.
  attachWebSockets(server)
  // Lancement effectif du serveur en écoutant sur le bon port pour des
  // connexions HTTP entrantes.  Le port par défaut est 3000 (voir plus haut).
  server.listen(PORT, () => {
    console.log(chalk`{green ✔ Server listening on port} {cyan ${PORT}}`)
  })
})
