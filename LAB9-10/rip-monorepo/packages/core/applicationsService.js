import { validateApplication } from "./applicationValidation.js";
import {
  createApplication,
  filterApplicationsByQuery,
  sanitizeApplications,
  sortApplicationsByDate,
} from "./applicationUtils.js";

export const ERROR_NOT_FOUND = "Заявку не знайдено.";

// Сервіс отримує адаптер ззовні (впровадження залежностей)
export class ApplicationsService {
  constructor(adapter) {
    this.adapter = adapter;
  }

  readAll() {
    return sanitizeApplications(this.adapter.load());
  }

  list(query = "") {
    return sortApplicationsByDate(filterApplicationsByQuery(this.readAll(), query));
  }

  add(data) {
    const { isValid, error } = validateApplication(data);
    if (!isValid) {
      return { ok: false, error };
    }

    const applications = this.readAll();
    const maxId = applications.reduce((max, item) => Math.max(max, item.id), 0);
    // id унікальний навіть за однакового часу створення
    const id = Math.max(Date.now(), maxId + 1);
    const application = createApplication(data, id);

    this.adapter.save([...applications, application]);
    return { ok: true, application };
  }

  remove(id) {
    const applications = this.readAll();
    const rest = applications.filter((item) => item.id !== id);
    if (rest.length === applications.length) {
      return { ok: false, error: ERROR_NOT_FOUND };
    }
    this.adapter.save(rest);
    return { ok: true };
  }
}
