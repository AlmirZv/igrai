import { Server, Socket } from "socket.io";
import { UserSocketHandler } from "./user.socket";
import { BotSocketHandler } from "./bot.socket";
import { BotManager } from "../bot/botManager";
import { db } from "../config/firebase";

export const socketConnectionHandler = (io: Server) => (socket: Socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${io.sockets.sockets.size}`);

  // Регистрируем обработчики событий
  console.log(`📝 Registering event handlers for socket: ${socket.id}`);
  UserSocketHandler.register(io, socket);
  BotSocketHandler.register(io, socket);
  console.log(`✅ Event handlers registered for socket: ${socket.id}`);

  socket.on("disconnect", async (reason) => {
    try {
      // Получаем userId из данных сокета, если он был сохранен при регистрации
      const userId = (socket as any).data?.userId || socket.id;

      console.log(
        `Client disconnected: ${socket.id} (userId: ${userId}), reason: ${reason}`
      );

      // Пытаемся обновить статус в Firestore, но не критично если не получится
      try {
        await db.collection("users").doc(userId).update({
          connected: false,
          lastSeen: Date.now(),
        });
      } catch (firestoreError) {
        // Игнорируем ошибки Firestore при disconnect (могут быть проблемы с credentials)
        console.warn(
          `⚠️ Could not update user status in Firestore for ${userId}:`,
          firestoreError
        );
      }

      // Remove bots for this user
      BotManager.removeBotsForUser(userId);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  });
};
