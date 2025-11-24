import { Server, Socket } from "socket.io"

export const socketConnectionHandler = (io: Server) => (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // here regiser handlers

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
}
