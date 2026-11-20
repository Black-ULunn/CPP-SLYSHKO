// Правила перевірки заявки. Єдине місце, де вони описані: клієнти їх не дублюють.
export const MAX_COMMENT_LENGTH = 500;
export const MIN_PHONE_DIGITS = 10;
export const MAX_PHONE_DIGITS = 15;

export const SERVICES = [
  "Організація поховання",
  "Кремація",
  "Ритуальний зал",
  "Транспорт",
  "Памʼятники та благоустрій",
  "Інше",
];

export const ERROR_EMPTY_NAME = "Будь ласка, введіть імʼя замовника.";
export const ERROR_PHONE = `Введіть коректний номер телефону (від ${MIN_PHONE_DIGITS} до ${MAX_PHONE_DIGITS} цифр).`;
export const ERROR_SERVICE = "Оберіть послугу зі списку.";
export const ERROR_COMMENT_TOO_LONG = `Коментар не повинен перевищувати ${MAX_COMMENT_LENGTH} символів.`;

// Повертає { isValid, error }. Довжина вимірюється після видалення зайвих пробілів.
// Послуга необовʼязкова (за замовчуванням береться перша), але якщо вказана — має бути зі списку.
export function validateApplication(data) {
  if (data === null || typeof data !== "object") {
    return { isValid: false, error: ERROR_EMPTY_NAME };
  }

  const { name, phone, service, comment } = data;

  if (typeof name !== "string" || name.trim() === "") {
    return { isValid: false, error: ERROR_EMPTY_NAME };
  }

  const digits = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return { isValid: false, error: ERROR_PHONE };
  }

  if (service !== undefined && service !== "" && !SERVICES.includes(service)) {
    return { isValid: false, error: ERROR_SERVICE };
  }

  if (comment !== undefined && comment !== null) {
    if (typeof comment !== "string") {
      return { isValid: false, error: ERROR_COMMENT_TOO_LONG };
    }
    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      return { isValid: false, error: ERROR_COMMENT_TOO_LONG };
    }
  }

  return { isValid: true, error: "" };
}
