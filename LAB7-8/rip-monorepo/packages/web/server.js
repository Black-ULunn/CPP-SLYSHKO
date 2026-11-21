// Мінімальний статичний сервер без зовнішніх залежностей.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.dirname(fileURLToPath(import.meta.url));
// Тека пакета ядра: шлях знаходить сам Node.js за ім'ям пакета (символьне посилання workspaces)
const coreDir = path.dirname(fileURLToPath(import.meta.resolve("@rip/core")));
const CORE_PREFIX = "/node_modules/@rip/core/";

// Білий список файлів веб-клієнта
const WEB_FILES = new Set([
  "/index.html",
  "/script.js",
  "/style.css",
  "/localStorageAdapter.js",
]);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

// Повертає повний шлях до файлу або null, якщо файл віддавати заборонено
export function resolveFilePath(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  if (pathname === "/") pathname = "/index.html";

  if (WEB_FILES.has(pathname)) {
    return path.join(webDir, pathname);
  }

  if (pathname.startsWith(CORE_PREFIX)) {
    const relative = pathname.slice(CORE_PREFIX.length);
    const full = path.resolve(coreDir, relative);
    // лише .js-файли ядра й жодного виходу за межі теки пакета
    if (full.startsWith(coreDir + path.sep) && full.endsWith(".js") && !relative.includes("test/")) {
      return full;
    }
  }
  return null;
}

export function createServer() {
  return http.createServer((req, res) => {
    const filePath = resolveFilePath(req.url ?? "/");
    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Не знайдено");
      return;
    }
    res.writeHead(200, {
      "Content-Type": TYPES[path.extname(filePath)] ?? "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Запуск лише коли файл виконується напряму (npm start), а не імпортується тестами
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`RIP Web: http://localhost:${port}`);
  });
}
