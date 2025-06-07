// Màu sắc cho từng task theo ID
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

let tasks = [];

window.onload = loadTasksFromServer;

// Chuyển thời gian thành vị trí (đơn vị phút)
function timeToPosition(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}

// Trả về màu sắc tương ứng ID
function getColorById(id) {
  return taskColors[(id - 1) % taskColors.length];
}

// Tạo nhãn giờ dọc
function generateHourLabels() {
  const hourLabels = document.getElementById("hourLabels");
  for (let i = 0; i < 24; i++) {
    const label = document.createElement("div");
    label.className = "hour-label";
    label.textContent = `${String(i).padStart(2, "0")}:00`;
    hourLabels.appendChild(label);
  }
}
generateHourLabels();

// Tạo một task trên lịch
function createTaskElement(id, name, start, end, resource) {
  const calendar = document.getElementById("calendar");
  const top = timeToPosition(start);
  const height = timeToPosition(end) - top;

  const task = document.createElement("div");
  task.className = "task";
  task.style.top = `${top}px`;
  task.style.height = `${height}px`;
  task.style.backgroundColor = getColorById(id);
  task.title = `Resource: ${resource}`;
  task.textContent = name;

  calendar.appendChild(task);
}

// Tải task từ server
function loadTasksFromServer() {
  fetch("/tasks")
    .then((res) => res.json())
    .then((data) => {
      tasks = data;
      renderTaskTable();
      renderCalendar();
    });
}

// Gửi task lên server
function saveTasksToServer() {
  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tasks),
  });
}

// Hiển thị bảng task
function renderTaskTable() {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";

  // Dòng nhập task mới
  const inputRow = tbody.insertRow();
  inputRow.innerHTML = `
    <td>#</td>
    <td><input type="text" id="nameInput" /></td>
    <td><input type="time" id="startInput" /></td>
    <td><input type="time" id="endInput" /></td>
    <td><input type="text" id="resourceInput" /></td>
    <td><button onclick="addTask()">➕</button></td>
  `;

  // Các dòng task
  tasks.forEach((task, index) => {
    task.id = index + 1;
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${task.id}</td>
      <td>${task.name}</td>
      <td>${task.start}</td>
      <td>${task.end}</td>
      <td>${task.resource}</td>
      <td><button onclick="deleteTask(${index})">❌</button></td>
    `;
  });
}

// Hiển thị task lên lịch
function renderCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  tasks.forEach((task) => {
    createTaskElement(task.id, task.name, task.start, task.end, task.resource);
  });
}

// Thêm task mới
function addTask() {
  const name = document.getElementById("nameInput").value.trim();
  const start = document.getElementById("startInput").value;
  const end = document.getElementById("endInput").value;
  const resource = document.getElementById("resourceInput").value.trim();

  if (!name || !start || !end || !resource) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  if (timeToPosition(end) <= timeToPosition(start)) {
    alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
    return;
  }

  tasks.push({ id: tasks.length + 1, name, start, end, resource });
  saveTasksToServer();
  renderTaskTable();
  renderCalendar();

  // Reset form
  document.getElementById("nameInput").value = "";
  document.getElementById("startInput").value = "";
  document.getElementById("endInput").value = "";
  document.getElementById("resourceInput").value = "";
}

// Xóa task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasksToServer();
  renderTaskTable();
  renderCalendar();
}
