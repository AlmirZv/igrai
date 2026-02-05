import { ref } from "vue";
import { mindarApi } from "@/api/mindar.api";

export function useMindar() {

  const loading = ref(false);
  const error = ref<string | null>(null);
  const mindId = ref<string | null>(null);

  async function uploadTarget(file: File) {
    loading.value = true;
    error.value = null;

    try {
      const res = await mindarApi.uploadImage(file);
      mindId.value = res.data.mindId;
      return res.data;

    } catch (e: any) {
      error.value = e.response?.data?.error || "Upload failed";
      throw e;

    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    mindId,
    uploadTarget,
  };
}
