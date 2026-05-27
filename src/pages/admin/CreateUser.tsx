import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActivity } from "../../context/ActivityContext";
import { userService } from "../../services/userService";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

function CreateUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logActivity } = useActivity();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "PROJECT_MANAGER",
    division: "trading",
    status: "Active"
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      setErrorMsg(null);
      setSuccessMsg(`User "${form.name}" created successfully! Redirecting...`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      logActivity("Created New User", "role", "/users", form.name);
      setTimeout(() => navigate("/users"), 1200);
    },
    onError: (error: any) => {
      setSuccessMsg(null);
      const msg = error?.message || "Failed to create user. Please try again.";
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
    createMutation.mutate(form);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>

      <div className="bg-white p-6 rounded-xl border shadow-sm max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-in">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
              <CheckCircle size={18} className="flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 text-gray-600">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter name"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${errorMsg?.toLowerCase().includes("exists") ? "border-red-400 bg-red-50" : ""}`}
              placeholder="Enter email"
              required
            />
            {errorMsg?.toLowerCase().includes("exists") && (
              <p className="text-xs text-red-500 mt-1">This email is already registered. Use a different email address.</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">Password</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Assign an initial password"
                required
              />
              <button
                type="button"
                onClick={() => {
                  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
                  let pass = "";
                  for(let i=0; i<10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                  setForm({ ...form, password: pass });
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap text-sm"
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-600">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="PROJECT_MANAGER">Project Manager</option>
            </select>
          </div>

          {form.role !== "SUPER_ADMIN" && (
            <div>
              <label className="block text-sm mb-1 text-gray-600">Division</label>
              <select
                name="division"
                value={(form as any).division || "trading"}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              >

                <option value="trading">Trading Sector</option>
                <option value="contracting">Contracting Sector</option>
              </select>
            </div>
          )}


          <div className="pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;