import { Server, Socket } from "socket.io"
import { UserSocketHandler } from "./user.socket";
import { BotSocketHandler } from "./bot.socket";
import { BotManager } from "../bot/botManager";
import { db } from "../config/firebase";


export const socketConnectionHandler = (io: Server) => (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  UserSocketHandler.register(io, socket);
  BotSocketHandler.register(io, socket);

  socket.on("disconnect", async (reason) => {
    try {
      const userId = socket.id; // You might want to store userId in socket data

      // Mark user as disconnected
      await db.collection("users").doc(userId).update({
        connected: false,
        lastSeen: Date.now(),
      });

      // Remove bots for this user
      BotManager.removeBotsForUser(userId);

      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  });
}

