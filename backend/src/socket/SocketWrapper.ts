import { Server, Socket } from "socket.io";

interface SocketEventDescription {
  event: string;
  handler: (io: Server, socket: Socket, ...payload: any[]) => {}
}

interface SocketResult {
  status: string;
  data: any;
  error: null | any;
  event: string
}

export class SocketWrapper {
  namespace = ''
  _handlers: SocketEventDescription[] = []

  constructor(namespace: string) {
    this.namespace = namespace;
    this._handlers = [];
  }

  /*
   * Добавить обработчик событий
   * @param {String} event 
   * @param {function} handler
   * */
  add(event: string, handler = async (io: Server, socket: Socket, payload: any) => { }) {
    this._handlers.push({ event, handler })
  }

  async register(io: Server, socket: Socket) {
    this._handlers.forEach((desc) => {
      const event = this.namespace ? this.namespace + ':' + desc.event : desc.event;

      socket.on(event, async function (...payload) {
        const result: SocketResult = {
          status: 'ok',
          data: null,
          error: null,
          event
        }

        let cb = payload.at(-1);

        if (typeof cb !== 'function') cb = null;


        try {
          const data = await desc.handler(io, socket, ...payload);
          result.data = data || null;
        } catch (error) {
          console.log(error);

          result.status = 'error';
          result.error = error;

          // тут можно оповестить админа об ошибке в сокете
        } finally {
          if (cb) {
            cb(result);
          } else socket.emit('error', result);
        }
      })
    })
  }
}
