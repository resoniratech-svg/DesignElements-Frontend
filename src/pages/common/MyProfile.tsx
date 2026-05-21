import { useState, useMemo } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  Briefcase, 
  Clock, 
  Camera, 
  Lock, 
  LogOut, 
  Users, 
  BarChart3, 
  ShieldCheck,
  Building,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ─── Role-Based Widgets ──────────────────────────────────

const AdminWidget = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-sm">
        <Users size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">Total Clients</p>
        <p className="text-2xl font-bold text-slate-800">{stats.clients || 0}</p>
      </div>
    </div>
    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-4">
      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-sm">
        <Briefcase size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-tight">Total Employees</p>
        <p className="text-2xl font-bold text-slate-800">{stats.employees || 0}</p>
      </div>
    </div>
  </div>
);

const HRWidget = ({ stats }: { stats: any }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg border border-rose-100">
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-rose-500" size={20} />
        <div>
          <p className="text-sm font-bold text-rose-700 underline">Expiring Staff Documents</p>
          <p className="text-xs text-rose-600">3 employees require renewal this week</p>
        </div>
      </div>
      <button className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-sm hover:bg-rose-100 transition">View All</button>
    </div>
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
       <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2 px-1">
          <span>Active Staff</span>
          <span>{stats.employees || 0}</span>
       </div>
       <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full" style={{ width: '85%' }} />
       </div>
    </div>
  </div>
);

const ManagerWidget = ({ stats }: { stats: any }) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-center">
       <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Team Size</p>
       <p className="text-2xl font-bold text-indigo-700">{stats.employees > 5 ? stats.employees : 12}</p>
    </div>
    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center">
       <p className="text-xs font-bold text-amber-400 uppercase mb-1">Active Projects</p>
       <p className="text-2xl font-bold text-amber-700">5</p>
    </div>
  </div>
);

const AccountantWidget = ({ stats }: { stats: any }) => (
  <div className="p-6 bg-emerald-900 rounded-lg text-white shadow-xl relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
    <BarChart3 className="text-emerald-400 mb-3" size={24} />
    <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">Monthly Revenue Tracking</p>
    <p className="text-3xl font-bold">QAR {(stats.clients * 50000).toLocaleString()}</p>
    <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-200 font-medium">
       <span>85% Invoices Paid</span>
       <span className="text-emerald-400">+12% vs last month</span>
    </div>
  </div>
);

const ClientWidget = ({ clients }: { clients: any[] }) => (
  <div className="space-y-3">
    {clients.map((c, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-brand-200 transition group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-bold group-hover:bg-brand-600 group-hover:text-white transition">
            {c.Company?.charAt(0) || c.company?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{c.Company || c.company}</p>
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 uppercase">
              <ShieldCheck size={10} className="text-emerald-500" />
              {c.contractType || "Active Contract"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Renewal</p>
          <p className="text-xs font-bold text-slate-700">{c.renewalDate || "Dec 31, 2026"}</p>
        </div>
      </div>
    ))}
    {clients.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center">No clients assigned yet.</p>}
  </div>
);

// ─── Main Component ──────────────────────────────────────

export default function MyProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Mock Stats Calculation
  const stats = useMemo(() => {
     const clients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
     const employees = JSON.parse(localStorage.getItem("trek_employees") || "[]");
     return {
       clients: clients.length,
       employees: employees.length,
       assignedClients: clients // For now just show all for simplicity, but could filter by user email
     };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      alert("Profile image uploaded successfully!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* ─── Profile Header ─── */}
      <div className="bg-white p-8 md:p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full -mr-32 -mt-32 opacity-30 select-none pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-lg overflow-hidden ring-4 ring-brand-50 bg-slate-100 flex items-center justify-center text-slate-400">
               {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <User size={64} className="opacity-20" />
               )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2 bg-brand-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-brand-700 transition transform hover:scale-110">
               <Camera size={18} />
               <input type="file" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name}</h1>
              <span className="inline-flex px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold uppercase tracking-widest border border-brand-100 w-fit mx-auto md:mx-0">
                {user?.role?.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
               <div className="flex items-center gap-1.5">
                  <Mail size={16} className="text-slate-400" />
                  {user?.email}
               </div>
               <div className="flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400" />
                  ID: <span className="font-mono text-xs">{user?.id}</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Status: <span className="text-emerald-600">Active</span>
               </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl border border-red-100 text-red-500 font-bold text-sm flex items-center gap-2 hover:bg-red-50 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column: Details ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1.5 bg-slate-100/80 rounded-lg w-fit">
             <button 
              onClick={() => setActiveTab("info")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'info' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Information
             </button>
             <button 
              onClick={() => setActiveTab("permissions")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'permissions' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Permissions
             </button>
             <button 
              onClick={() => setActiveTab("security")}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'security' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                Security
             </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-8 min-h-[400px]">
             {activeTab === "info" && (
                <div className="space-y-8 animate-fade-in-up">
                   {/* Personal Info */}
                   <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                         <User size={20} className="text-brand-500" />
                         General Profile
                      </h3>
                      {!isEditing ? (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="text-xs font-bold text-brand-600 hover:underline"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setIsEditing(false)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition"
                          >
                            Cancel
                          </button>
                           <button 
                            onClick={() => { setIsEditing(false); alert("Profile update simulation successful!"); }}
                            className="text-xs font-bold text-emerald-600 hover:underline"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                            <input disabled={!isEditing} defaultValue={user?.name} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-700 disabled:opacity-75" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <input disabled defaultValue={user?.email} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-300 pointer-events-none" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                            <input disabled={!isEditing} defaultValue={user?.phone || "+974 5555 1234"} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-slate-700" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">UserID / Username</label>
                            <input disabled defaultValue={user?.id} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-slate-500 italic pointer-events-none" />
                         </div>
                      </div>
                   </div>

                   {/* Employee Integration Section */}
                   <div className="pt-8 border-t border-slate-50">
                      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                         <Briefcase size={20} className="text-indigo-500" />
                         Employee Record Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Employee ID</p>
                            <p className="text-sm font-bold text-slate-700">{user?.employeeId || "EMP-9421"}</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Joined Date</p>
                            <p className="text-sm font-bold text-slate-700">Oct 12, 2024</p>
                         </div>
                         <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Designation</p>
                            <p className="text-sm font-bold text-slate-700">Senior Operations Lead</p>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === "permissions" && (
                <div className="space-y-8 animate-fade-in-up">
                   <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Shield size={20} className="text-emerald-500" />
                         Role Permissions Summary
                      </h3>
                      <p className="text-sm text-slate-500 mb-6">As a <span className="font-bold text-slate-700">{user?.role}</span>, you have the following access rights across modules.</p>
                      
                      <div className="space-y-3">
                         {["Employees", "Inventory", "Billing", "Reports"].map((module, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="font-bold text-slate-700">{module}</span>
                              <div className="flex gap-2">
                                 {["C", "R", "U", "D"].map((perm, pi) => (
                                   <div key={pi} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${i === 3 && pi !== 1 ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white shadow-sm'}`}>
                                      {perm}
                                   </div>
                                 ))}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}

             {activeTab === "security" && (
                <div className="space-y-8 animate-fade-in-up max-w-md">
                   <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                         <Lock size={20} className="text-amber-500" />
                         Security Settings
                      </h3>
                      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Password change simulation successful!"); }}>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                            <input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">New Password</label>
                            <input type="password" placeholder="New Password" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-500" />
                         </div>
                         <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-4 hover:bg-slate-800 transition shadow-lg">Update Security</button>
                      </form>
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* ─── Right Column: Role Insights ─── */}
        <div className="space-y-6">
           {/* Section 1: Role Specific Insights (DYNAMIC) */}
           <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
              <h2 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart3 size={16} className="text-brand-500" />
                Performance Insights
              </h2>
              
              {user?.role === "SUPER_ADMIN" && <AdminWidget stats={stats} />}
              {user?.role === "HR" && <HRWidget stats={stats} />}
              {user?.role === "MANAGER" && <ManagerWidget stats={stats} />}
              {user?.role === "ACCOUNTS" && <AccountantWidget stats={stats} />}
              {(user?.role === "EMPLOYEE" || user?.role === "PROJECT_MANAGER") && (
                 <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-2">My Manager</p>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">SM</div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">Samsudheen</p>
                          <p className="text-[10px] text-slate-500">Operation Manager</p>
                       </div>
                    </div>
                 </div>
              )}
              {user?.role === "CLIENT" && (
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                   <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Company Status</p>
                   <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <ShieldCheck size={18} />
                      All Docs Compliant
                   </div>
                </div>
              )}
           </div>

           {/* Section 2: Dynamic Client List (Applicable to Multi-Client users) */}
           <div className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building size={16} className="text-brand-500" />
                Associated Clients
              </h2>
              <ClientWidget clients={stats.assignedClients} />
           </div>

           {/* Section 3: Division Context */}
           <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Operations Context</h3>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                 <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <p className="text-xs text-slate-400">Assigned Sector</p>
                    <p className="text-sm font-bold">{user?.division?.toUpperCase() || "GLOBAL (ALL SECTORS)"}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
