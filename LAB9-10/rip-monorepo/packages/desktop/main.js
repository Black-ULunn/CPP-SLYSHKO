import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApplicationsService } from "@rip/core";
import { FileStorageAdapter } from "./fileStorageAdapter.js";
import { createHandlers } from "./ipcHandlers.js";

// У модулі ES немає __dirname: теку файлу отримуємо з import.meta.url
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    title: "RIP Desktop",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  const filePath = path.join(app.getPath("userData"), "applications.json");
  console.log("Файл із заявками:", filePath);

  const service = new ApplicationsService(new FileStorageAdapter(filePath));
  const handlers = createHandlers(service);

  ipcMain.handle("applications:list", (event, query) => handlers.list(query));
  ipcMain.handle("applications:add", (event, data) => handlers.add(data));
  ipcMain.handle("applications:remove", (event, id) => handlers.remove(id));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
