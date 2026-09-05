export function Chip({
  label,
  value,
  delay,
  show,
  dim = false,
}: {
  label: string;
  value: string | number;
  delay: string;
  show: boolean;
  dim?: boolean;
}) {
  if (!show) {
    return (
      <span className="inline-flex min-w-14 flex-col rounded-md border border-dashed border-border px-3 py-2 text-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-mono text-sm text-muted-foreground">…</span>
      </span>
    );
  }

  return (
    <span className={dim ? "opacity-40" : undefined}>
      <span
        className="chip-in inline-flex min-w-14 flex-col rounded-md bg-secondary px-3 py-2 text-center"
        style={{ animationDelay: delay }}
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-mono text-lg font-semibold">{value}</span>
      </span>
    </span>
  );
}
