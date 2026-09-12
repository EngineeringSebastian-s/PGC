// Servidor de la presentación: sirve index.html y ejecuta las suites de verdad.
//
//   node servidor.mjs          ->  http://localhost:43142
//
// Sin dependencias: solo módulos de Node. Escucha únicamente en 127.0.0.1 y
// solo acepta las suites de la lista blanca de abajo — nunca un comando
// arbitrario que venga del navegador.

import {spawn} from "node:child_process";
import {createReadStream, existsSync} from "node:fs";
import {createServer} from "node:http";
import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const CRUDS = join(AQUI, "..");
const PUERTO = Number(process.env.PUERTO ?? 43142);
const esWindows = process.platform === "win32";

// Lista blanca. `local` es el comando nativo; `docker` usa el compose del repo.
const SUITES = {
  csharp: {carpeta: "csharp-dotnet", local: ["dotnet", ["test", "--nologo"]]},
  python: {
    carpeta: "python",
    local: existsSync(join(CRUDS, "python", "venv", esWindows ? "Scripts/python.exe" : "bin/python"))
      ? [join(CRUDS, "python", "venv", esWindows ? "Scripts/python.exe" : "bin/python"), ["-m", "pytest", "-v"]]
      : ["python", ["-m", "pytest", "-v"]],
  },
  react: {carpeta: "javascript-react", local: [esWindows ? "npm.cmd" : "npm", ["test", "--", "--run"]]},
  php: {carpeta: "php", local: ["php", ["vendor/bin/phpunit", "--testdox"]]},
  rust: {carpeta: "rust", local: ["cargo", ["test"]]},
  go: {carpeta: "go", local: ["go", ["test", "-v", "./..."]]},
};

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

let hayDocker = null;

function comprobarDocker() {
  if (hayDocker !== null) return Promise.resolve(hayDocker);
  return new Promise((resolver) => {
    const p = spawn("docker", ["info", "--format", "{{.ServerVersion}}"], {shell: esWindows});
    p.on("error", () => resolver((hayDocker = false)));
    p.on("close", (codigo) => resolver((hayDocker = codigo === 0)));
  });
}

function correrSuite(peticion, respuesta, parametros) {
  const id = parametros.get("suite") ?? "";
  const motor = parametros.get("motor") === "docker" ? "docker" : "local";
  const suite = SUITES[id];

  respuesta.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const enviar = (evento, datos) =>
    respuesta.write(`event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`);

  if (!suite) {
    enviar("fallo", {mensaje: `Suite desconocida: ${id}`});
    return respuesta.end();
  }

  const [programa, argumentos, carpeta] =
    motor === "docker"
      ? ["docker", ["compose", "run", "--rm", id], dirname(dirname(CRUDS))]
      : [...suite.local, join(CRUDS, suite.carpeta)];

  const arranque = Date.now();
  const hijo = spawn(programa, argumentos, {cwd: carpeta, shell: esWindows, windowsHide: true});

  // Se bufferea por línea: un chunk puede traer media línea.
  const bombear = (flujo) => {
    let resto = "";
    flujo.setEncoding("utf8");
    flujo.on("data", (trozo) => {
      const lineas = (resto + trozo).split(/\r?\n/);
      resto = lineas.pop() ?? "";
      for (const texto of lineas) enviar("linea", {texto});
    });
    flujo.on("end", () => { if (resto) enviar("linea", {texto: resto}); });
  };

  bombear(hijo.stdout);
  bombear(hijo.stderr);

  hijo.on("error", (error) => {
    enviar("fallo", {mensaje: `No se pudo ejecutar "${programa}": ${error.message}`});
    respuesta.end();
  });

  hijo.on("close", (codigo) => {
    enviar("fin", {codigo: codigo ?? 1, segundos: ((Date.now() - arranque) / 1000).toFixed(1)});
    respuesta.end();
  });

  peticion.on("close", () => hijo.kill());
}

const servidor = createServer(async (peticion, respuesta) => {
  const url = new URL(peticion.url ?? "/", `http://localhost:${PUERTO}`);

  if (url.pathname === "/api/estado") {
    respuesta.writeHead(200, {"Content-Type": TIPOS[".json"], "Cache-Control": "no-store"});
    return respuesta.end(JSON.stringify({ok: true, docker: await comprobarDocker(), suites: Object.keys(SUITES)}));
  }

  if (url.pathname === "/api/correr") {
    return correrSuite(peticion, respuesta, url.searchParams);
  }

  // Archivos estáticos, restringidos a esta carpeta.
  const relativo = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const archivo = join(AQUI, relativo);
  if (!archivo.startsWith(AQUI) || !existsSync(archivo)) {
    respuesta.writeHead(404, {"Content-Type": TIPOS[".txt"]});
    return respuesta.end("No encontrado");
  }

  const extension = archivo.slice(archivo.lastIndexOf("."));
  respuesta.writeHead(200, {"Content-Type": TIPOS[extension] ?? "application/octet-stream"});
  createReadStream(archivo).pipe(respuesta);
});

servidor.listen(PUERTO, "127.0.0.1", () => {
  console.log(`\n  Presentación en  http://localhost:${PUERTO}\n`);
  console.log(`  Suites: ${Object.keys(SUITES).join(", ")}`);
  console.log("  Ctrl+C para frenar.\n");
});
