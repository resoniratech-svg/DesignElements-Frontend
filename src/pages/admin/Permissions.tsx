import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { sidebarMenu } from "../../config/sidebarMenu";
import { getDynamicPermissions, saveDynamicPermissions, fetchAndSyncPermissions, type PermissionsData } from "../../utils/permissions";
import { Save, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import type { Role } from "../../types/user";

const ROLES: Role[] = ["SUPER_ADMIN", "PROJECT_MANAGER"];

export default function Permissions() {
  const [permissions, setPermissions] = useState<PermissionsData>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadPermissions = async () => {
      // First populate with local cached values for instant rendering
      const cachedPerms = getDynamicPermissions();
      const initial: PermissionsData = {};
      sidebarMenu.forEach((section) => {
        initial[section.section] = cachedPerms[section.section] || section.roles;
      });
      setPermissions(initial);

      // Then fetch fresh values from database to ensure accuracy
      try {
        const freshPerms = await fetchAndSyncPermissions();
        const updated: PermissionsData = {};
        sidebarMenu.forEach((section) => {
          updated[section.section] = freshPerms[section.section] || section.roles;
        });
        setPermissions(updated);
      } catch (error) {
        console.error("Failed to load permissions from database", error);
      }
    };

    loadPermissions();
  }, []);

  const handleToggle = (sectionName: string, role: Role) => {
    setPermissions((prev) => {
      const currentRoles = prev[sectionName] || [];
      const hasRole = currentRoles.includes(role);

      let newRoles;
      if (hasRole) {
        newRoles = currentRoles.filter((r) => r !== role);
      } else {
        newRoles = [...currentRoles, role];
      }

      return {
        ...prev,
        [sectionName]: newRoles,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      await saveDynamicPermissions(permissions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save permissions to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 pb-24 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <PageHeader showBack
          title="Module Permissions"
          subtitle="Dynamically configure which roles have access to which sidebar modules."
        />
        <div className="flex items-center gap-4">
          {saved && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 text-sm font-semibold animate-in fade-in duration-200">
              <CheckCircle2 size={16} />
              Permissions saved — sidebar updated!
            </div>
          )}
          {errorMsg && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-semibold">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg hover:bg-brand-700 transition shadow-lg shadow-brand-200 font-bold disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-700">Module / Section</th>
                {ROLES.map((role) => (
                  <th key={role} className="p-4 font-bold text-slate-700 text-center uppercase text-sm tracking-wider">
                    {role.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sidebarMenu.map((section, idx) => (
                <tr key={section.section} className={idx !== sidebarMenu.length - 1 ? "border-b border-slate-100" : ""}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="font-bold text-slate-800">{section.section}</span>
                    </div>
                  </td>
                  {ROLES.map((role) => {
                    const isChecked = permissions[section.section]?.includes(role) || false;
                    // Prevent SUPER_ADMIN from disabling their own User Management access
                    const isLocked = section.section === "User Management" && role === "SUPER_ADMIN";

                    return (
                      <td key={role} className="p-4 text-center align-middle">
                        <label className={`relative inline-flex items-center ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input
                            type="checkbox"
                            checked={isLocked ? true : isChecked}
                            onChange={() => !isLocked && handleToggle(section.section, role)}
                            disabled={isLocked}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}