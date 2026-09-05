import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import readline from "readline";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JAVA_STEPS = new Set([
  "at-test",
  "assert-equals",
  "before-each",
  "parameterized",
  "assert-throws",
  "parse-parte1",
  "parse-parte2",
  "parse-operador",
  "parse-parte3",
  "parse-invalida",
  "eq-menos",
  "eq-mas",
  "eq-diez",
  "eq-cero",
  "mock-formula",
  "first-softtek",
]);

const KOTLIN_STEPS = new Set([
  "kotlin-backticks",
  "kotlin-per-class",
  "kotlin-before-each",
  "kotlin-throws",
  "kotlin-parameterized",
]);

let current: ChildProcess | null = null;

function tallerRoot(): string {
  const candidates = [
    path.resolve(process.cwd(), ".."),
    process.cwd(),
    path.resolve(process.cwd(), "TALLER TDD"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "p1-java", "gradlew.bat")) && fs.existsSync(path.join(dir, "guia-web"))) {
      return dir;
    }
  }
  throw new Error("No se encontró p1-java. Ejecuta npm run dev desde guia-web.");
}

function sse(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const step = url.searchParams.get("step")?.trim() ?? "";
  if (!JAVA_STEPS.has(step) && !KOTLIN_STEPS.has(step)) {
    return Response.json({ error: "Paso no permitido" }, { status: 400 });
  }

  const project = KOTLIN_STEPS.has(step) ? "p1-kotlin" : "p1-java";
  const root = tallerRoot();
  const cwd = path.join(root, project);
  const isWin = process.platform === "win32";
  const gradlew = isWin ? "gradlew.bat" : "./gradlew";
  const args = ["live", `-PliveStep=${step}`, "--console=plain"];

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj: unknown) => {
        try {
          controller.enqueue(new TextEncoder().encode(sse(obj)));
        } catch {
          /* stream cerrado */
        }
      };

      send({
        type: "log",
        payload: {
          text: `PC  cwd=${cwd}`,
        },
      });
      send({
        type: "log",
        payload: {
          text: `PC  ${gradlew} ${args.join(" ")}`,
        },
      });

      if (current && !current.killed) {
        current.kill();
      }

      const child = spawn(gradlew, args, {
        cwd,
        shell: isWin,
        windowsHide: true,
        env: {
          ...process.env,
          JAVA_TOOL_OPTIONS: "-Dfile.encoding=UTF-8",
          GRADLE_USER_HOME: path.join(os.homedir(), ".gradle"),
        },
      });
      current = child;

      const onAbort = () => {
        child.kill();
      };
      request.signal.addEventListener("abort", onAbort);

      const pump = (streamIn: NodeJS.ReadableStream, channel: "stdout" | "stderr") => {
        const rl = readline.createInterface({ input: streamIn });
        rl.on("line", (text) => {
          const trimmed = text.trimEnd();
          if (trimmed.startsWith("::live::")) {
            try {
              const parsed = JSON.parse(trimmed.slice("::live::".length));
              send(parsed);
            } catch {
              send({ type: "log", payload: { text: trimmed, channel } });
            }
            return;
          }
          if (trimmed.length > 0) {
            send({ type: "log", payload: { text: trimmed, channel } });
          }
        });
      };

      if (child.stdout) pump(child.stdout, "stdout");
      if (child.stderr) pump(child.stderr, "stderr");

      child.on("error", (err) => {
        send({ type: "error", payload: { message: err.message } });
      });

      child.on("close", (code) => {
        request.signal.removeEventListener("abort", onAbort);
        if (current === child) current = null;
        send({ type: "done", payload: { code: code ?? 1 } });
        try {
          controller.close();
        } catch {
          /* ya cerrado */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
