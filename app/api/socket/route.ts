import { Server } from "socket.io"

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: Server | null = null

export default function handler(req: any, res: any) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server)
    res.socket.server.io = io
    io.on("connection", (socket) => {
      // Join room by userId for targeted notifications
      socket.on("join", (userId: string) => {
        socket.join(userId)
      })
    })
  }
  res.end()
} 