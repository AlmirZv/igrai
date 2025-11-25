import http from "http";
import { State } from "./State";
import { app } from "./app";
import { Server } from "socket.io";
import { socketConnectionHandler } from "./socket/index";

export const server = http.createServer(app);

export const socketServer = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  },
})
console.log("[socket]: Socket initialised.");
socketServer.on("connection", socketConnectionHandler(socketServer));

export async function startServer() {
  return new Promise((resolve) => {
    server.listen(State.PORT, () => {
      console.log('[server]: started on port ' + State.PORT)
      console.log(
        `📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
      );

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

