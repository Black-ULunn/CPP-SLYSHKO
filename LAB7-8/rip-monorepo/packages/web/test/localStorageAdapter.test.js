import test from "node:test";
import assert from "node:assert/strict";
import { ApplicationsService } from "@rip/core";
import { LocalStorageAdapter } from "../localStorageAdapter.js";

// Простий обʼєкт замість браузерного localStorage (у Node.js його немає)
function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
  };
}

test("load повертає порожній масив, якщо сховище порожнє", () => {
  assert.deepEqual(new LocalStorageAdapter(fakeStorage()).load(), []);
});

test("save записує JSON, а load читає його назад", () => {
  const adapter = new LocalStorageAdapter(fakeStorage());
  const data = [{ id: 1, name: "Олена", phone: "0501234567" }];
  adapter.save(data);
  assert.deepEqual(adapter.load(), data);
});

test("load повертає [] для пошкодженого JSON та для не-масиву", () => {
  assert.deepEqual(new LocalStorageAdapter(fakeStorage({ "rip-applications": "{зламано" })).load(), []);
  assert.deepEqual(new LocalStorageAdapter(fakeStorage({ "rip-applications": '{"a":1}' })).load(), []);
});

test("адаптер працює зі спільним ApplicationsService", () => {
  const service = new ApplicationsService(new LocalStorageAdapter(fakeStorage()));
  const result = service.add({ name: "Іван", phone: "0671234567", service: "Транспорт" });
  assert.equal(result.ok, true);
  assert.equal(service.list().length, 1);
});
