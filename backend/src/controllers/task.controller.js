import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Task } from "../models/task.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, projectId, assignedTo, priority, dueDate } =
    req.body;

  if (!title || !projectId || !assignedTo || !dueDate) {
    throw new ApiError(400, "Missing required task fields");
  }

  const task = await Task.create({
    title,
    description,
    projectId,
    assignedTo,
    priority: priority || "Medium",
    status: "Pending",
    dueDate,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTasksForProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const tasks = await Task.find({ projectId }).populate(
    "assignedTo",
    "name email"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Check if member is trying to update a task not assigned to them
  if (req.user.role === "Member" && !task.assignedTo.equals(req.user._id)) {
    throw new ApiError(403, "You can only update tasks assigned to you");
  }

  task.status = status;
  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

export { createTask, getTasksForProject, updateTaskStatus, deleteTask };
