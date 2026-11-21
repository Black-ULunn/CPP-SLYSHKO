// Preload має бути CommonJS-файлом (.cjs), навіть коли решта пакета — модулі ES.
const { contextBridge, ipcRenderer } = require("electron");

// Сторінка отримує лише три дозволені функції
contextBridge.exposeInMainWorld("applicationsAPI", {
  list: (query) => ipcRenderer.invoke("applications:list", query),
  add: (data) => ipcRenderer.invoke("applications:add", data),
  remove: (id) => ipcRenderer.invoke("applications:remove", id),
});
