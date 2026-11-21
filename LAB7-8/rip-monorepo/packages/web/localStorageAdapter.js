import { ApplicationStorageAdapter } from "@rip/core";

// Веб-адаптер: зберігає масив заявок у localStorage браузера (ключ rip-applications)
export class LocalStorageAdapter extends ApplicationStorageAdapter {
  constructor(storage = globalThis.localStorage, key = "rip-applications") {
    super();
    this.storage = storage;
    this.key = key;
  }

  // Пошкоджений JSON не ламає застосунок: повертається порожній масив
  load() {
    try {
      const parsed = JSON.parse(this.storage.getItem(this.key));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  save(applications) {
    this.storage.setItem(this.key, JSON.stringify(applications));
  }
}
