import test from "node:test";
import assert from "node:assert/strict";
import {
  validateApplication,
  MAX_COMMENT_LENGTH,
  ERROR_EMPTY_NAME,
  ERROR_PHONE,
  ERROR_SERVICE,
  ERROR_COMMENT_TOO_LONG,
  SERVICES,
} from "../index.js";

const valid = { name: "Олена", phone: "+380501234567", service: SERVICES[1], comment: "" };

test("коректна заявка проходить перевірку", () => {
  assert.deepEqual(validateApplication(valid), { isValid: true, error: "" });
});

test("порожнє імʼя та імʼя з самих пробілів не проходять перевірку", () => {
  assert.equal(validateApplication({ ...valid, name: "" }).error, ERROR_EMPTY_NAME);
  assert.equal(validateApplication({ ...valid, name: "   " }).error, ERROR_EMPTY_NAME);
});

test("не рядок і не обʼєкт не проходять перевірку", () => {
  assert.equal(validateApplication({ ...valid, name: 42 }).isValid, false);
  assert.equal(validateApplication(null).isValid, false);
  assert.equal(validateApplication("текст").isValid, false);
});

test("телефон: замало цифр, без цифр і не рядок — помилка", () => {
  assert.equal(validateApplication({ ...valid, phone: "12345" }).error, ERROR_PHONE);
  assert.equal(validateApplication({ ...valid, phone: "abc" }).error, ERROR_PHONE);
  assert.equal(validateApplication({ ...valid, phone: 380501234567 }).error, ERROR_PHONE);
});

test("телефон із пробілами та дужками приймається", () => {
  assert.equal(validateApplication({ ...valid, phone: "+38 (050) 123-45-67" }).isValid, true);
});

test("послуга поза списком відхиляється, відсутня — допустима", () => {
  assert.equal(validateApplication({ ...valid, service: "Магія" }).error, ERROR_SERVICE);
  assert.equal(validateApplication({ name: "А", phone: "0501234567" }).isValid, true);
});

test("межа довжини коментаря: рівно MAX_COMMENT_LENGTH допустимо, на один більше — ні", () => {
  const ok = "а".repeat(MAX_COMMENT_LENGTH);
  assert.equal(validateApplication({ ...valid, comment: ok }).isValid, true);
  const result = validateApplication({ ...valid, comment: ok + "а" });
  assert.equal(result.isValid, false);
  assert.equal(result.error, ERROR_COMMENT_TOO_LONG);
});

test("довжина коментаря вимірюється після видалення пробілів", () => {
  const padded = "  " + "а".repeat(MAX_COMMENT_LENGTH) + "  ";
  assert.equal(validateApplication({ ...valid, comment: padded }).isValid, true);
});
