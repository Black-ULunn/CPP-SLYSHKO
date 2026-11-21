import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ApplicationsService } from "@rip/core";
import { FileStorageAdapter } from "../fileStorageAdapter.js";

function tmpFile(name = "applications.json") {
  return path.join(fs.mkdtempSync(path.join(os.tmpdir(), "rip-")), name);
}

test("load повертає [], якщо файлу немає", () => {
  assert.deepEqual(new FileStorageAdapter(tmpFile()).load(), []);
});

test("save створює теку та файл, load читає дані назад", () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "rip-")), "вкладена", "applications.json");
  const adapter = new FileStorageAdapter(file);
  const data = [{ id: 1, name: "Олена", phone: "0501234567" }];
  adapter.save(data);
  assert.ok(fs.existsSync(file));
  assert.deepEqual(adapter.load(), data);
});

test("load повертає [] для пошкодженого файлу та для не-масиву", () => {
  const file = tmpFile();
  fs.writeFileSync(file, "{зламано");
  assert.deepEqual(new FileStorageAdapter(file).load(), []);
  fs.writeFileSync(file, '{"a":1}');
  assert.deepEqual(new FileStorageAdapter(file).load(), []);
});

test("адаптер працює зі спільним ApplicationsService", () => {
  const service = new ApplicationsService(new FileStorageAdapter(tmpFile()));
  service.add({ name: "Іван", phone: "0671234567" });
  assert.equal(service.list().length, 1);
});
