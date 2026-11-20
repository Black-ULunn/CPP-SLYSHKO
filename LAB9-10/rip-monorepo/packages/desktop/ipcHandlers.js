import { formatApplicationDate } from "@rip/core";

const ERROR_BAD_DATA = "Некоректні дані заявки.";
const ERROR_BAD_ID = "Некоректний ідентифікатор заявки.";

// Додає до заявки поле dateLabel — дату для показу
function withDateLabel(application) {
  return { ...application, dateLabel: formatApplicationDate(application.createdAt) };
}

// Обробники IPC над ApplicationsService. Не залежать від electron.
// Типи даних із рендер-процесу перевіряються тут: пересилати можна що завгодно.
export function createHandlers(service) {
  return {
    list(query) {
      const text = typeof query === "string" ? query : "";
      return service.list(text).map(withDateLabel);
    },

    add(data) {
      if (data === null || typeof data !== "object" || Array.isArray(data)) {
        return { ok: false, error: ERROR_BAD_DATA };
      }
      const { name, phone, service: serviceName, comment } = data;
      if (typeof name !== "string" || typeof phone !== "string") {
        return { ok: false, error: ERROR_BAD_DATA };
      }
      const result = service.add({
        name,
        phone,
        service: typeof serviceName === "string" ? serviceName : undefined,
        comment: typeof comment === "string" ? comment : "",
      });
      return result.ok ? { ok: true, application: withDateLabel(result.application) } : result;
    },

    remove(id) {
      const numeric = typeof id === "string" && id.trim() !== "" ? Number(id) : id;
      if (typeof numeric !== "number" || !Number.isFinite(numeric)) {
        return { ok: false, error: ERROR_BAD_ID };
      }
      return service.remove(numeric);
    },
  };
}
