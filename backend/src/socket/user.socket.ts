import { BotManager } from "../bot/botManager";
import { getFirestoreInstance } from "../config/firebase";
import { LocationData } from "../types/default";
import { SocketWrapper } from "./SocketWrapper";

export const UserSocketHandler = new SocketWrapper('UserEvent');

interface UserData {
  id: string;
  name?: string;
  location?: LocationData;
  connected: boolean;
  lastSeen: number;
}

let db;
try {
  db = getFirestoreInstance();
} catch (error) {
  console.warn("⚠️  Firebase not available, running in mock mode");
  db = null;
}

UserSocketHandler.add("register", async (io, socket, userData: { id: string; name?: string }) => {
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
})

// Handle location updates
UserSocketHandler.add("locationUpdate", async (io, socket, locationData: LocationData) => {
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
    BotManager.updateUserLocation(userId, {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });

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
UserSocketHandler.add(
  "message",
  async (io, socket, messageData: {
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
UserSocketHandler.add(
  "startTracking",
  async (io, socket, trackingData: { userId: string; targetUserId?: string }) => {
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
UserSocketHandler.add("stopTracking", async (io, socket, data: { trackingId: string }) => {
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
UserSocketHandler.add(
  "getNearbyUsers",
  async (io, socket, data: {
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






