import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Plus, ShieldAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActivity } from "../../context/ActivityContext";
import { useDivision } from "../../context/DivisionContext";
import { userService } from "../../services/userService";

function Users() {
  const { logActivity } = useActivity();
  const { activeDivision } = useDivision();
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePassword = (userId: string) => {
    setShowPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", activeDivision],
    queryFn: () => userService.getUsers(activeDivision === "all" ? undefined : { sector: activeDivision }),
  });

  const handleDelete = async () => {
    if (!deleteModal) return;

    setIsDeleting(true);
    try {
      console.log(`[DEBUG] Attempting to delete user ${deleteModal.id}`);
      await userService.deleteUser(deleteModal.id);
      await queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "users"
      });
      logActivity("Deleted User", "role", "/users", deleteModal.name);
      setDeleteModal(null);
    } catch (err: any) {
      console.error("[ERROR] Delete failed:", err);
      alert(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const adminUsers = users.filter((u: any) => u.role === "SUPER_ADMIN" || u.role === "ACCOUNTS");
  const staffUsers = users.filter((u: any) => {
    const isClient = u.role === "CLIENT";
    return (u.role !== "SUPER_ADMIN" && u.role !== "ACCOUNTS") && !isClient;
  });

  return (
    <div className="p-6 relative space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <Link
          to="/create-user"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus size={16} />
          Create User
        </Link>
      </div>

      {/* Staff Users Section */}
      <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">General Staff & Operations</h2>
        </div>
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <span className="text-slate-500 font-medium italic">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Name</th>
                  <th className="text-left p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Email</th>
                  <th className="text-left p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Password</th>
                  <th className="text-left p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Phone</th>
                  <th className="text-left p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Role</th>
                  <th className="text-left p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Sector</th>
                  <th className="text-right p-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {staffUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 font-bold text-slate-800">{user.name}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] w-20 text-slate-400">
                          {showPasswords[String(user.id)] ? (user.password_plain || "********") : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(String(user.id))}
                          className="p-1 text-slate-300 hover:text-brand-600 transition-all rounded"
                        >
                          {showPasswords[String(user.id)] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{user.phone || "-"}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {user.sector || user.division || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          to={`/edit-user/${user.id}`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteModal({ id: String(user.id), name: user.name });
                          }}
                          className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staffUsers.length === 0 && !isLoading && (
              <div className="p-12 text-center text-slate-400 italic">No staff users found.</div>
            )}
          </div>
        )}
      </div>

      {/* Administrative Accounts Section */}
      {adminUsers.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={18} />
              Critical Administrative Accounts
            </h2>
            <span className="px-2 py-0.5 bg-white/20 text-white rounded text-[10px] font-black uppercase">
              {adminUsers.length} High-Level Users
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminUsers.map((user: any) => (
              <div key={user.id} className="bg-white border border-red-100 p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-black text-lg border border-red-100">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {user.role}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm truncate">{user.name}</h3>
                  <p className="text-[10px] text-slate-500 truncate mb-2">{user.email}</p>

                  {/* Password Display */}
                  <div className="flex items-center gap-2 mb-4 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 w-fit">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Password:</span>
                    <span className="font-mono text-[11px] text-slate-600 min-w-[70px]">
                      {showPasswords[String(user.id)] ? (user.password_plain || "********") : "••••••••"}
                    </span>
                    <button
                      onClick={() => togglePassword(String(user.id))}
                      className="p-1 text-slate-300 hover:text-brand-600 transition-all rounded"
                    >
                      {showPasswords[String(user.id)] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end border-t border-slate-50 pt-3">
                  <div className="flex gap-1">
                    <Link
                      to={`/edit-user/${user.id}`}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    >
                      <Edit size={14} />
                    </Link>
                    {String(user.id) !== "1" && (
                      <button
                        onClick={() => setDeleteModal({ id: String(user.id), name: user.name })}
                        className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL OVERLAY - This will be at the root level of the page */}
      {deleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldAlert size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Delete</h3>
              <p className="text-slate-600">
                Are you sure you want to permanently delete <span className="font-semibold text-slate-900">{deleteModal.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-slate-100">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
