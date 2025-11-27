import { BotManager } from "../bot/botManager";
import { SocketWrapper } from "./SocketWrapper";

export const BotSocketHandler = new SocketWrapper('BotEvent');

BotSocketHandler.add(
  "create",
  async (
    _io, socket,
    data: {
      userId: string;
      radius?: number;
      userLocation?: { latitude: number; longitude: number };
    }) => {
    try {
      const radius = data.radius || 1000; // Default 1km radius

      // Use provided user location or default to Moscow
      const userLocation = data.userLocation || {
        latitude: 55.7558,
        longitude: 37.6176,
      };

      const botId = BotManager.createBotForUser(
        data.userId,
        userLocation,
        radius
      );

      console.log(
        `🤖 Bot created for user ${data.userId} at location:`,
        userLocation
      );

      return { botId, radius }
    } catch (error) {
      console.error("Bot creation error:", error);
      socket.emit("error", { message: "Failed to create bot" });
    }
  }
);

// Handle bot removal
BotSocketHandler.add("remove", async (io, socket, data: { botId: string }) => {
  try {
    BotManager.removeBot(data.botId);
    console.log(`🤖 Bot removed: ${data.botId}`);
  } catch (error) {
    console.error("Bot removal error:", error);
    socket.emit("error", { message: "Failed to remove bot" });
  }
});

// Handle get bots for user
BotSocketHandler.add("getForUser", async (io, socket, data: { userId: string }) => {
  try {
    const bots = BotManager.getBotsForUser(data.userId);
    return { userId: data.userId, bots }
  } catch (error) {
    console.error("Get bots error:", error);
    socket.emit("error", { message: "Failed to get bots" });
  }
});

