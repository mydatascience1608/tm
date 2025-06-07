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

let tasks = [];

// Tạo nhãn giờ cho từng cột
function createHourLabels() {
  const hourLabelsAM = document.getElementById("hourLabels-am");
  const hourLabelsPM = document.getElementById("hourLabels-pm");
  hourLabelsAM.innerHTML = "";
  hourLabelsPM.innerHTML = "";
  // AM: 00:00 - 11:59
  for (let i = 0; i < 12; i++) {
    const label = document.createElement("div");
    label.className = "hour-label";
    label.textContent = `${String(i).padStart(2, "0")}:00`;
    hourLabelsAM.appendChild(label);
  }
  // PM: 12:00 - 23:59
  for (let i = 12; i < 24; i++) {
    const label = document.createElement("div");
    label.className = "hour-label";
    label.textContent = `${String(i).padStart(2, "0")}:00`;
    hourLabelsPM.appendChild(label);
  }
}

// Đổi time string ("hh:mm") thành phút kể từ 00:00
function timeToMinutes(timeStr) {
  const [hour, minute] = timeStr.split(":").map(Number);
  return hour * 60 + minute;
}
// Lấy màu theo id
function getColorById(id) {
  return taskColors[(id - 1) % taskColors.length];
}

// Thêm task vào lịch sáng (AM) hoặc chiều (PM)
function createTaskElement(task, calendarId, hourStart) {
  const calendar = document.getElementById(calendarId);
  // Chỉ tạo task nếu nằm hoàn toàn trong block AM hoặc PM
  const top = timeToMinutes(task.start) - hourStart * 60;
  const height = timeToMinutes(task.end) - timeToMinutes(task.start);

  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.style.top = `${top}px`;
  taskDiv.style.height = `${height}px`;
  taskDiv.style.backgroundColor = getColorById(task.id);
  taskDiv.title = `Resource: ${task.resource}`;
  taskDiv.textContent = task.name;

  calendar.appendChild(taskDiv);
}

// Hiển thị bảng task
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
    task.id = index + 1;
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${task.id}</td>
      <td>${task.name}</td>
      <td>${task.start}</td>
      <td>${task.end}</td>
      <td>${task.resource}</td>
      <td><span class="delete-btn" onclick="deleteTask(${index})">❌</span></td>
    `;
  });
}

// Hiển thị task lên 2 calendar
function renderCalendar() {
  const calAM = document.getElementById("calendar-am");
  const calPM = document.getElementById("calendar-pm");
  calAM.innerHTML = "";
  calPM.innerHTML = "";

  tasks.forEach((task) => {
    const startMin = timeToMinutes(task.start);
    const endMin = timeToMinutes(task.end);

    if (startMin < 12 * 60 && endMin <= 12 * 60) {
      // Chỉ nằm trong AM
      createTaskElement(task, "calendar-am", 0);
    } else if (startMin >= 12 * 60 && endMin <= 24 * 60) {
      // Chỉ nằm trong PM
      createTaskElement(task, "calendar-pm", 12);
    } else if (startMin < 12 * 60 && endMin > 12 * 60) {
      // Nếu task kéo dài qua cả 2 cột, chia làm 2 phần
      // Phần sáng: 00:00 đến 11:59
      let amTask = { ...task, end: "12:00" };
      createTaskElement(amTask, "calendar-am", 0);
      // Phần chiều: 12:00 đến kết thúc
      let pmTask = { ...task, start: "12:00" };
      createTaskElement(pmTask, "calendar-pm", 12);
    }
  });
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

  if (timeToMinutes(end) <= timeToMinutes(start)) {
    alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
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

window.onload = function () {
  createHourLabels();
  loadTasksFromServer();
};
