"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { consumePcRun, visualFrom } from "@/lib/pc-run";
import type { OutputLine, Step, Visual } from "@/lib/walkthrough";

export type Phase = 0 | 1 | 2 | 3;
export type Engine = "pc" | "navegador";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useWalkthrough(steps: Step[]) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(0);
  const [playing, setPlaying] = useState(false);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [lineCount, setLineCount] = useState(0);
  const [visual, setVisual] = useState<Visual>(steps[0].run().visual);
  const [pcLogs, setPcLogs] = useState<string[]>([]);
  const [engine, setEngine] = useState<Engine>("pc");
  const abortRef = useRef<AbortController | null>(null);
  const timers = useRef<number[]>([]);
  const gradleBusy = useRef(false);
  const boardBusy = useRef(false);

  const step = steps[index];

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearTimers();
    gradleBusy.current = false;
    boardBusy.current = false;
  }, [clearTimers]);

  const settlePlaying = useCallback(() => {
    if (!gradleBusy.current && !boardBusy.current) {
      setPlaying(false);
    }
  }, []);

  const playBoard = useCallback(
    (replicaLines: OutputLine[]) => {
      clearTimers();
      boardBusy.current = true;
      const reduced = prefersReducedMotion();
      if (reduced) {
        setPhase(3);
        setLineCount(replicaLines.length);
        setLines(replicaLines);
        boardBusy.current = false;
        settlePlaying();
        return;
      }

      setPhase(0);
      setLineCount(0);
      setLines([]);
      const schedule = (ms: number, fn: () => void) => {
        timers.current.push(window.setTimeout(fn, ms));
      };
      schedule(80, () => setPhase(1));
      schedule(420, () => setPhase(2));
      replicaLines.forEach((_, i) => {
        schedule(700 + i * 280, () => {
          setLineCount(i + 1);
          setLines(replicaLines.slice(0, i + 1));
        });
      });
      schedule(700 + replicaLines.length * 280 + 220, () => {
        setPhase(3);
        setLineCount(replicaLines.length);
        setLines(replicaLines);
        boardBusy.current = false;
        settlePlaying();
      });
    },
    [clearTimers, settlePlaying],
  );

  const play = useCallback(() => {
    stop();
    const controller = new AbortController();
    abortRef.current = controller;
    const current = steps[index];
    const fallback = current.run();
    gradleBusy.current = true;
    setPlaying(true);
    setPcLogs(["Gradle…"]);
    setVisual(fallback.visual);
    setEngine("pc");
    playBoard(fallback.lines);

    let gotLive = false;

    void consumePcRun(current.id, controller.signal, (event) => {
      if (controller.signal.aborted) return;
      const payload = event.payload ?? {};
      if (event.type === "log" && typeof payload.text === "string") {
        setPcLogs((prev) => [...prev, payload.text]);
      }
      if (event.type === "meta") {
        gotLive = true;
        const version = typeof payload.version === "string" ? payload.version : "";
        const jvm = typeof payload.jvm === "string" ? payload.jvm : "";
        setPcLogs((prev) => [...prev, `JVM ${version}  ${jvm}`]);
      }
      if (event.type === "line") {
        gotLive = true;
      }
      if (event.type === "visual") {
        gotLive = true;
        const nextVisual = visualFrom(payload);
        if (nextVisual) setVisual(nextVisual);
      }
      if (event.type === "error" && typeof payload.message === "string") {
        setPcLogs((prev) => [...prev, payload.message]);
      }
    })
      .then((code) => {
        if (controller.signal.aborted) return;
        if (!gotLive) {
          setEngine("navegador");
          setPcLogs((prev) => [...prev, `Gradle: código ${code}. Respaldo local.`]);
        } else if (code !== 0) {
          setPcLogs((prev) => [...prev, `Proceso: código ${code}.`]);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setEngine("navegador");
        const message = err instanceof Error ? err.message : String(err);
        setPcLogs((prev) => [...prev, `Error: ${message}`]);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        gradleBusy.current = false;
        settlePlaying();
      });
  }, [index, playBoard, settlePlaying, steps, stop]);

  const goTo = useCallback(
    (nextIndex: number) => {
      stop();
      setIndex(nextIndex);
      setPhase(0);
      setLines([]);
      setLineCount(0);
      setPlaying(false);
    },
    [stop],
  );

  const next = useCallback(() => {
    goTo(Math.min(index + 1, steps.length - 1));
  }, [goTo, index, steps.length]);

  const prev = useCallback(() => {
    goTo(Math.max(index - 1, 0));
  }, [goTo, index]);

  useEffect(() => {
    play();
    return () => stop();
  }, [index, play, stop]);

  return {
    index,
    step,
    steps,
    phase,
    playing,
    lines,
    visual,
    pcLogs,
    engine,
    play,
    next,
    prev,
    goTo,
    done: phase === 3 && !playing,
    lineCount,
  };
}
