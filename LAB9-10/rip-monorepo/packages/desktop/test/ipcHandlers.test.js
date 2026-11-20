import test from "node:test";
import assert from "node:assert/strict";
import { ApplicationsService, MemoryStorageAdapter } from "@rip/core";
import { createHandlers } from "../ipcHandlers.js";

function setup() {
  return createHandlers(new ApplicationsService(new MemoryStorageAdapter()));
}
const input = { name: "Олена", phone: "+380501234567", service: "Кремація", comment: "" };

test("add і list: заявка зʼявляється з полем dateLabel", () => {
  const handlers = setup();
  assert.equal(handlers.add(input).ok, true);
  const [first] = handlers.list("");
  assert.equal(first.name, "Олена");
  assert.match(first.dateLabel, /^\d{2}\.\d{2}\.\d{4}$/);
});

test("add повертає помилку для порожнього та нетекстового значення", () => {
  const handlers = setup();
  assert.equal(handlers.add({ ...input, name: "  " }).ok, false);
  assert.equal(handlers.add({ ...input, phone: 12345 }).ok, false);
  assert.equal(handlers.add(null).ok, false);
  assert.equal(handlers.add([1, 2]).ok, false);
});

test("list ігнорує запит неправильного типу, а рядковий запит фільтрує", () => {
  const handlers = setup();
  handlers.add(input);
  handlers.add({ name: "Іван", phone: "0671234567", service: "Транспорт" });
  assert.equal(handlers.list({ x: 1 }).length, 2);
  assert.equal(handlers.list("іван").length, 1);
});

test("remove приймає id як число або рядок", () => {
  const handlers = setup();
  const a = handlers.add(input).application;
  const b = handlers.add({ ...input, name: "Другий" }).application;
  assert.equal(handlers.remove(a.id).ok, true);
  assert.equal(handlers.remove(String(b.id)).ok, true);
  assert.equal(handlers.list("").length, 0);
});

test("remove відхиляє некоректний id та повідомляє про відсутню заявку", () => {
  const handlers = setup();
  assert.equal(handlers.remove("abc").ok, false);
  assert.equal(handlers.remove({}).ok, false);
  assert.equal(handlers.remove(999).error, "Заявку не знайдено.");
});

test("add відхиляє послугу поза списком", () => {
  assert.equal(setup().add({ ...input, service: "Магія" }).ok, false);
});
