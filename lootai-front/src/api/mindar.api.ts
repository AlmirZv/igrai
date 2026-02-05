import { api } from "./axios";

export const mindarApi = {

  uploadImage(file: File) {
    const form = new FormData();
    form.append("image", file);

    return api.post("/mindar/upload", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getMindFileUrl(id: string) {
    return `${api.defaults.baseURL}/mindar/file/${id}`;
  }

};
