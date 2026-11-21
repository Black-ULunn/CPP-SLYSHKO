// Веб-клієнт: уся логіка перевірки, сортування й пошуку — у ядрі @rip/core.
import { ApplicationsService, SERVICES, formatApplicationDate } from "@rip/core";
import { LocalStorageAdapter } from "./localStorageAdapter.js";

const service = new ApplicationsService(new LocalStorageAdapter());

const nameInput = document.getElementById("nameInput");
const phoneInput = document.getElementById("phoneInput");
const serviceSelect = document.getElementById("serviceSelect");
const commentInput = document.getElementById("commentInput");
const searchInput = document.getElementById("searchInput");
const addButton = document.getElementById("addButton");
const messageElement = document.getElementById("message");
const applicationsList = document.getElementById("applicationsList");

const COLOR_ERROR = "#751818";
const COLOR_SUCCESS = "#138e40";

// Перелік послуг береться з ядра, а не дублюється в розмітці
SERVICES.forEach((name) => serviceSelect.append(new Option(name, name)));

function showMessage(text, color) {
  messageElement.textContent = text;
  messageElement.style.color = color;
}

function render() {
  applicationsList.innerHTML = "";
  const applications = service.list(searchInput.value);

  if (applications.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Заявок немає.";
    applicationsList.append(empty);
    return;
  }

  applications.forEach((application) => {
    const item = document.createElement("li");
    item.className = "application-item";

    const text = document.createElement("span");
    text.className = "application-text";

    const name = document.createElement("strong");
    name.textContent = application.name;

    const details = document.createElement("span");
    details.className = "application-details";
    details.textContent = `${application.phone} · ${application.service}`;

    text.append(name, details);

    if (application.comment) {
      const comment = document.createElement("span");
      comment.className = "application-content";
      comment.textContent = application.comment;
      text.append(comment);
    }

    const date = document.createElement("span");
    date.className = "application-date";
    date.textContent = formatApplicationDate(application.createdAt);
    text.append(date);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Видалити";
    deleteButton.addEventListener("click", () => {
      const result = service.remove(application.id);
      showMessage(result.ok ? "Заявку видалено." : result.error, COLOR_ERROR);
      render();
    });

    item.append(text, deleteButton);
    applicationsList.append(item);
  });
}

function addApplication() {
  const result = service.add({
    name: nameInput.value,
    phone: phoneInput.value,
    service: serviceSelect.value,
    comment: commentInput.value,
  });

  if (!result.ok) {
    showMessage(result.error, COLOR_ERROR);
    return;
  }

  nameInput.value = "";
  phoneInput.value = "";
  commentInput.value = "";
  showMessage("Заявку успішно додано.", COLOR_SUCCESS);
  render();
}

addButton.addEventListener("click", addApplication);
[nameInput, phoneInput, commentInput].forEach((input) =>
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addApplication();
  })
);
searchInput.addEventListener("input", render);

render();
