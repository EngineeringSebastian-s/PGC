type Props = {
  code: string;
  active: boolean;
};

export function CodePanel({ code, active }: Props) {
  return (
    <div className="min-h-[220px] overflow-hidden rounded-lg bg-code text-code-foreground">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-sm text-white/60">
        <span>Llamada</span>
        <span>{active ? "en ejecución" : "en espera"}</span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}
