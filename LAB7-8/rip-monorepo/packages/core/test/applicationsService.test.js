import test from "node:test";
import assert from "node:assert/strict";
import {
  ApplicationsService,
  MemoryStorageAdapter,
  ApplicationStorageAdapter,
  ERROR_EMPTY_NAME,
  ERROR_NOT_FOUND,
} from "../index.js";

const input = { name: "Олена", phone: "+380501234567", service: "Кремація", comment: "" };

test("базовий адаптер кидає помилку «не реалізовано»", () => {
  const base = new ApplicationStorageAdapter();
  assert.throws(() => base.load(), /не реалізовано/);
  assert.throws(() => base.save([]), /не реалізовано/);
});

test("add зберігає заявку в адаптері", () => {
  const adapter = new MemoryStorageAdapter();
  const service = new ApplicationsService(adapter);
  const result = service.add(input);
  assert.equal(result.ok, true);
  assert.equal(adapter.load().length, 1);
  assert.equal(adapter.load()[0].name, "Олена");
});

test("add не зберігає некоректну заявку й повертає повідомлення про помилку", () => {
  const adapter = new MemoryStorageAdapter();
  const result = new ApplicationsService(adapter).add({ ...input, name: "  " });
  assert.deepEqual(result, { ok: false, error: ERROR_EMPTY_NAME });
  assert.equal(adapter.load().length, 0);
});

test("add видає унікальні id навіть за однакового часу", () => {
  const service = new ApplicationsService(new MemoryStorageAdapter());
  const ids = new Set();
  for (let i = 0; i < 20; i++) ids.add(service.add(input).application.id);
  assert.equal(ids.size, 20);
});

test("remove видаляє заявку за id", () => {
  const service = new ApplicationsService(new MemoryStorageAdapter());
  const { application } = service.add(input);
  assert.deepEqual(service.remove(application.id), { ok: true });
  assert.equal(service.list().length, 0);
});

test("remove повідомляє, якщо заявки немає", () => {
  const service = new ApplicationsService(new MemoryStorageAdapter());
  assert.deepEqual(service.remove(123), { ok: false, error: ERROR_NOT_FOUND });
});

test("list повертає заявки від нових до старих і підтримує пошук", () => {
  const adapter = new MemoryStorageAdapter([
    { id: 1, name: "Старий", phone: "0501234567", service: "Транспорт", comment: "", createdAt: "2026-01-01T10:00:00Z" },
    { id: 2, name: "Новий", phone: "0501234567", service: "Кремація", comment: "", createdAt: "2026-06-01T10:00:00Z" },
  ]);
  const service = new ApplicationsService(adapter);
  assert.deepEqual(service.list().map((a) => a.id), [2, 1]);
  assert.deepEqual(service.list("кремац").map((a) => a.id), [2]);
});

test("list ігнорує пошкоджені записи в сховищі", () => {
  const adapter = new MemoryStorageAdapter([null, { id: "x" }, { id: 1, name: "Ок", phone: "1" }]);
  assert.equal(new ApplicationsService(adapter).list().length, 1);
});
