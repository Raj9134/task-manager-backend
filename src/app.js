const express = require("express");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");


console.log("authRoutes:", authRoutes);
console.log("projectRoutes:", projectRoutes);

const app = express();

app.use(express.json());


// routes
app.get("/", (req, res) => {
    res.send("Task Manager API is running 🚀");
  });
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

module.exports = app;