import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  User2,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
];

const Sidebar = ({ user, logout, onClose }) => {
  const location = useLocation();
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-dark-950 text-white">
      {/* Logo area */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">TeamTask</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-dark-400 hover:text-white md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="section-title px-3">MENU</p>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={isActive ? "nav-link-active" : "nav-link"}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.name}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/6 mb-2">
          <div className="avatar avatar-md text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
              {user?.role === "Admin" ? (
                <ShieldCheck className="w-3 h-3 text-brand-400" />
              ) : (
                <User2 className="w-3 h-3 text-dark-400" />
              )}
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface2">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar user={user} logout={logout} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              user={user}
              logout={logout}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden sticky top-0 z-30 h-14 bg-white border-b border-dark-100 flex items-center justify-between px-4 shadow-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-1 text-dark-600 rounded-lg hover:bg-dark-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-dark-900">TeamTask</span>
          </div>
          <div className="avatar avatar-sm text-xs">{user?.name?.charAt(0).toUpperCase()}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
