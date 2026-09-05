export type LineKind = "pass" | "fail" | "info";

export type OutputLine = { text: string; kind: LineKind };

export type Visual =
  | { type: "sum"; left: number; right: number; result: number }
  | { type: "assert"; expected: number; actual: number }
  | { type: "throws"; name: string; message: string }
  | { type: "table"; rows: { expr: string; got: number; expected: number }[] }
  | { type: "split"; equation: string; a: number; op: string; b: number; c: number; focus?: "a" | "op" | "b" | "c" }
  | { type: "formula"; equation: string; a: number; b: number; c: number; x: number }
  | { type: "mock"; a: number; b: number; c: number; x: number }
  | { type: "first" }
  | { type: "timeline"; events: { label: string; detail: string }[] }
  | { type: "kotlinName"; source: string; report: string };

export type StepGroup = "junit" | "kotlin" | "softtek";

export type Step = {
  id: string;
  group: StepGroup;
  method: string;
  title: string;
  say: string;
  why: string;
  code: string;
  captions: [string, string, string];
  run: () => { lines: OutputLine[]; visual: Visual };
};

export const GROUP_LABEL: Record<StepGroup, string> = {
  junit: "Writing Tests",
  kotlin: "Kotlin",
  softtek: "Softtek",
};
