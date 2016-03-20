import io from 'socket.io'

let sockets

export default function attachWebSockets(server) {
  if (sockets) {
    return
  }

  const ws = io(server)
  sockets = ws.sockets
}

export function broadcast(...args) {
  if (sockets) {
    sockets.emit(...args)
  }
}
