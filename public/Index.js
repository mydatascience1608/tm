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

function createHourLabels() {
  const am = document.getElementById("hourLabels-am");
  const pm = document.getElementById("hourLabels-pm");
  [am, pm].forEach((el) => (el.innerHTML = ""));

  for (let i = 0; i < 24; i++) {
    const label = document.createElement("div");
    label.className = "hour-label";
    label.textContent = `${String(i).padStart(2, "0")}:00`;
    (i < 12 ? am : pm).appendChild(label);
  }
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getColorById(id) {
  return taskColors[(id - 1) % taskColors.length];
}

function createTaskElement(task, calendarEl, hourStart) {
  const top = timeToMinutes(task.start) - hourStart * 60;
  const height = timeToMinutes(task.end) - timeToMinutes(task.start);

  const taskDiv = document.createElement("div");
  taskDiv.className = "task";
  taskDiv.style.top = `${top}px`;
  taskDiv.style.height = `${height}px`;
  taskDiv.style.backgroundColor = getColorById(task.id);
  taskDiv.title = `Resource: ${task.resource}`;
  taskDiv.textContent = task.name;

  calendarEl.appendChild(taskDiv);
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

  tasks.forEach((task, i) => {
    task.id = i + 1;
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${task.id}</td>
      <td>${task.name}</td>
      <td>${task.start}</td>
      <td>${task.end}</td>
      <td>${task.resource}</td>
      <td><span class="delete-btn" onclick="deleteTask(${i})">❌</span></td>
    `;
  });
}

function renderCalendar() {
  const calAM = document.getElementById("calendar-am");
  const calPM = document.getElementById("calendar-pm");
  calAM.innerHTML = "";
  calPM.innerHTML = "";

  tasks.forEach((task) => {
    const startMin = timeToMinutes(task.start);
    const endMin = timeToMinutes(task.end);
    const noon = 12 * 60;

    // Nếu task nằm hoàn toàn trong AM
    if (endMin <= noon) {
      createTaskElement(task, calAM, 0);
    }
    // Nếu task nằm hoàn toàn trong PM
    else if (startMin >= noon) {
      createTaskElement(task, calPM, noon);
    }
    // Nếu task kéo dài từ AM sang PM
    else {
      // Phần AM: từ start đến 12:00
      createTaskElement({ ...task, end: "12:00" }, calAM, 0);
      // Phần PM: từ 12:00 đến end
      createTaskElement({ ...task, start: "12:00" }, calPM, noon);
    }
  });
}

function clearInputs() {
  ["nameInput", "startInput", "endInput", "resourceInput"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
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

  if (timeToMinutes(end) <= timeToMinutes(start)) {
    alert("Thời gian kết thúc phải sau thời gian bắt đầu!");
    return;
  }

  tasks.push({ id: tasks.length + 1, name, start, end, resource });
  renderTaskTable();
  renderCalendar();
  saveTasksToServer();
  clearInputs();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  renderTaskTable();
  renderCalendar();
  saveTasksToServer();
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
