import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { axiosInstance } from "../config/axios";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Circle,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Small helpers ────────────────────────────────────────────────
const STATUS_BADGE = {
  Pending:     { style: "badge-gray",   dot: "bg-dark-400"   },
  "In Progress":{ style: "badge-blue",  dot: "bg-blue-500"   },
  Completed:   { style: "badge-green",  dot: "bg-emerald-500" },
  Overdue:     { style: "badge-red",    dot: "bg-red-500"     },
};
const PRIORITY_BADGE = {
  High:   "badge-red",
  Medium: "badge-orange",
  Low:    "badge-green",
};

// ─── Stat card ───────────────────────────────────────────────────
const StatCard = ({ title, value, sub, icon: Icon, gradient, loading }) => (
  <div className="stat-card">
    {/* Decorative gradient blob */}
    <div
      className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${gradient}`}
    />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-dark-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-12 bg-dark-100 rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-extrabold text-dark-900 leading-none">{value}</p>
        )}
        {sub && <p className="text-xs text-dark-400 mt-1.5">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-15`}>
        <Icon className="w-5 h-5 text-current opacity-80" />
      </div>
    </div>
  </div>
);

// ─── Main Overview ────────────────────────────────────────────────
const Overview = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes] = await Promise.all([axiosInstance.get("/projects")]);
        const fetchedProjects = projRes.data.data || [];
        setProjects(fetchedProjects);

        if (fetchedProjects.length > 0) {
          const taskResults = await Promise.all(
            fetchedProjects.map((p) =>
              axiosInstance.get(`/tasks/project/${p._id}`).catch(() => ({ data: { data: [] } }))
            )
          );
          setAllTasks(taskResults.flatMap((r) => r.data.data));
        }
      } catch (_) {
        // silent — API unavailable or empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── Derived stats
  const pending    = allTasks.filter((t) => t.status === "Pending").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const completed  = allTasks.filter((t) => t.status === "Completed").length;
  const overdue    = allTasks.filter((t) => t.status === "Overdue").length;

  // Recent 5 projects
  const recentProjects = [...projects].slice(0, 5);

  // Upcoming tasks sorted by dueDate (nearest first, not completed)
  const upcoming = [...allTasks]
    .filter((t) => t.status !== "Completed" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  const today = new Date();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Greeting ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-900">
            Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span className="text-gradient">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-dark-400 mt-0.5">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          to="/tasks"
          className="btn-primary text-sm"
        >
          <TrendingUp className="w-4 h-4" />
          View All Tasks
        </Link>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Projects"
          value={projects.length}
          sub={`${projects.length === 1 ? "1 active" : `${projects.length} active`}`}
          icon={Briefcase}
          gradient="bg-violet-500"
          loading={loading}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          sub="tasks in flight"
          icon={Clock}
          gradient="bg-blue-500"
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={completed}
          sub={allTasks.length ? `${Math.round((completed / allTasks.length) * 100)}% done` : "—"}
          icon={CheckCircle2}
          gradient="bg-emerald-500"
          loading={loading}
        />
        <StatCard
          title="Overdue"
          value={overdue}
          sub={overdue ? "need attention" : "all on track 🎉"}
          icon={AlertTriangle}
          gradient="bg-red-500"
          loading={loading}
        />
      </div>

      {/* ─── Progress bar ─── */}
      {allTasks.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-dark-700">Overall Task Progress</p>
            <span className="text-sm font-bold text-brand-600">
              {Math.round((completed / allTasks.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-dark-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((completed / allTasks.length) * 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-dark-400 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-dark-300" />{pending} Pending</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />{inProgress} In Progress</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />{completed} Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />{overdue} Overdue</span>
          </div>
        </div>
      )}

      {/* ─── Bottom two-col ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Recent Projects */}
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-900">Recent Projects</h2>
            <Link to="/projects" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-dark-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-dark-300">
              <Briefcase className="w-10 h-10 mb-2" />
              <p className="text-sm">No projects yet</p>
              <Link to="/projects" className="text-xs text-brand-500 mt-1 hover:underline">
                Create your first project →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-dark-50">
              {recentProjects.map((p) => (
                <div key={p._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="avatar avatar-md text-sm">
                    {p.title?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-dark-900 truncate">{p.title}</p>
                    <p className="text-xs text-dark-400 truncate">
                      {p.members?.length || 0} member{p.members?.length !== 1 ? "s" : ""}
                      {p.description ? ` · ${p.description.slice(0, 40)}` : ""}
                    </p>
                  </div>
                  <Link to="/projects">
                    <ArrowUpRight className="w-4 h-4 text-dark-300 hover:text-brand-500 transition-colors" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming tasks */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark-900">Upcoming Deadlines</h2>
            <Link to="/tasks" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-0.5">
              All tasks <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-dark-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-dark-300">
              <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-300" />
              <p className="text-sm">No upcoming tasks</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcoming.map((t) => {
                const dueDate = new Date(t.dueDate);
                const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                const isNear = daysLeft <= 2;
                const statusInfo = STATUS_BADGE[t.status] || STATUS_BADGE["Pending"];
                return (
                  <div key={t._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-50 transition-colors">
                    <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-800 truncate">{t.title}</p>
                      <p className={`text-xs mt-0.5 font-medium ${isNear ? "text-red-500" : "text-dark-400"}`}>
                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? "Due today!" : `${daysLeft}d left`}
                      </p>
                    </div>
                    <span className={`badge ${PRIORITY_BADGE[t.priority] || "badge-gray"} text-[10px]`}>
                      {t.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
