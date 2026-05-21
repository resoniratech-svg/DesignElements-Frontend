import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Upload, 
  Trash2, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import DocumentUpload from "../../components/DocumentUpload";
import type { Client, License } from "../../types/client";
import dayjs from "dayjs";

export default function ClientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [client, setClient] = useState<Client | null>(() => {
    const allClients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
    return allClients.find((c: any) => c.email === user?.email || c.Email === user?.email) || null;
  });

  const [form, setForm] = useState(() => {
    const allClients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
    const found = allClients.find((c: any) => c.email === user?.email || c.Email === user?.email);
    return {
      name: found?.Name || found?.name || "",
      company: found?.Company || found?.company || "",
      email: found?.Email || found?.email || "",
      phone: found?.Phone || found?.phone || "",
      address: found?.address || "",
      qid: found?.qid || "",
      crNumber: found?.crNumber || "",
      computerCard: found?.computerCard || "",
      contractType: found?.contractType || "Monthly PRO"
    };
  });

  const [licenses, setLicenses] = useState<License[]>(() => {
    const allClients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
    const found = allClients.find((c: any) => c.email === user?.email || c.Email === user?.email);
    return found?.licenses || [];
  });

  useEffect(() => {
    if (!user) return;
    const allClients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
    const found = allClients.find((c: any) => c.email === user.email || c.Email === user.email);
    
    if (found) {
      setClient(found);
      setForm({
        name: found.Name || found.name || "",
        company: found.Company || found.company || "",
        email: found.Email || found.email || "",
        phone: found.Phone || found.phone || "",
        address: found.address || "",
        qid: found.qid || "",
        crNumber: found.crNumber || "",
        computerCard: found.computerCard || "",
        contractType: found.contractType || "Monthly PRO"
      });
      setLicenses(found.licenses || []);
    }
    setIsLoading(false);
  }, [user]);

  const handleSave = () => {
    const allClients = JSON.parse(localStorage.getItem("trek_clients") || "[]");
    const updatedClients = allClients.map((c: any) => {
      if (c.email === user?.email || c.Email === user?.email) {
        return {
          ...c,
          ...form,
          Name: form.name,
          Company: form.company,
          Email: form.email,
          Phone: form.phone,
          licenses,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    localStorage.setItem("trek_clients", JSON.stringify(updatedClients));
    setIsEditing(false);
    alert("Profile updated successfully!");
    window.dispatchEvent(new Event('storage'));
  };

  const handleLicenseChange = (index: number, field: keyof License, value: string) => {
    const newLicenses = [...licenses];
    newLicenses[index] = { ...newLicenses[index], [field]: value };
    setLicenses(newLicenses);
  };

  if (isLoading) return <div className="p-8 animate-pulse text-slate-400">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ─── Header Section ────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/20">
            {form.company?.charAt(0) || "C"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{form.company || "Company Profile"}</h1>
            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
              <ShieldCheck size={16} className="text-emerald-500" />
              {form.contractType} Client
            </p>
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-600/20"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left Column: Info ────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <section className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={20} className="text-brand-500" />
              General Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
                {isEditing ? (
                  <input 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                ) : (
                  <p className="text-slate-700 font-semibold text-lg">{form.name || "N/A"}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Registered Name</label>
                {isEditing ? (
                  <input 
                    value={form.company} 
                    onChange={e => setForm({...form, company: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                ) : (
                  <p className="text-slate-700 font-semibold text-lg">{form.company || "N/A"}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={16} />
                  <span>{form.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                {isEditing ? (
                  <input 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" 
                  />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <Phone size={16} />
                    <span>{form.phone || "Add phone number"}</span>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Address</label>
                {isEditing ? (
                  <textarea 
                    value={form.address} 
                    onChange={e => setForm({...form, address: e.target.value})}
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
                  />
                ) : (
                  <div className="flex items-start gap-2 text-slate-600 font-medium">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />
                    <span>{form.address || "No office address provided"}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Compliance & Licenses */}
          <section className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              Compliance Verified
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              Business Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">QID / National ID</p>
                {isEditing ? (
                  <input 
                    value={form.qid} 
                    onChange={e => setForm({...form, qid: e.target.value})}
                    className="w-full bg-white p-1.5 border rounded-lg text-sm outline-none" 
                  />
                ) : (
                  <p className="font-mono text-slate-700 font-bold">{form.qid || "Missing"}</p>
                )}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CR Number</p>
                {isEditing ? (
                  <input 
                    value={form.crNumber} 
                    onChange={e => setForm({...form, crNumber: e.target.value})}
                    className="w-full bg-white p-1.5 border rounded-lg text-sm outline-none" 
                  />
                ) : (
                  <p className="font-mono text-slate-700 font-bold">{form.crNumber || "Missing"}</p>
                )}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Establishment Card</p>
                {isEditing ? (
                  <input 
                    value={form.computerCard} 
                    onChange={e => setForm({...form, computerCard: e.target.value})}
                    className="w-full bg-white p-1.5 border rounded-lg text-sm outline-none" 
                  />
                ) : (
                  <p className="font-mono text-slate-700 font-bold">{form.computerCard || "Missing"}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-bold text-slate-700">Trade Licenses & Permits</h3>
                 {isEditing && (
                   <button 
                    onClick={() => setLicenses([...licenses, { type: "Trade License", number: "", expiryDate: "" }])}
                    className="text-brand-600 text-xs font-bold hover:underline"
                   >
                     + Add License
                   </button>
                 )}
               </div>

               {licenses.length === 0 && !isEditing && (
                 <div className="py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm">No licenses recorded. Update your profile to add them.</p>
                 </div>
               )}

               <div className="space-y-3">
                 {licenses.map((l, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-600 shadow-sm">
                           <FileText size={20} />
                        </div>
                        <div>
                           {isEditing ? (
                             <input 
                               value={l.type} 
                               onChange={e => handleLicenseChange(i, 'type', e.target.value)}
                               className="text-sm font-bold bg-transparent border-b border-brand-200 outline-none w-32"
                             />
                           ) : (
                             <p className="text-sm font-bold text-slate-800">{l.type}</p>
                           )}
                           <div className="flex items-center gap-3 mt-0.5">
                             <span className="text-[11px] font-mono text-slate-500 uppercase">#{l.number}</span>
                             <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                               <Clock size={10} />
                               Exp: {l.expiryDate ? dayjs(l.expiryDate).format("MMM DD, YYYY") : "N/A"}
                             </span>
                           </div>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <button 
                          onClick={() => setLicenses(licenses.filter((_, idx) => idx !== i))}
                          className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {!isEditing && l.expiryDate && dayjs(l.expiryDate).diff(dayjs(), 'day') < 30 && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-[10px] font-bold">
                           <AlertCircle size={12} />
                           Expiring Soon
                        </div>
                      )}
                      
                      {!isEditing && l.expiryDate && dayjs(l.expiryDate).diff(dayjs(), 'day') >= 30 && (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold">
                           <CheckCircle2 size={12} />
                           Valid
                        </div>
                      )}
                   </div>
                 ))}
               </div>
            </div>
          </section>
        </div>

        {/* ─── Right Column: Docs ───────────────────────── */}
        <div className="space-y-8">
          {/* Document Upload */}
          <section className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload size={20} className="text-brand-500" />
              Upload Documents
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">Keep your company records up to date for seamless compliance.</p>
            
            <DocumentUpload onChange={setUploadedFiles} />
            
            <button 
              disabled={uploadedFiles.length === 0}
              className="w-full mt-4 py-3 bg-brand-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 transition"
            >
              Update Storage
            </button>
          </section>

          {/* Service Status */}
          <section className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-lg text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
             <ShieldCheck size={40} className="text-brand-400 mb-4 opacity-75" />
             <h3 className="text-lg font-bold mb-1">PRO Membership</h3>
             <p className="text-slate-400 text-xs mb-6">You have an active PRO service contract.</p>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                   <span className="text-slate-400">Status</span>
                   <span className="font-bold text-emerald-400">Active</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                   <span className="text-slate-400">Renews On</span>
                   <span className="font-bold">{client?.renewalDate || "Dec 31, 2026"}</span>
                </div>
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition">
                   View Service History
                </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
