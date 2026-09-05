"use client";

import { GROUP_LABEL, type Step, type StepGroup } from "@/lib/walkthrough";

type Props = {
  steps: Step[];
  index: number;
  onSelect: (index: number) => void;
};

const ORDER: StepGroup[] = ["junit", "kotlin", "softtek"];

export function StepNav({ steps, index, onSelect }: Props) {
  return (
    <nav aria-label="Pasos del recorrido" className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <div className="flex gap-6 overflow-x-auto pb-2 lg:block lg:space-y-6 lg:overflow-visible lg:pb-0">
        {ORDER.map((group) => {
          const items = steps
            .map((step, i) => ({ step, i }))
            .filter(({ step }) => step.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="min-w-56">
              <p className="mb-2 text-sm font-medium text-muted-foreground">{GROUP_LABEL[group]}</p>
              <ol className="flex flex-col gap-1">
                {items.map(({ step, i }) => {
                  const current = i === index;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        aria-current={current ? "step" : undefined}
                        onClick={() => onSelect(i)}
                        className={
                          current
                            ? "w-full rounded-md bg-primary px-3 py-2 text-left text-sm text-primary-foreground"
                            : "w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }
                      >
                        <span className="block font-medium">{step.title}</span>
                        <span className={current ? "font-mono text-sm opacity-90" : "font-mono text-sm"}>
                          {step.method}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
