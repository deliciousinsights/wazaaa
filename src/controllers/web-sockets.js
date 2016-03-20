// Activation des Web Sockets
// ==========================

// Ce n'est pas à proprement parler un contrôleur, mais comme ces derniers,
// il attache des fonctionnalités au serveur ou à l'application.  Par ailleurs,
// en fournissant un point d'accès central encapsulé aux connexions WS, il évite
// de « pourrir » `app` ou `server` avec des propriétés que les contrôleurs
// exploitants devraient stocker dans leur *closure*.  Voyez `controllers/entries.js`
// et sa fonction `createEntry` pour l'utilisation de ce singleton.

import io from 'socket.io'

let sockets

export default function attachWebSockets(server) {
  // On nous appelle plusieurs fois ?  Ignorons les appels superflus !
  if (sockets) {
    return
  }

  // On attache toute la gestion des WS (URLs `/socket.io/`* au serveur).
  const ws = io(server)
  sockets = ws.sockets
}

export function broadcast(...args) {
  if (sockets) {
    sockets.emit(...args)
  }
}
