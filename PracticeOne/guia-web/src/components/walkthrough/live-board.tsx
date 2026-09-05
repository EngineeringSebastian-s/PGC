import type { Visual } from "@/lib/walkthrough";
import type { Phase } from "./use-walkthrough";
import { Chip } from "./chip";
import { ExtraVisuals } from "./extra-visuals";

type Props = {
  visual: Visual;
  phase: Phase;
  rowCount: number;
};

export function LiveBoard({ visual, phase, rowCount }: Props) {
  const live = phase >= 2;

  if (visual.type === "sum") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Chip label="a" value={visual.left} delay="0ms" show={live} />
        <span className="text-lg text-muted-foreground">+</span>
        <Chip label="b" value={visual.right} delay="80ms" show={live} />
        <span className="text-lg text-muted-foreground">=</span>
        <Chip label="resultado" value={visual.result} delay="160ms" show={phase >= 3} />
      </div>
    );
  }

  if (visual.type === "throws") {
    return (
      <div className={live ? "stamp-in rounded-lg border border-destructive/40 bg-destructive/10 p-4" : "rounded-lg border border-dashed border-border p-4"}>
        <p className="font-medium text-destructive">{visual.name}</p>
        <p className="mt-1 font-mono text-sm">{visual.message}</p>
        {phase >= 3 && <p className="mt-3 text-sm text-success">El test esperaba exactamente esto.</p>}
      </div>
    );
  }

  if (visual.type === "table") {
    return (
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-muted-foreground">
            <th className="pb-2 font-medium">Expresión</th>
            <th className="pb-2 font-medium">Obtenido</th>
            <th className="pb-2 font-medium">Esperado</th>
          </tr>
        </thead>
        <tbody>
          {visual.rows.map((row, i) => {
            const on = i < rowCount;
            return (
              <tr key={row.expr} className={on ? "chip-in" : "opacity-40"}>
                <td className="py-1.5 font-mono">{row.expr}</td>
                <td className="py-1.5 font-mono">{on ? row.got : "—"}</td>
                <td className="py-1.5 font-medium text-success">{on ? "PASSED" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (visual.type === "split") {
    return (
      <div className="space-y-4">
        <p className="font-mono text-lg">{visual.equation}</p>
        <div className="flex flex-wrap gap-2">
          <Chip label="a" value={visual.a} delay="0ms" show={live} dim={Boolean(visual.focus && visual.focus !== "a")} />
          <Chip label="op" value={visual.op} delay="70ms" show={live} dim={Boolean(visual.focus && visual.focus !== "op")} />
          <Chip label="b" value={visual.b} delay="140ms" show={live} dim={Boolean(visual.focus && visual.focus !== "b")} />
          <Chip label="c" value={visual.c} delay="210ms" show={live} dim={Boolean(visual.focus && visual.focus !== "c")} />
        </div>
        {visual.focus ? (
          <p className="text-sm text-muted-foreground">Este test solo afirma ese dato. El resto se ve apagado a propósito.</p>
        ) : (
          <p className="text-sm text-muted-foreground">Todavía no hay x. Eso es el test unitario del parseador.</p>
        )}
      </div>
    );
  }

  if (visual.type === "formula") {
    return (
      <div className="space-y-4">
        <p className="font-mono text-lg">{visual.equation}</p>
        <p className="font-mono text-sm text-muted-foreground">x = (c − b) / a</p>
        <div className="flex flex-wrap gap-2">
          <Chip label="a" value={visual.a} delay="0ms" show={live} />
          <Chip label="b" value={visual.b} delay="80ms" show={live} />
          <Chip label="c" value={visual.c} delay="160ms" show={live} />
        </div>
        {phase >= 3 && (
          <p className="stamp-in font-mono text-xl font-semibold">
            x = ({visual.c} − ({visual.b})) / {visual.a} = {visual.x}
          </p>
        )}
      </div>
    );
  }

  if (visual.type === "mock") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-dashed border-border p-3">
          <p className="text-sm font-medium">Cadena</p>
          <p className="mt-2 font-mono text-sm text-muted-foreground line-through">2x - 1 = 0</p>
          <p className="mt-1 text-sm text-muted-foreground">El mock no la lee.</p>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Chip label="a" value={visual.a} delay="0ms" show={live} />
            <Chip label="b" value={visual.b} delay="80ms" show={live} />
            <Chip label="c" value={visual.c} delay="160ms" show={live} />
          </div>
          {phase >= 3 && (
            <p className="stamp-in font-mono text-lg font-semibold">x = {visual.x}</p>
          )}
        </div>
      </div>
    );
  }

  if (visual.type === "first") {
    const letters = [
      ["F", "Fast: milisegundos, sin red"],
      ["I", "Isolated: Calculator nuevo en cada test"],
      ["R", "Repeatable: 1+1 siempre 2"],
      ["S", "Self-validating: el assert decide"],
      ["T", "Timely: el test llega a tiempo"],
    ] as const;

    return (
      <ul className="space-y-2">
        {letters.map(([letter, text], i) => {
          const on = phase >= 3 || (live && i < rowCount + 1);
          return (
            <li key={letter} className={on ? "chip-in flex gap-3" : "flex gap-3 opacity-40"}>
              <span className="flex size-8 items-center justify-center rounded-md bg-secondary font-semibold">
                {letter}
              </span>
              <span className="self-center text-sm">{text}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return <ExtraVisuals visual={visual} phase={phase} rowCount={rowCount} />;
}
