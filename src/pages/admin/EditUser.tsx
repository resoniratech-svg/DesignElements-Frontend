import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActivity } from "../../context/ActivityContext";
import { userService } from "../../services/userService";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { logActivity } = useActivity();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        role: "PROJECT_MANAGER",
        division: "trading",
        status: "Active"
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const { data: users = [], isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.getUsers(),
    });

    useEffect(() => {
        if (users.length > 0 && id) {
            const userToEdit = users.find(u => u.id === id);
            if (userToEdit) {
                setForm({
                    name: userToEdit.name,
                    email: userToEdit.email,
                    phone: userToEdit.phone || "",
                    role: userToEdit.role,

                    division: (
                        userToEdit.sector ||
                        userToEdit.division ||
                        "TRADING"
                    )
                        .toString()
                        .trim()
                        .toLowerCase(),

                    status:
                        userToEdit.status?.toLowerCase() === "active"
                            ? "Active"
                            : "Inactive"
                });
            }
        }
    }, [users, id]);

    const updateMutation = useMutation({
        mutationFn: (data: any) => userService.updateUser(id!, data),
        onSuccess: async () => {

            setErrorMsg(null);

            setSuccessMsg(
                `User "${form.name}" updated successfully! Redirecting...`
            );

            await queryClient.invalidateQueries({
                predicate: (query) =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === "users"
            });

            logActivity(
                "Updated User Profile",
                "role",
                "/users",
                form.name
            );

            setTimeout(() => navigate("/users"), 1200);
        },
        onError: (error: any) => {
            setSuccessMsg(null);
            const msg = error?.message || "Failed to update user. Please try again.";
            setErrorMsg(msg);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setErrorMsg(null);
        setSuccessMsg(null);

        let value = e.target.value;
        if (e.target.name === "name") {
            value = value.replace(/[^a-zA-Z\s]/g, "");
        } else if (e.target.name === "phone") {
            value = value.replace(/[^0-9]/g, "");
        }

        setForm({
            ...form,
            [e.target.name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);

        // If Super Admin or Accounts, we might want to clear division on the backend too, 
        // but for now the UI will just not show it.
        updateMutation.mutate(form);
    };

    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/users")}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Edit User Profile</h1>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Feedback Messages */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-in slide-in-from-top-2">
                            <AlertCircle size={18} className="flex-shrink-0" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
                            <CheckCircle size={18} className="flex-shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="Enter name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="Enter email"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                            >
                                <option value="SUPER_ADMIN">Super Admin</option>
                                <option value="PROJECT_MANAGER">Project Manager</option>
                            </select>
                        </div>

                        {form.role !== "SUPER_ADMIN" && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Division / Sector</label>
                                <select
                                    name="division"
                                    value={form.division}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                                    required
                                >

                                    <option value="trading">Trading Sector</option>
                                    <option value="contracting">Contracting Sector</option>
                                </select>
                            </div>
                        )}

                    </div>

                    <div className="pt-6 border-t border-slate-50 flex gap-4">
                        <button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70"
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Profile"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUser;
