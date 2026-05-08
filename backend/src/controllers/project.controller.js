import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProject = asyncHandler(async (req, res) => {
  const { title, description, members } = req.body;

  if (!title) {
    throw new ApiError(400, "Project title is required");
  }

  const project = await Project.create({
    title,
    description,
    members: members || [],
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const getProjects = asyncHandler(async (req, res) => {
  let projects;
  if (req.user.role === "Admin") {
    // Admins see all projects
    projects = await Project.find().populate("members", "name email");
  } else {
    // Members only see projects they are assigned to
    projects = await Project.find({ members: req.user._id }).populate(
      "members",
      "name email"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id).populate("members", "name email");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // If member, check if they are part of the project
  if (
    req.user.role === "Member" &&
    !project.members.some((memberId) => memberId._id.equals(req.user._id))
  ) {
    throw new ApiError(403, "You do not have access to this project");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, members } = req.body;

  const project = await Project.findByIdAndUpdate(
    id,
    { title, description, members },
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByIdAndDelete(id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

export {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
