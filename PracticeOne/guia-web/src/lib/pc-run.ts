import type { OutputLine, Visual } from "@/lib/walkthrough-types";

export type PcEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

export function kindFrom(value: unknown): OutputLine["kind"] {
  if (value === "pass" || value === "fail" || value === "info") return value;
  return "info";
}

export function visualFrom(payload: Record<string, unknown> | undefined): Visual | null {
  if (!payload || typeof payload.type !== "string") return null;
  return payload as unknown as Visual;
}

export async function consumePcRun(
  stepId: string,
  signal: AbortSignal,
  onEvent: (event: PcEvent) => void,
): Promise<number> {
  const response = await fetch(`/api/pc-run?step=${encodeURIComponent(stepId)}`, {
    signal,
    cache: "no-store",
  });
  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `HTTP ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let exitCode = 1;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .filter((row) => row.startsWith("data:"))
        .map((row) => row.slice(5).trim())
        .join("");
      if (!line) continue;
      const event = JSON.parse(line) as PcEvent;
      if (event.type === "done") {
        exitCode = Number(event.payload?.code ?? 1);
      }
      onEvent(event);
    }
  }

  return exitCode;
}
