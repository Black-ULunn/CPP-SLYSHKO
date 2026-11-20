// Чисті функції: без DOM, localStorage та файлів.
import { SERVICES } from "./applicationValidation.js";

// Створює заявку з унікальним id, обрізаними полями та датою створення
export function createApplication(data, id, now = new Date()) {
  return {
    id,
    name: data.name.trim(),
    phone: data.phone.trim(),
    service: data.service ? data.service : SERVICES[0],
    comment: typeof data.comment === "string" ? data.comment.trim() : "",
    createdAt: now.toISOString(),
  };
}

// Дата у форматі дд.мм.рррр; для некоректної дати — порожній рядок
export function formatApplicationDate(value) {
  const date = new Date(value);
  if (value === undefined || value === null || Number.isNaN(date.getTime())) {
    return "";
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function timeOf(application) {
  const time = new Date(application.createdAt).getTime();
  return Number.isNaN(time) ? application.id : time;
}

// Спочатку нові; вихідний масив не змінюється; старі записи без createdAt — за id
export function sortApplicationsByDate(applications) {
  return [...applications].sort((a, b) => timeOf(b) - timeOf(a));
}

// Пошук без урахування регістру за імʼям, телефоном, послугою та коментарем
export function filterApplicationsByQuery(applications, query) {
  if (typeof query !== "string" || query.trim() === "") {
    return applications;
  }
  const needle = query.trim().toLowerCase();
  return applications.filter((application) =>
    [application.name, application.phone, application.service, application.comment]
      .join(" ")
      .toLowerCase()
      .includes(needle)
  );
}

// Відкидає некоректні записи зі сховища (пошкоджений файл чи JSON)
export function sanitizeApplications(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        Number.isFinite(item.id) &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        typeof item.phone === "string"
    )
    .map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      service: typeof item.service === "string" ? item.service : SERVICES[0],
      comment: typeof item.comment === "string" ? item.comment : "",
      ...(typeof item.createdAt === "string" ? { createdAt: item.createdAt } : {}),
    }));
}
