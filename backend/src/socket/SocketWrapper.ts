import { Server, Socket } from "socket.io";

interface SocketEventDescription {
  event: string;
  handler: (io: Server, socket: Socket, ...payload: any[]) => any;
}

interface SocketResult {
  status: string;
  data: any;
  error: null | any;
  event: string;
}

export class SocketWrapper {
  namespace = "";
  _handlers: SocketEventDescription[] = [];

  constructor(namespace: string) {
    this.namespace = namespace;
    this._handlers = [];
  }

  /*
   * Добавить обработчик событий
   * @param {String} event
   * @param {function} handler
   * */
  add(
    event: string,
    handler = async (
      io: Server,
      socket: Socket,
      payload: any
    ): Promise<any> => {}
  ) {
    this._handlers.push({ event, handler });
  }

  async register(io: Server, socket: Socket) {
    console.log(
      `📋 Registering ${this._handlers.length} handlers for namespace: ${
        this.namespace || "default"
      }`
    );
    this._handlers.forEach((desc) => {
      const event = this.namespace
        ? this.namespace + ":" + desc.event
        : desc.event;

      console.log(`  📌 Registering handler for event: ${event}`);
      socket.on(event, async function (...payload) {
        console.log(`📥 Received event: ${event}`, payload);

        const result: SocketResult = {
          status: "ok",
          data: null,
          error: null,
          event,
        };

        let cb = payload.at(-1);

        if (typeof cb !== "function") cb = null;

        // Убираем callback из payload перед передачей в handler
        const dataPayload = cb ? payload.slice(0, -1) : payload;

        try {
          const data = await desc.handler(io, socket, ...dataPayload);
          result.data = data || null;
          console.log(`✅ Event ${event} handled successfully`);
        } catch (error) {
          console.error(`❌ Error handling event ${event}:`, error);

          result.status = "error";
          result.error = error;

          // тут можно оповестить админа об ошибке в сокете
        } finally {
          if (cb) {
            cb(result);
          }
        }
      });
    });
  }
}
