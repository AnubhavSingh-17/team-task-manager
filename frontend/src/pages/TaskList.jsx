import React, { useState, useEffect } from "react";
import { axiosInstance } from "../config/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, CheckCircle2, Clock, AlertCircle, Circle } from "lucide-react";

const STATUS_STYLES = {
  Pending: { style: "bg-gray-100 text-gray-600", icon: Circle },
  "In Progress": { style: "bg-blue-100 text-blue-700", icon: Clock },
  Completed: { style: "bg-green-100 text-green-700", icon: CheckCircle2 },
  Overdue: { style: "bg-red-100 text-red-700", icon: AlertCircle },
};

const PRIORITY_STYLES = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-orange-100 text-orange-700",
  Low: "bg-green-100 text-green-700",
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const { user } = useAuth();

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        axiosInstance.get("/projects"),
        axiosInstance.get("/users"),
      ]);
      const fetchedProjects = projRes.data.data;
      setProjects(fetchedProjects);
      setUsers(userRes.data.data);

      // Fetch tasks from ALL projects, then merge into a flat list
      if (fetchedProjects.length > 0) {
        const taskRequests = fetchedProjects.map((p) =>
          axiosInstance.get(`/tasks/project/${p._id}`)
        );
        const taskResponses = await Promise.all(taskRequests);
        const allTasks = taskResponses.flatMap((r) => r.data.data);
        setTasks(allTasks);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/tasks", newTask);
      toast.success("Task created successfully!");
      setShowModal(false);
      setNewTask({ title: "", description: "", projectId: "", assignedTo: "", priority: "Medium", dueDate: "" });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axiosInstance.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Status updated!");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Filter tasks by selected project (if filter is active)
  const filteredTasks = selectedProject
    ? tasks.filter((t) => t.projectId === selectedProject)
    : tasks;

  // Find project name by id
  const getProjectName = (projectId) =>
    projects.find((p) => p._id === projectId)?.title || "—";

  if (loading) return <div className="p-8 text-dark-500">Loading tasks...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-dark-900">Tasks</h2>
          <p className="text-dark-600 mt-1">Track and update task progress</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project Filter Dropdown */}
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
          {user?.role === "Admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium transition-colors hover-lift"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Task Table */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card p-12 text-center text-dark-400 border-dashed border-2">
          {tasks.length === 0
            ? "No tasks yet. Create a project and add tasks to get started!"
            : "No tasks found for this project."}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-dark-600 text-sm">Task</th>
                <th className="p-4 font-semibold text-dark-600 text-sm">Project</th>
                <th className="p-4 font-semibold text-dark-600 text-sm">Assigned To</th>
                <th className="p-4 font-semibold text-dark-600 text-sm">Priority</th>
                <th className="p-4 font-semibold text-dark-600 text-sm">Due Date</th>
                <th className="p-4 font-semibold text-dark-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => {
                const statusInfo = STATUS_STYLES[task.status] || STATUS_STYLES["Pending"];
                const StatusIcon = statusInfo.icon;
                const assignedUser = task.assignedTo;
                const isMyTask = assignedUser?._id === user?._id;
                const canUpdateStatus = user?.role === "Admin" || isMyTask;

                return (
                  <tr
                    key={task._id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Task Title */}
                    <td className="p-4">
                      <p className="font-semibold text-dark-900 text-sm">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </td>

                    {/* Project */}
                    <td className="p-4">
                      <span className="text-xs font-medium bg-dark-100 text-dark-600 px-2 py-1 rounded-full">
                        {getProjectName(task.projectId)}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="p-4">
                      {assignedUser ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {assignedUser.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark-800">
                              {assignedUser.name}
                              {isMyTask && (
                                <span className="ml-1 text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full font-semibold">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-dark-400">{assignedUser.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          PRIORITY_STYLES[task.priority] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="p-4 text-sm text-dark-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {canUpdateStatus ? (
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer ${
                            STATUS_STYLES[task.status]?.style || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.style}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {task.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Task Modal (Admin Only) */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-dark-900">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design landing page"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Task details (optional)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">Project</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newTask.projectId}
                  onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                >
                  <option value="">Select a project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-800 mb-1">Assign To</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                >
                  <option value="">Select a team member...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-800 mb-1">Priority</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-800 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
