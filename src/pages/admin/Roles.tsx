import { useState } from "react";
import { Link } from "react-router-dom";
import { useActivity } from "../../context/ActivityContext";

function Roles() {
  const { logActivity } = useActivity();
  const [roles, setRoles] = useState([
    { id: "1", name: "Super Admin", description: "Full system access", users: "1", created: "2026-01-01", updated: "2026-03-01" },
    { id: "2", name: "Accounts", description: "Invoices and payments", users: "2", created: "2026-01-10", updated: "2026-03-05" }
  ]);

  const handleDelete = (id: string) => {
    if (id === "1") {
      alert("Cannot delete Super Admin role.");
      return;
    }
    const roleToDelete = roles.find(r => r.id === id);
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter(r => r.id !== id));
      if (roleToDelete) {
        logActivity("Deleted Role", "role", "/roles", roleToDelete.name);
      }
    }
  };
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles Management</h1>

        <Link to="/permissions" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
          + Create Role
        </Link>
      </div>

      <div className="bg-white shadow rounded">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Role Name</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Users</th>
              <th className="text-left p-3">Created At</th>
              <th className="text-left p-3">Updated At</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map(role => (
              <tr key={role.id} className="border-t">
                <td className="p-3 font-medium">{role.name}</td>
                <td className="p-3">{role.description}</td>
                <td className="p-3">{role.users}</td>
                <td className="p-3 text-sm text-gray-500">{role.created}</td>
                <td className="p-3 text-sm text-gray-500">{role.updated}</td>
                <td className="p-3 flex gap-2">
                  <Link to="/permissions" className="text-blue-600 hover:underline">Edit</Link>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Roles;