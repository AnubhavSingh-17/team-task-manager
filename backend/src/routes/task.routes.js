import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  createTask,
  getTasksForProject,
  updateTaskStatus,
  deleteTask,
} from "../controllers/task.controller.js";

const router = Router();

// All task routes require authentication
router.use(verifyJWT);

router.route("/project/:projectId").get(getTasksForProject);

router.route("/").post(verifyAdmin, createTask);

router
  .route("/:id")
  .patch(updateTaskStatus) // Both Admin and Member can update status
  .delete(verifyAdmin, deleteTask);

export default router;
