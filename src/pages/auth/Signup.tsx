import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, Building, User } from "lucide-react";

export default function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        company: ""
    });
    const [error, setError] = useState("");

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.name || !form.email || !form.password || !form.company) {
            setError("Please fill out all fields");
            return;
        }

        const newUser = {
            id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: form.name,
            email: form.email,
            password: form.password, // In a real app, this would be hashed
            company: form.company,
            role: "CLIENT",
            status: "Active"
        };

        const existingUsers = JSON.parse(localStorage.getItem("trek_users") || "[]");

        // Check if email already exists
        if (existingUsers.some((u: any) => u.email === form.email)) {
            setError("Email already in use");
            return;
        }

        localStorage.setItem("trek_users", JSON.stringify([...existingUsers, newUser]));

        // Also create a Client record so they appear in the Admin list
        const existingClients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
        const newClient = {
            id: `CON-${Math.floor(100 + Math.random() * 900)}`,
            name: form.name,
            Name: form.name, // Capitalized for DataTable
            email: form.email,
            Email: form.email,
            company: form.company,
            Company: form.company,
            phone: "N/A",
            Phone: "N/A",
            division: "contracting",
            contractType: "Monthly PRO",
            createdAt: new Date().toISOString()
        };
        localStorage.setItem("trek_clients", JSON.stringify([...existingClients, newClient]));
        window.dispatchEvent(new Event('storage'));

        // Alert user or just automatically redirect to login
        alert("Account created successfully! Please sign in.");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* ─── Left Panel (Branding) ───────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative items-center justify-center p-12">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative z-10 text-white max-w-md"
                >
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-white rounded-lg p-2 shadow-lg ring-1 ring-white/20 shrink-0">
                            <img src="/logo.png" alt="Design Elements Logo" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-4xl font-bold leading-tight">
                            Design Elements
                            <br />
                            <span className="text-brand-200">Client Portal</span>
                        </h1>
                    </div>
                    <p className="text-brand-200 text-lg leading-relaxed">
                        Create an account to track your project progress, manage invoices, and communicate directly with our team.
                    </p>
                    <div className="flex items-center gap-4 mt-8">
                        <div className="flex -space-x-2">
                            {["bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-cyan-400"].map((c, i) => (
                                <div key={i} className={`w-8 h-8 rounded-full ${c} ring-2 ring-brand-700`} />
                            ))}
                        </div>
                        <p className="text-brand-300 text-sm">
                            Join 50+ happy clients
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* ─── Right Panel (Form) ──────────────────────── */}
            <div className="flex-1 flex items-center justify-center bg-surface-muted p-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-[480px]"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-8 bg-white rounded-xl p-1.5 shadow-lg ring-1 ring-gray-100">
                            <img src="/logo.png" alt="Design Elements Logo" className="w-full h-full object-contain" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-float p-8 border border-gray-100">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Create Account
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Sign up to access your client dashboard
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="label" htmlFor="signup-name">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="signup-name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={form.name}
                                        className="input pl-10"
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="label" htmlFor="signup-email">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        className="input pl-10"
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Company */}
                            <div>
                                <label className="label" htmlFor="signup-company">Company</label>
                                <div className="relative">
                                    <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="signup-company"
                                        type="text"
                                        placeholder="Your Company LLC"
                                        value={form.company}
                                        className="input pl-10"
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="label" htmlFor="signup-password">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        id="signup-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        className="input pl-10"
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full btn-primary justify-center py-3 mt-2 text-base shadow-lg shadow-brand-500/25"
                            >
                                <UserPlus size={18} />
                                Create Account
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{" "}
                                <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        © 2026 Design Elements. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}