import type { Visual } from "@/lib/walkthrough";
import type { Phase } from "./use-walkthrough";

type Props = {
  visual: Extract<Visual, { type: "assert" | "timeline" | "kotlinName" }>;
  phase: Phase;
  rowCount: number;
};

export function ExtraVisuals({ visual, phase, rowCount }: Props) {
  const live = phase >= 2;

  if (visual.type === "assert") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-secondary px-3 py-3">
          <p className="text-sm text-muted-foreground">Esperado</p>
          <p className="font-mono text-xl font-semibold">{live ? visual.expected : "…"}</p>
        </div>
        <div className="rounded-md bg-secondary px-3 py-3">
          <p className="text-sm text-muted-foreground">Obtenido</p>
          <p className="font-mono text-xl font-semibold">{live ? visual.actual : "…"}</p>
        </div>
        {phase >= 3 && (
          <p className="stamp-in col-span-2 text-sm font-medium text-success">
            Coinciden. assertEquals da PASSED.
          </p>
        )}
      </div>
    );
  }

  if (visual.type === "kotlinName") {
    return (
      <div className="space-y-3">
        <p className="font-mono text-sm text-muted-foreground">{visual.source}</p>
        {live && (
          <p className="chip-in rounded-md bg-secondary px-3 py-3 font-medium">
            En el reporte: {visual.report}
          </p>
        )}
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {visual.events.map((event, i) => {
        const on = i < rowCount || (live && i === 0);
        return (
          <li key={`${event.label}-${i}`} className={on ? "chip-in flex gap-3" : "flex gap-3 opacity-40"}>
            <span className="w-28 shrink-0 font-mono text-sm font-medium">{event.label}</span>
            <span className="text-sm">{on ? event.detail : "…"}</span>
          </li>
        );
      })}
    </ol>
  );
}
