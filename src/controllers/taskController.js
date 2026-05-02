const Task = require("../models/Task");
const User = require("../models/user");
const Project = require("../models/Project");

exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, dueDate } = req.body;

    if (!title || !assignedTo || !projectId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔍 Check user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({ message: "Assigned user not found" });
    }

    // 🔍 Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      dueDate,
      createdBy: req.user.userId
    });

    res.status(201).json({
      message: "Task created",
      task
    });

  } catch (err) {
    console.log("ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTaskStatus = async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status } = req.body;
  
      const allowedStatus = ["pending", "in-progress", "done"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
  
      const task = await Task.findById(taskId);
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // 🔐 Authorization check
      if (
        task.assignedTo.toString() !== req.user.userId &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }
  
      task.status = status;
      await task.save();
  
      res.status(200).json({
        message: "Task updated",
        task
      });
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  };
  exports.getDashboard = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // get all tasks assigned to user
      const tasks = await Task.find({ assignedTo: userId });
  
      const now = new Date();
  
      const dashboard = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === "pending").length,
        inProgress: tasks.filter(t => t.status === "in-progress").length,
        done: tasks.filter(t => t.status === "done").length,
        overdue: tasks.filter(
          t => t.dueDate && t.dueDate < now && t.status !== "done"
        ).length
      };
  
      res.status(200).json({
        message: "Dashboard fetched",
        data: dashboard
      });
  
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Server error" });
    }
  };

  exports.getTasks = async (req, res) => {
    try {
      const tasks = await Task.find({ assignedTo: req.user.userId });
  
      res.status(200).json({ tasks });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };