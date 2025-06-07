// Màu khác nhau theo ID
const taskColors = [
  "#007bff",
  "#28a745",
  "#dc3545",
  "#ffc107",
  "#17a2b8",
  "#6f42c1",
  "#fd7e14",
  "#20c997",
  "#6610f2",
  "#e83e8c",
];

// Tạo nhãn giờ
const hourLabels = document.getElementById("hourLabels");
for (let i = 0; i < 24; i++) {
  const label = document.createElement("div");
  label.className = "hour-label";
  label.textContent = `${String(i).padStart(2, "0")}:00`;
  hourLabels.appendChild(label);
}

function timeToPosition(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

// Tạo task trên calendar
function createTaskElement(id, name, start, end) {
  const calendar = document.getElementById("calendar");
  const top = timeToPosition(start);
  const height = timeToPosition(end) - top;

  const task = document.createElement("div");
  task.className = "task";
  task.dataset.id = id;
  task.style.top = `${top}px`;
  task.style.height = `${height}px`;
  task.style.backgroundColor = taskColors[(id - 1) % taskColors.length];
  task.textContent = name;

  calendar.appendChild(task);
}

// Xóa task trên lịch theo ID
function deleteTaskById(id) {
  const calendar = document.getElementById("calendar");
  const task = calendar.querySelector(`.task[data-id="${id}"]`);
  if (task) {
    task.remove();
  }
}

// Cập nhật lại ID trong bảng và calendar sau khi xóa
function updateTableAndCalendar() {
  const rows = [...document.querySelectorAll("#taskTable tbody tr")].slice(1); // Bỏ dòng nhập
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  rows.forEach((row, index) => {
    const id = index + 1;
    row.cells[0].textContent = id;
    row.cells[5].innerHTML = `<span class="delete-btn" onclick="deleteRow(this)">❌</span>`;
    row.dataset.id = id;

    const name = row.cells[1].textContent;
    const start = row.cells[2].textContent;
    const end = row.cells[3].textContent;

    createTaskElement(id, name, start, end);
  });
}

// Xóa dòng trong bảng
function deleteRow(btn) {
  const row = btn.closest("tr");
  row.remove();
  updateTableAndCalendar();
}

// Thêm task
function addTask() {
  const name = document.getElementById("nameInput").value.trim();
  const start = document.getElementById("startInput").value;
  const end = document.getElementById("endInput").value;
  const resource = document.getElementById("resourceInput").value.trim();

  if (!name || !start || !end || !resource) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const tbody = document.querySelector("#taskTable tbody");
  const newRow = tbody.insertRow();
  const rowCount = tbody.rows.length - 1; // Không tính dòng nhập
  const id = rowCount;

  newRow.dataset.id = id;
  newRow.innerHTML = `
    <td>${id}</td>
    <td>${name}</td>
    <td>${start}</td>
    <td>${end}</td>
    <td>${resource}</td>
    <td><span class="delete-btn" onclick="deleteRow(this)">❌</span></td>
  `;

  // Vẽ task
  createTaskElement(id, name, start, end);

  // Reset input
  document.getElementById("nameInput").value = "";
  document.getElementById("startInput").value = "";
  document.getElementById("endInput").value = "";
  document.getElementById("resourceInput").value = "";
}

let tasks = [];

function loadTasksFromServer() {
  fetch("/tasks")
    .then((res) => res.json())
    .then((data) => {
      tasks = data;
      renderTaskTable();
      renderCalendar();
    });
}

function saveTasksToServer() {
  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tasks),
  });
}

function renderTaskTable() {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = `
    <tr>
      <td>#</td>
      <td><input type="text" id="nameInput" /></td>
      <td><input type="time" id="startInput" /></td>
      <td><input type="time" id="endInput" /></td>
      <td><input type="text" id="resourceInput" /></td>
      <td></td>
    </tr>
  `;

  tasks.forEach((task, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${task.name}</td>
      <td>${task.start}</td>
      <td>${task.end}</td>
      <td>${task.resource}</td>
      <td><span class="delete-btn" onclick="deleteTask(${index})">❌</span></td>
    `;
  });
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  tasks.forEach((task, index) => {
    createTaskElement(index + 1, task.name, task.start, task.end);
  });
}

function addTask() {
  const name = document.getElementById("nameInput").value.trim();
  const start = document.getElementById("startInput").value;
  const end = document.getElementById("endInput").value;
  const resource = document.getElementById("resourceInput").value.trim();

  if (!name || !start || !end || !resource) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  tasks.push({ id: tasks.length + 1, name, start, end, resource });
  saveTasksToServer();
  renderTaskTable();
  renderCalendar();

  document.getElementById("nameInput").value = "";
  document.getElementById("startInput").value = "";
  document.getElementById("endInput").value = "";
  document.getElementById("resourceInput").value = "";
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasksToServer();
  renderTaskTable();
  renderCalendar();
}

function timeToPosition(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

function createTaskElement(id, name, start, end) {
  const calendar = document.getElementById("calendar");
  const top = timeToPosition(start);
  const height = timeToPosition(end) - top;

  const task = document.createElement("div");
  task.className = "task";
  task.style.top = `${top}px`;
  task.style.height = `${height}px`;
  task.style.backgroundColor = getColorById(id);
  task.textContent = name;
  calendar.appendChild(task);
}

function getColorById(id) {
  const colors = [
    "#007bff",
    "#28a745",
    "#dc3545",
    "#ffc107",
    "#17a2b8",
    "#6f42c1",
    "#fd7e14",
    "#20c997",
    "#6610f2",
    "#e83e8c",
  ];
  return colors[(id - 1) % colors.length];
}

window.onload = loadTasksFromServer;
