"use client";

import { useState } from "react";
import { Walkthrough } from "@/components/walkthrough/walkthrough";
import { JUNIT_TRACK, SOFTTEK_TRACK } from "@/lib/walkthrough";

const TABS = [
  { id: "junit", label: "JUnit" },
  { id: "softtek", label: "Softtek" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Guide() {
  const [tab, setTab] = useState<TabId>("junit");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Práctica TDD</h1>
        <p className="text-base leading-7 text-muted-foreground">
          JUnit y Softtek. Cada paso ejecuta Gradle. Flechas del teclado para cambiar de paso.
        </p>
      </header>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-secondary p-1" role="tablist" aria-label="Secciones">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className={
              tab === item.id
                ? "rounded-md bg-card px-4 py-2 text-sm font-medium shadow-sm"
                : "rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="contenido">
        {tab === "junit" && (
          <div role="tabpanel" id="panel-junit" aria-labelledby="tab-junit">
            <Walkthrough key="junit" steps={JUNIT_TRACK} />
          </div>
        )}
        {tab === "softtek" && (
          <div role="tabpanel" id="panel-softtek" aria-labelledby="tab-softtek">
            <Walkthrough key="softtek" steps={SOFTTEK_TRACK} />
          </div>
        )}
      </div>
    </main>
  );
}
