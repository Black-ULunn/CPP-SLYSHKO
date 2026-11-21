import fs from "node:fs";
import path from "node:path";
import { ApplicationStorageAdapter } from "@rip/core";

// Десктопний адаптер: зберігає масив заявок у JSON-файлі.
// Модуль не підключає electron, тому тестується звичайним node --test.
export class FileStorageAdapter extends ApplicationStorageAdapter {
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }

  // Немає файлу або він пошкоджений — порожній масив
  load() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Створює теку, якщо її ще немає
  save(applications) {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(applications, null, 2), "utf-8");
  }
}
