/**
 * In-memory store для асинхронных задач компиляции .mind.
 * Решает проблему обрыва соединения при долгой компиляции на медленной сети.
 */
interface Job {
  status: "compiling" | "done" | "error";
  mindId?: string;
  error?: string;
}

const jobs = new Map<string, Job>();

export const mindarJobs = {
  create(jobId: string) {
    jobs.set(jobId, { status: "compiling" });
  },

  setDone(jobId: string, mindId: string) {
    jobs.set(jobId, { status: "done", mindId });
  },

  setError(jobId: string, error: string) {
    jobs.set(jobId, { status: "error", error });
  },

  get(jobId: string): Job | undefined {
    return jobs.get(jobId);
  },

  delete(jobId: string) {
    jobs.delete(jobId);
  },
};
