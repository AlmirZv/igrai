import { socketServer } from "../server";

interface BotUser {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  };
  isBot: boolean;
  targetUserId?: string;
  moveRadius: number; // in meters
  moveInterval: NodeJS.Timeout | null;
}

class BotManagerClass {
  private bots: Map<string, BotUser> = new Map();
  private userLocations: Map<string, { latitude: number; longitude: number }> =
    new Map();

  constructor() {
  }

  // Create a bot that follows a user within specified radius
  createBotForUser(
    userId: string,
    userLocation: { latitude: number; longitude: number },
    radius: number = 1000
  ): string {
    const botId = `bot_${userId}_${Date.now()}`;

    // Store user location
    this.userLocations.set(userId, userLocation);

    // Generate initial position within radius
    const initialLocation = this.generateLocationInRadius(userLocation, radius);

    const bot: BotUser = {
      id: botId,
      name: `Bot ${Math.floor(Math.random() * 1000)}`,
      location: {
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        accuracy: 10,
        timestamp: Date.now(),
      },
      isBot: true,
      targetUserId: userId,
      moveRadius: radius,
      moveInterval: null,
    };

    this.bots.set(botId, bot);
    this.startBotMovement(botId);

    console.log(`🤖 Bot created for user ${userId} at location:`, userLocation);
    return botId;
  }

  // Start bot movement
  private startBotMovement(botId: string): void {
    const bot = this.bots.get(botId);
    if (!bot) return;

    // Move bot every 3-8 seconds
    const moveInterval = Math.random() * 5000 + 3000;

    bot.moveInterval = setInterval(() => {
      this.moveBot(botId);
    }, moveInterval);

    console.log(`🤖 Bot ${botId} started moving`);
  }

  // Move bot to new position within radius
  private moveBot(botId: string): void {
    const bot = this.bots.get(botId);
    if (!bot || !bot.targetUserId) return;

    // Get current user location (in real app, this would come from database)
    // For now, we'll use a mock location or get it from connected users
    const userLocation = this.getUserLocation(bot.targetUserId);
    if (!userLocation) return;

    // Generate new position within radius
    const newLocation = this.generateLocationInRadius(
      userLocation,
      bot.moveRadius
    );

    // Update bot location
    bot.location = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      accuracy: 10,
      timestamp: Date.now(),
    };

    // Broadcast bot location update
    socketServer.emit("locationUpdate", {
      userId: botId,
      location: bot.location,
      isBot: true,
      name: bot.name,
    });

    console.log(`🤖 Bot ${botId} moved to:`, bot.location);
  }

  // Generate random location within radius
  private generateLocationInRadius(
    center: { latitude: number; longitude: number },
    radiusMeters: number
  ): { latitude: number; longitude: number } {
    // Convert radius from meters to degrees (approximate)
    const radiusDegrees = radiusMeters / 111000; // 1 degree ≈ 111km

    // Generate random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusDegrees;

    // Calculate new position
    const newLat = center.latitude + distance * Math.cos(angle);
    const newLng = center.longitude + distance * Math.sin(angle);

    return {
      latitude: newLat,
      longitude: newLng,
    };
  }

  // Get user location
  private getUserLocation(
    userId: string
  ): { latitude: number; longitude: number } | null {
    // Get stored user location or return default
    return (
      this.userLocations.get(userId) || {
        latitude: 55.7558,
        longitude: 37.6176,
      }
    );
  }

  // Update user location for bot tracking
  updateUserLocation(
    userId: string,
    location: { latitude: number; longitude: number }
  ): void {
    // Store updated user location
    this.userLocations.set(userId, location);

    // Find bots tracking this user
    for (const [botId, bot] of this.bots) {
      if (bot.targetUserId === userId) {
        // Bot will automatically move based on new user location
        console.log(
          `🤖 Bot ${botId} tracking user ${userId} location update:`,
          location
        );
      }
    }
  }

  // Remove bot
  removeBot(botId: string): void {
    const bot = this.bots.get(botId);
    if (bot && bot.moveInterval) {
      clearInterval(bot.moveInterval);
    }
    this.bots.delete(botId);
    console.log(`🤖 Bot ${botId} removed`);
  }

  // Remove all bots for a user
  removeBotsForUser(userId: string): void {
    for (const [botId, bot] of this.bots) {
      if (bot.targetUserId === userId) {
        this.removeBot(botId);
      }
    }
  }

  // Get all bots
  getAllBots(): BotUser[] {
    return Array.from(this.bots.values());
  }

  // Get bots for specific user
  getBotsForUser(userId: string): BotUser[] {
    return Array.from(this.bots.values()).filter(
      (bot) => bot.targetUserId === userId
    );
  }
}

export const BotManager = new BotManagerClass();
