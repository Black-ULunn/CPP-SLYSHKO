// Рендер-процес не має доступу до Node.js і власної логіки перевірки:
// усе виконується через window.applicationsAPI (list, add, remove).
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

function showMessage(text, color) {
  messageElement.textContent = text;
  messageElement.style.color = color;
}

async function render() {
  const applications = await window.applicationsAPI.list(searchInput.value);
  applicationsList.innerHTML = "";

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
    date.textContent = application.dateLabel;
    text.append(date);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Видалити";
    deleteButton.addEventListener("click", async () => {
      const result = await window.applicationsAPI.remove(application.id);
      showMessage(result.ok ? "Заявку видалено." : result.error, COLOR_ERROR);
      await render();
    });

    item.append(text, deleteButton);
    applicationsList.append(item);
  });
}

async function addApplication() {
  const result = await window.applicationsAPI.add({
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
  showMessage("Заявку успішно додано та збережено у файл.", COLOR_SUCCESS);
  await render();
}

addButton.addEventListener("click", addApplication);
[nameInput, phoneInput, commentInput].forEach((input) =>
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addApplication();
  })
);
searchInput.addEventListener("input", render);

document.addEventListener("DOMContentLoaded", render);
