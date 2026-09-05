"use client";

import type { OutputLine, Step, Visual } from "@/lib/walkthrough";
import type { Engine, Phase } from "./use-walkthrough";
import { CodePanel } from "./code-panel";
import { LiveBoard } from "./live-board";
import { OutputLines } from "./output-lines";
import { PcTerminal } from "./pc-terminal";

type Props = {
  step: Step;
  index: number;
  total: number;
  phase: Phase;
  playing: boolean;
  done: boolean;
  lines: OutputLine[];
  visual: Visual;
  pcLogs: string[];
  engine: Engine;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export function Stage({
  step,
  index,
  total,
  phase,
  playing,
  done,
  lines,
  visual,
  pcLogs,
  engine,
  onPlay,
  onPrev,
  onNext,
}: Props) {
  const caption = step.captions[Math.min(phase, 2)];

  return (
    <section key={step.id} className="stage-in space-y-6" aria-labelledby="paso-titulo">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl space-y-2">
          <p className="text-sm text-muted-foreground">
            Paso {index + 1} de {total}
          </p>
          <h2 id="paso-titulo" className="text-xl font-semibold tracking-tight">
            {step.title}
          </h2>
          <p className="font-mono text-sm text-muted-foreground">{step.method}</p>
          <p className="text-base leading-7">{step.say}</p>
          <p className="text-sm leading-6 text-muted-foreground">{step.why}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="h-9 rounded-md border bg-card px-3 text-sm font-medium disabled:opacity-50"
            onClick={onPrev}
            disabled={index === 0}
          >
            Anterior
          </button>
          <button
            type="button"
            className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
            onClick={onPlay}
            disabled={playing}
          >
            {playing ? "Ejecutando" : done ? "Repetir" : "Ejecutar"}
          </button>
          <button
            type="button"
            className="h-9 rounded-md bg-secondary px-3 text-sm font-medium disabled:opacity-50"
            onClick={onNext}
            disabled={index === total - 1}
          >
            Siguiente
          </button>
        </div>
      </div>

      <p className="rounded-md bg-secondary px-3 py-2 text-sm font-medium" aria-live="polite">
        Ahora: {caption}
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <CodePanel code={step.code} active={playing || phase >= 1} />
        <div className="flex min-h-[220px] flex-col rounded-lg border bg-card p-4">
          <p className="mb-3 text-sm font-medium">Qué está pasando</p>
          <LiveBoard visual={visual} phase={phase} rowCount={lines.length} />
        </div>
      </div>

      <PcTerminal lines={pcLogs} engine={engine} playing={playing} />

      <div className="min-h-24 rounded-lg border bg-card p-4">
        <p className="mb-2 text-sm font-medium">Resultado</p>
        <OutputLines lines={lines} empty={lines.length === 0} />
      </div>
    </section>
  );
}
