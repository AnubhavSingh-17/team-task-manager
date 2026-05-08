import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, CheckSquare, ArrowRight, Eye, EyeOff, ShieldCheck, User2 } from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Member" });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await register(form.name, form.email, form.password, form.role);
    setSubmitting(false);
    if (success) navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-surface2">
      {/* Branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-dark-950 p-12 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">TeamTask</span>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Join your team.<br />
            <span className="text-gradient">Build something great.</span>
          </h2>
          <p className="text-dark-400 text-base leading-relaxed">
            Register as an Admin to create and manage projects, or as a Member to collaborate and complete assigned tasks.
          </p>
        </div>
        <p className="text-dark-500 text-sm">© 2025 TeamTask · All rights reserved</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-dark-900">Create account</h1>
            <p className="text-dark-400 text-sm mt-1">Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="text" required className="form-input pl-10" placeholder="John Doe" value={form.name} onChange={set("name")} />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input type="email" required autoComplete="email" className="form-input pl-10" placeholder="you@example.com" value={form.email} onChange={set("email")} />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="form-input pl-10 pr-10"
                  placeholder="min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                />
                <button type="button" tabIndex={-1} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role picker cards */}
            <div>
              <label className="form-label">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "Member", label: "Member", desc: "Collaborate on tasks", icon: User2, color: "brand" },
                  { value: "Admin", label: "Admin", desc: "Manage projects & team", icon: ShieldCheck, color: "violet" },
                ].map(({ value, label, desc, icon: Icon, color }) => (
                  <label key={value} className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all duration-150 ${
                    form.role === value
                      ? color === "brand"
                        ? "border-brand-500 bg-brand-50"
                        : "border-violet-500 bg-violet-50"
                      : "border-dark-200 hover:border-dark-300 bg-white"
                  }`}>
                    <input type="radio" name="role" value={value} className="sr-only" checked={form.role === value} onChange={set("role")} />
                    <Icon className={`w-5 h-5 mb-2 ${form.role === value ? (color === "brand" ? "text-brand-600" : "text-violet-600") : "text-dark-400"}`} />
                    <p className={`text-sm font-semibold ${form.role === value ? (color === "brand" ? "text-brand-700" : "text-violet-700") : "text-dark-700"}`}>{label}</p>
                    <p className="text-xs text-dark-400 mt-0.5">{desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
