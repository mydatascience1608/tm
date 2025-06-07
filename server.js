const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const dataPath = path.join(__dirname, "data.json");

app.use(express.static("public"));
app.use(express.json());

// Lấy dữ liệu
app.get("/tasks", (req, res) => {
  const data = fs.readFileSync(dataPath, "utf-8");
  res.json(JSON.parse(data));
});

// Lưu dữ liệu
app.post("/tasks", (req, res) => {
  const tasks = req.body;
  fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
