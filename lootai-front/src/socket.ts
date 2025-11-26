import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.NODE_ENV === "production"
  ? undefined : import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const socket = io(URL, {
  autoConnect: false
});

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

export async function emitPromise(event: string, data: any) {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject('No socket connection.');
    } else {
      socket.emit(event, data, (response: any) => {
        if (response.error) {
          console.error(response);
          reject(response.error);
        } else {
          resolve(response);
        }
      });
    }
  });
}


