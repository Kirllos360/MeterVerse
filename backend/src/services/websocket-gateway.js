import { Server } from "socket.io"
import jwt from "jsonwebtoken"

let io = null

export function initWebSocket(server) {
  io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN || "http://localhost:7400", credentials: true },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error("Authentication required"))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = decoded
      next()
    } catch {
      next(new Error("Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    socket.join("user:" + socket.user.sub)
    socket.join("role:" + socket.user.role)

    socket.on("disconnect", () => {
    })
  })
  return io
}

export function getIO() {
  return io
}

export function notifyUser(userId, event, data) {
  if (io) io.to("user:" + userId).emit(event, data)
}

export function notifyRole(role, event, data) {
  if (io) io.to("role:" + role).emit(event, data)
}

export function broadcast(event, data) {
  if (io) io.emit(event, data)
}
