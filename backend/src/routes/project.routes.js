import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

const router = Router();

// All project routes require authentication
router.use(verifyJWT);

router.route("/").get(getProjects).post(verifyAdmin, createProject);

router
  .route("/:id")
  .get(getProjectById)
  .put(verifyAdmin, updateProject)
  .delete(verifyAdmin, deleteProject);

export default router;
