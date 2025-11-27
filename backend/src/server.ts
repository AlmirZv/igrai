import http from "http";
import { State } from "./State";
import { app } from "./app";
import { Server } from "socket.io";
import { socketConnectionHandler } from "./socket/index";

export const server = http.createServer(app);

export const socketServer = new Server(server, {
  cors: {
    origin: State.CORS_ORIGIN,
  },
})
console.log("[socket]: Socket initialised.");
socketServer.on("connection", socketConnectionHandler(socketServer));

export async function startServer() {
  return new Promise((resolve) => {
    server.listen(State.PORT, () => {
      console.log('[server]: started on port ' + State.PORT)
      resolve(null)
    });
  })
}
export async function closeServer() {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('[server]: closed')
      resolve(null);
    });
  })
}

