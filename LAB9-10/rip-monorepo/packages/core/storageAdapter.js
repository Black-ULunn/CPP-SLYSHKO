// Інтерфейс адаптера сховища: ядро знає лише про load() і save(applications).
export class ApplicationStorageAdapter {
  load() {
    throw new Error("Метод load() не реалізовано");
  }

  save(applications) {
    throw new Error("Метод save() не реалізовано");
  }
}

// Зберігає заявки в памʼяті — для тестів і прототипів
export class MemoryStorageAdapter extends ApplicationStorageAdapter {
  constructor(initial = []) {
    super();
    this.data = [...initial];
  }

  load() {
    return [...this.data];
  }

  save(applications) {
    this.data = [...applications];
  }
}
