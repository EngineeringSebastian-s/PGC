"use client";

import { useEffect } from "react";
import type { Step } from "@/lib/walkthrough";
import { StepNav } from "./step-nav";
import { Stage } from "./stage";
import { useWalkthrough } from "./use-walkthrough";

type Props = {
  steps: Step[];
};

export function Walkthrough({ steps }: Props) {
  const {
    index,
    step,
    steps: track,
    phase,
    playing,
    done,
    lines,
    visual,
    pcLogs,
    engine,
    play,
    next,
    prev,
    goTo,
  } = useWalkthrough(steps);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <StepNav steps={track} index={index} onSelect={goTo} />
      <Stage
        step={step}
        index={index}
        total={track.length}
        phase={phase}
        playing={playing}
        done={done}
        lines={lines}
        visual={visual}
        pcLogs={pcLogs}
        engine={engine}
        onPlay={play}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}
