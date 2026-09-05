type Props = {
  lines: string[];
  engine: "pc" | "navegador";
  playing: boolean;
};

export function PcTerminal({ lines, engine, playing }: Props) {
  const badge = engine === "pc" ? "JVM" : "respaldo";

  return (
    <div className="min-h-32 overflow-hidden rounded-lg border bg-code text-code-foreground">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <p className="text-sm font-medium">Salida</p>
        <p className="text-xs text-code-foreground/70">
          {playing ? "ejecutando…" : badge}
        </p>
      </div>
      <pre className="max-h-56 overflow-auto px-4 py-3 font-mono text-xs leading-5">
        {lines.length === 0 ? "Esperando a Gradle…" : lines.join("\n")}
      </pre>
    </div>
  );
}
