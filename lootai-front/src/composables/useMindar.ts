import { ref } from "vue";
import { mindarApi } from "@/api/mindar.api";
import { isNativeBuild } from "@/config/api";

export function useMindar() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const mindId = ref<string | null>(null);

  /**
   * Загрузить одно изображение для генерации .mind
   */
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

  /**
   * Загрузить несколько изображений для генерации .mind.
   * В native build — асинхронный режим (polling), чтобы не рвать соединение на медленной сети.
   */
  async function uploadTargets(files: File[]): Promise<{ mindId?: string; mindUrl?: string }> {
    loading.value = true;
    error.value = null;

    try {
      if (isNativeBuild) {
        const uploadRes = await mindarApi.uploadImagesAsync(files);
        const data = uploadRes?.data;
        // Бэкенд может вернуть jobId или job_id
        const jobId = data?.jobId ?? data?.job_id;
        console.log("[MindAR] Upload response:", JSON.stringify(data), "jobId:", jobId);

        if (!jobId) {
          console.error("[MindAR] No jobId in response. Full response:", data);
          throw new Error(`No jobId from server. Response: ${JSON.stringify(data)}`);
        }

        const pollInterval = 2500;
        const maxAttempts = 240;
        for (let i = 0; i < maxAttempts; i++) {
          try {
            const statusRes = await mindarApi.getJobStatus(jobId);
            const statusData = statusRes?.data ?? {};
            const status = statusData.status ?? statusData.state;
            const id = statusData.mindId ?? statusData.mind_id;
            const err = statusData.error;
            if (i === 0) console.log("[MindAR] First poll:", JSON.stringify(statusData));

            if (status === "done" && id) {
              mindId.value = id;
              return { mindId: id, mindUrl: `/api/mindar/file/${id}` };
            }
            if (status === "error") {
              throw new Error(err || "Compilation failed");
            }
          } catch (pollErr: any) {
            const status = pollErr?.response?.status;
            const body = pollErr?.response?.data;
            const isTimeoutErr =
              pollErr?.code === "ECONNABORTED" || pollErr?.message?.includes("timeout");
            if (status === 404 && i < 3) {
              console.warn(`[MindAR] Poll 404 (attempt ${i + 1}), retrying...`);
              await new Promise((r) => setTimeout(r, 500));
              continue;
            }
            // На мобильной сети таймаут — повторяем до 3 раз
            if (isTimeoutErr && i < 3) {
              console.warn(`[MindAR] Poll timeout (attempt ${i + 1}), retrying...`);
              await new Promise((r) => setTimeout(r, 2000));
              continue;
            }
            console.error("[MindAR] Poll error:", status, body, pollErr?.message);
            throw pollErr;
          }

          await new Promise((r) => setTimeout(r, pollInterval));
        }
        throw new Error("Compilation timeout");
      }

      const res = await mindarApi.uploadImages(files);
      mindId.value = res.data.mindId;
      return res.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || e.message || "Upload failed";
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
    uploadTargets,
  };
}
