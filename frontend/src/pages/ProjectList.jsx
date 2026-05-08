import React, { useState, useEffect } from "react";
import { axiosInstance } from "../config/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Users, Calendar, ChevronRight } from "lucide-react";

const ROLE_COLORS = {
  Admin: "bg-purple-100 text-purple-700",
  Member: "bg-brand-100 text-brand-700",
};

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", members: [] });
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        axiosInstance.get("/projects"),
        axiosInstance.get("/users"),
      ]);
      setProjects(projRes.data.data);
      setUsers(userRes.data.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/projects", newProject);
      toast.success("Project created successfully!");
      setShowModal(false);
      setNewProject({ title: "", description: "", members: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 text-dark-500">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark-900">Projects</h2>
          <p className="text-dark-600 mt-1">Manage your team's projects</p>
        </div>
        {user?.role === "Admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover-lift"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Project Cards */}
      {projects.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-500 border-dashed border-2">
          No projects found.{" "}
          {user?.role === "Admin" && "Click 'New Project' to get started!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="glass-card p-6 hover-lift flex flex-col"
            >
              {/* Title */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-dark-900">{project.title}</h3>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              </div>

              {/* Description */}
              <p className="text-dark-500 text-sm mb-4 line-clamp-2 flex-1">
                {project.description || "No description provided."}
              </p>

              {/* Team Members Section */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">
                  Team Members
                </p>
                {project.members && project.members.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-1.5 pr-2.5 py-1"
                      >
                        {/* Avatar initials */}
                        <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-dark-700 font-medium">
                          {member.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            ROLE_COLORS[member.role] || "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No members assigned yet
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-dark-400 border-t border-gray-100 pt-3 mt-auto">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{project.members?.length || 0} Member{project.members?.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal (Admin Only) */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-dark-900">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="What is this project about?"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">
                  Assign Team Members
                </label>
                <div className="border border-gray-200 rounded-lg p-2 space-y-1 max-h-36 overflow-y-auto">
                  {users.map((u) => (
                    <label
                      key={u._id}
                      className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="rounded text-brand-500"
                        checked={newProject.members.includes(u._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProject({
                              ...newProject,
                              members: [...newProject.members, u._id],
                            });
                          } else {
                            setNewProject({
                              ...newProject,
                              members: newProject.members.filter(
                                (id) => id !== u._id
                              ),
                            });
                          }
                        }}
                      />
                      <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-800">{u.name}</p>
                        <p className="text-xs text-dark-400">{u.email} · {u.role}</p>
                      </div>
                    </label>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-2">
                      No other users registered yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-dark-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-medium transition-colors"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
