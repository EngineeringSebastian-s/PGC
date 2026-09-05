import type { OutputLine } from "@/lib/walkthrough";

type Props = {
  lines: OutputLine[];
  empty: boolean;
};

export function OutputLines({ lines, empty }: Props) {
  if (empty) {
    return (
      <p className="text-sm text-muted-foreground">
        Pulsa Ejecutar.
      </p>
    );
  }

  return (
    <ol aria-live="polite" className="space-y-1 font-mono text-sm leading-6">
      {lines.map((line, i) => (
        <li
          key={i}
          className={
            line.kind === "pass"
              ? "chip-in text-success"
              : line.kind === "fail"
                ? "chip-in text-destructive"
                : "chip-in text-foreground"
          }
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {line.kind === "pass" ? "PASSED  " : line.kind === "fail" ? "ERROR   " : "out     "}
          {line.text}
        </li>
      ))}
    </ol>
  );
}
