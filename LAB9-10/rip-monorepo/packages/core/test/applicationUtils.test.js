import test from "node:test";
import assert from "node:assert/strict";
import {
  createApplication,
  formatApplicationDate,
  sortApplicationsByDate,
  filterApplicationsByQuery,
  sanitizeApplications,
  SERVICES,
} from "../index.js";

test("createApplication обрізає пробіли, ставить послугу за замовчуванням і дату створення", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  const app = createApplication({ name: "  Олена ", phone: " 0501234567 ", comment: " привіт " }, 7, now);
  assert.deepEqual(app, {
    id: 7,
    name: "Олена",
    phone: "0501234567",
    service: SERVICES[0],
    comment: "привіт",
    createdAt: "2026-11-06T12:00:00.000Z",
  });
});

test("formatApplicationDate форматує дату як дд.мм.рррр", () => {
  assert.equal(formatApplicationDate("2026-11-06T12:00:00Z"), "06.11.2026");
});

test("formatApplicationDate повертає порожній рядок для некоректної дати", () => {
  assert.equal(formatApplicationDate("не дата"), "");
  assert.equal(formatApplicationDate(undefined), "");
});

test("sortApplicationsByDate ставить нові заявки першими й не змінює вихідний масив", () => {
  const list = [
    { id: 1, createdAt: "2026-11-01T10:00:00Z" },
    { id: 2, createdAt: "2026-11-05T10:00:00Z" },
  ];
  const sorted = sortApplicationsByDate(list);
  assert.deepEqual(sorted.map((a) => a.id), [2, 1]);
  assert.deepEqual(list.map((a) => a.id), [1, 2]);
});

test("sortApplicationsByDate підтримує старі записи без createdAt (за id)", () => {
  const sorted = sortApplicationsByDate([{ id: 1 }, { id: 3 }, { id: 2 }]);
  assert.deepEqual(sorted.map((a) => a.id), [3, 2, 1]);
});

test("filterApplicationsByQuery шукає без урахування регістру; порожній запит повертає все", () => {
  const list = [
    { name: "Олена", phone: "1", service: "Кремація", comment: "" },
    { name: "Іван", phone: "2", service: "Транспорт", comment: "Потрібен автобус" },
  ];
  assert.equal(filterApplicationsByQuery(list, "оЛЕна").length, 1);
  assert.equal(filterApplicationsByQuery(list, "АВТОБУС").length, 1);
  assert.equal(filterApplicationsByQuery(list, "").length, 2);
});

test("sanitizeApplications відкидає некоректні записи", () => {
  const result = sanitizeApplications([
    { id: 1, name: "Олена", phone: "0501234567" },
    { id: "x", name: "Ні", phone: "1" },
    { id: 2, name: "", phone: "1" },
    null,
    "рядок",
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].service, SERVICES[0]);
  assert.deepEqual(sanitizeApplications("не масив"), []);
});
