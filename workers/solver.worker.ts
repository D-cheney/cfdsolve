import { solveTool } from "../utils/solvers";

self.onmessage = (
  event: MessageEvent<{
    slug: string;
    params: Record<string, string | number>;
  }>,
) => {
  try {
    const result = solveTool(event.data.slug, event.data.params);
    self.postMessage({ ok: true, result });
  } catch (error) {
    self.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : "求解器运行失败",
    });
  }
};

export {};
