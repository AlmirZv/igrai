import { BotManager } from "../bot/botManager";
import { db } from "../config/firebase";
import { LocationData } from "../types/default";
import { SocketWrapper } from "./SocketWrapper";

export const UserSocketHandler = new SocketWrapper("UserEvent");

interface UserData {
  id: string;
  name?: string;
  location?: LocationData;
  connected: boolean;
  lastSeen: number;
}

UserSocketHandler.add(
  "register",
  async (io, socket, userData: { id: string; name?: string }) => {
    try {
      console.log(`📝 Registering user:`, userData);

      const user: UserData = {
        id: userData.id,
        name: userData.name,
        connected: true,
        lastSeen: Date.now(),
      };

      // Save user to Firestore
      console.log(`💾 Saving user to Firestore: ${userData.id}`);
      await db.collection("users").doc(userData.id).set(user, { merge: true });
      console.log(`✅ User saved to Firestore: ${userData.id}`);

      // Сохраняем userId в данных сокета для последующего использования
      (socket as any).data = {
        ...((socket as any).data || {}),
        userId: userData.id,
      };

      socket.join(`user:${userData.id}`);
      socket.emit("registered", { success: true, userId: userData.id });

      console.log(`✅ User registered: ${userData.id}`);
    } catch (error) {
      console.error("❌ Registration error:", error);
      socket.emit("error", { message: "Failed to register user" });
    }
  }
);

// Handle location updates
UserSocketHandler.add(
  "locationUpdate",
  async (io, socket, locationData: LocationData) => {
    try {
      console.log(`📍 Location update received:`, locationData);

      // Используем userId из locationData, если он есть и не равен 'me'
      // Иначе используем socket.id, но это не идеально - лучше всегда передавать userId
      let userId: string = locationData.userId || "";

      // Если userId равен 'me' или не указан, пытаемся получить из socket.data или используем socket.id
      if (!userId || userId === "me") {
        // Пытаемся получить userId из данных сокета (если он был сохранен при регистрации)
        userId = (socket as any).data?.userId || socket.id;
        console.log(`🔄 Using userId from socket.data: ${userId}`);
      }

      // Убеждаемся, что userId всегда строка
      if (!userId) {
        userId = socket.id;
        console.log(`⚠️ Using socket.id as userId: ${userId}`);
      }

      console.log(`👤 Processing location update for userId: ${userId}`);

      // Обновляем статус connected при обновлении местоположения
      console.log(`💾 Updating user location in Firestore: ${userId}`);
      try {
        await db
          .collection("users")
          .doc(userId)
          .update({
            location: {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy,
              timestamp: locationData.timestamp || Date.now(),
            },
            connected: true,
            lastSeen: Date.now(),
          });
        console.log(`✅ User location updated in Firestore: ${userId}`);
      } catch (firestoreError) {
        console.error(
          `❌ Firestore update error for ${userId}:`,
          firestoreError
        );
        // Продолжаем выполнение, даже если Firestore не работает
      }

      // Update bot manager with user location
      BotManager.updateUserLocation(userId, {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      // Получаем информацию о пользователе для отправки
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : null;

      // Broadcast location to all connected clients
      const broadcastData = {
        userId,
        name: userData?.name || "Пользователь",
        avatar: userData?.avatar || "",
        location: {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          timestamp: locationData.timestamp || Date.now(),
        },
        isBot: false,
      };

      console.log(
        `📡 Broadcasting location update from ${userId} to all clients:`,
        broadcastData
      );
      io.emit("locationUpdate", broadcastData);
      console.log(
        `✅ Location update broadcasted to ${io.sockets.sockets.size} connected clients`
      );
    } catch (error) {
      console.error("Location update error:", error);
      socket.emit("error", { message: "Failed to update location" });
    }
  }
);

// Handle chat messages
UserSocketHandler.add(
  "message",
  async (
    io,
    socket,
    messageData: {
      text: string;
      userId: string;
      timestamp: number;
    }
  ) => {
    try {
      const message = {
        ...messageData,
        id: socket.id + "_" + Date.now(),
        timestamp: Date.now(),
      };

      // Save message to Firestore
      await db.collection("messages").add(message);

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
UserSocketHandler.add(
  "startTracking",
  async (
    io,
    socket,
    trackingData: { userId: string; targetUserId?: string }
  ) => {
    try {
      const trackingId = `tracking_${Date.now()}`;

      // Create tracking session
      await db.collection("tracking").doc(trackingId).set({
        id: trackingId,
        trackerId: trackingData.userId,
        targetId: trackingData.targetUserId,
        startTime: Date.now(),
        active: true,
      });

      socket.emit("trackingStarted", { trackingId });
      console.log(`Tracking started: ${trackingId}`);
    } catch (error) {
      console.error("Tracking error:", error);
      socket.emit("error", { message: "Failed to start tracking" });
    }
  }
);

// Handle stop tracking
UserSocketHandler.add(
  "stopTracking",
  async (io, socket, data: { trackingId: string }) => {
    try {
      await db.collection("tracking").doc(data.trackingId).update({
        active: false,
        endTime: Date.now(),
      });

      socket.emit("trackingStopped", { trackingId: data.trackingId });
      console.log(`Tracking stopped: ${data.trackingId}`);
    } catch (error) {
      console.error("Stop tracking error:", error);
      socket.emit("error", { message: "Failed to stop tracking" });
    }
  }
);

// Handle get nearby users
UserSocketHandler.add(
  "getNearbyUsers",
  async (
    io,
    socket,
    data: {
      latitude: number;
      longitude: number;
      radius: number; // in meters
    }
  ) => {
    try {
      let nearbyUsers: any[] = [];

      // This is a simplified implementation
      // In production, you'd use GeoFirestore or similar for geospatial queries
      const usersSnapshot = await db
        .collection("users")
        .where("connected", "==", true)
        .get();

      usersSnapshot.forEach((doc: any) => {
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

      socket.emit("nearbyUsers", nearbyUsers);
    } catch (error) {
      console.error("Get nearby users error:", error);
      socket.emit("error", { message: "Failed to get nearby users" });
    }
  }
);

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
