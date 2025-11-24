import { Socket } from "socket.io";
import { Server } from "socket.io";
import { getFirestoreInstance } from "../config/firebase";
import BotManager from "../bot/botManager";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
  userId?: string;
}

interface UserData {
  id: string;
  name?: string;
  location?: LocationData;
  connected: boolean;
  lastSeen: number;
}

// Global bot manager instance
let botManager: BotManager | null = null;

export const setupSocketHandlers = (socket: Socket, io: Server) => {
  let db;
  try {
    db = getFirestoreInstance();
  } catch (error) {
    console.warn("⚠️  Firebase not available, running in mock mode");
    db = null;
  }

  // Initialize bot manager if not already done
  if (!botManager) {
    botManager = new BotManager(io);
  }

  // Handle user registration
  socket.on("register", async (userData: { id: string; name?: string }) => {
    try {
      const user: UserData = {
        id: userData.id,
        name: userData.name,
        connected: true,
        lastSeen: Date.now(),
      };

      if (db) {
        // Save user to Firestore
        await db
          .collection("users")
          .doc(userData.id)
          .set(user, { merge: true });
      } else {
        console.log("📝 Mock mode: User data not saved to database");
      }

      socket.join(`user:${userData.id}`);
      socket.emit("registered", { success: true, userId: userData.id });

      console.log(`User registered: ${userData.id}`);
    } catch (error) {
      console.error("Registration error:", error);
      socket.emit("error", { message: "Failed to register user" });
    }
  });

  // Handle location updates
  socket.on("locationUpdate", async (locationData: LocationData) => {
    try {
      const userId = locationData.userId || socket.id;

      if (db) {
        // Update user location in Firestore
        await db.collection("users").doc(userId).update({
          location: locationData,
          lastSeen: Date.now(),
        });
      } else {
        console.log("📝 Mock mode: Location data not saved to database");
      }

      // Update bot manager with user location
      if (botManager) {
        botManager.updateUserLocation(userId, {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      }

      // Broadcast location to all connected clients
      io.emit("locationUpdate", {
        userId,
        location: locationData,
        isBot: false,
      });

      console.log(`Location update from ${userId}:`, locationData);
    } catch (error) {
      console.error("Location update error:", error);
      socket.emit("error", { message: "Failed to update location" });
    }
  });

  // Handle chat messages
  socket.on(
    "message",
    async (messageData: {
      text: string;
      userId: string;
      timestamp: number;
    }) => {
      try {
        const message = {
          ...messageData,
          id: socket.id + "_" + Date.now(),
          timestamp: Date.now(),
        };

        if (db) {
          // Save message to Firestore
          await db.collection("messages").add(message);
        } else {
          console.log("📝 Mock mode: Message not saved to database");
        }

        // Broadcast message to all clients
        io.emit("message", message);

        console.log(`Message from ${messageData.userId}:`, messageData.text);
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    }
  );

  // Handle tracking requests
  socket.on(
    "startTracking",
    async (trackingData: { userId: string; targetUserId?: string }) => {
      try {
        const trackingId = `tracking_${Date.now()}`;

        if (db) {
          // Create tracking session
          await db.collection("tracking").doc(trackingId).set({
            id: trackingId,
            trackerId: trackingData.userId,
            targetId: trackingData.targetUserId,
            startTime: Date.now(),
            active: true,
          });
        } else {
          console.log("📝 Mock mode: Tracking session not saved to database");
        }

        socket.emit("trackingStarted", { trackingId });
        console.log(`Tracking started: ${trackingId}`);
      } catch (error) {
        console.error("Tracking error:", error);
        socket.emit("error", { message: "Failed to start tracking" });
      }
    }
  );

  // Handle stop tracking
  socket.on("stopTracking", async (data: { trackingId: string }) => {
    try {
      if (db) {
        await db.collection("tracking").doc(data.trackingId).update({
          active: false,
          endTime: Date.now(),
        });
      } else {
        console.log("📝 Mock mode: Tracking stop not saved to database");
      }

      socket.emit("trackingStopped", { trackingId: data.trackingId });
      console.log(`Tracking stopped: ${data.trackingId}`);
    } catch (error) {
      console.error("Stop tracking error:", error);
      socket.emit("error", { message: "Failed to stop tracking" });
    }
  });

  // Handle get nearby users
  socket.on(
    "getNearbyUsers",
    async (data: {
      latitude: number;
      longitude: number;
      radius: number; // in meters
    }) => {
      try {
        let nearbyUsers: any[] = [];

        if (db) {
          // This is a simplified implementation
          // In production, you'd use GeoFirestore or similar for geospatial queries
          const usersSnapshot = await db
            .collection("users")
            .where("connected", "==", true)
            .get();

          usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            if (userData.location) {
              const distance = calculateDistance(
                data.latitude,
                data.longitude,
                userData.location.latitude,
                userData.location.longitude
              );

              if (distance <= data.radius) {
                nearbyUsers.push({
                  id: doc.id,
                  ...userData,
                  distance,
                });
              }
            }
          });
        } else {
          console.log("📝 Mock mode: Returning empty nearby users list");
          // Return mock data for development
          nearbyUsers = [
            {
              id: "mock_user_1",
              name: "Mock User 1",
              distance: 100,
              location: {
                latitude: data.latitude + 0.001,
                longitude: data.longitude + 0.001,
              },
            },
          ];
        }

        socket.emit("nearbyUsers", nearbyUsers);
      } catch (error) {
        console.error("Get nearby users error:", error);
        socket.emit("error", { message: "Failed to get nearby users" });
      }
    }
  );

  // Handle bot creation
  socket.on(
    "createBot",
    async (data: {
      userId: string;
      radius?: number;
      userLocation?: { latitude: number; longitude: number };
    }) => {
      try {
        if (!botManager) {
          socket.emit("error", { message: "Bot manager not available" });
          return;
        }

        const radius = data.radius || 1000; // Default 1km radius

        // Use provided user location or default to Moscow
        const userLocation = data.userLocation || {
          latitude: 55.7558,
          longitude: 37.6176,
        };

        const botId = botManager.createBotForUser(
          data.userId,
          userLocation,
          radius
        );

        socket.emit("botCreated", { botId, radius });
        console.log(
          `🤖 Bot created for user ${data.userId} at location:`,
          userLocation
        );
      } catch (error) {
        console.error("Bot creation error:", error);
        socket.emit("error", { message: "Failed to create bot" });
      }
    }
  );

  // Handle bot removal
  socket.on("removeBot", async (data: { botId: string }) => {
    try {
      if (!botManager) {
        socket.emit("error", { message: "Bot manager not available" });
        return;
      }

      botManager.removeBot(data.botId);
      socket.emit("botRemoved", { botId: data.botId });
      console.log(`🤖 Bot removed: ${data.botId}`);
    } catch (error) {
      console.error("Bot removal error:", error);
      socket.emit("error", { message: "Failed to remove bot" });
    }
  });

  // Handle get bots for user
  socket.on("getBotsForUser", async (data: { userId: string }) => {
    try {
      if (!botManager) {
        socket.emit("error", { message: "Bot manager not available" });
        return;
      }

      const bots = botManager.getBotsForUser(data.userId);
      socket.emit("botsForUser", { userId: data.userId, bots });
    } catch (error) {
      console.error("Get bots error:", error);
      socket.emit("error", { message: "Failed to get bots" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    try {
      const userId = socket.id; // You might want to store userId in socket data

      if (db) {
        // Mark user as disconnected
        await db.collection("users").doc(userId).update({
          connected: false,
          lastSeen: Date.now(),
        });
      } else {
        console.log("📝 Mock mode: User disconnect not saved to database");
      }

      // Remove bots for this user
      if (botManager) {
        botManager.removeBotsForUser(userId);
      }

      console.log(`User disconnected: ${userId}`);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  });
};

// Helper function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}
