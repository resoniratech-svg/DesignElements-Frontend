import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DocumentUpload from "../../components/DocumentUpload";
import DivisionTiles from "../../components/forms/DivisionTiles";
import { useDivision } from "../../context/DivisionContext";
import type { DivisionId } from "../../constants/divisions";
import type { License } from "../../types/client";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { userService } from "../../services/userService";
import MiniFileUpload from "../../components/forms/MiniFileUpload";

function CreateClient() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDivision } = useDivision();
  
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    contractType: "Monthly PRO",
    division: (activeDivision === "all" ? "" : activeDivision) as DivisionId,
    startDate: "",
    renewalDate: "",
    address: "",
    qid: "",
    crNumber: "",
    computerCard: "",
  });

  const [licenses, setLicenses] = useState<License[]>([
    { type: "Trade License", number: "", expiryDate: "", file: null }
  ]);

  const [qidFile, setQidFile] = useState<File | null>(null);
  const [crFile, setCrFile] = useState<File | null>(null);
  const [compCardFile, setCompCardFile] = useState<File | null>(null);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: any) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      navigate("/clients");
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to create client: ${serverMessage}`);
    }
  });

  useEffect(() => {
    if (activeDivision !== "all") {
      setForm(prev => ({ ...prev, division: activeDivision as DivisionId }));
    } else {
      setForm(prev => ({ ...prev, division: "" as any }));
    }
  }, [activeDivision]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name === "name" || name === "company") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (["phone", "qid", "crNumber", "computerCard"].includes(name)) {
      value = value.replace(/[^0-9]/g, "");
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleLicenseChange = (index: number, field: keyof License, value: any) => {
    const newLicenses = [...licenses];
    newLicenses[index] = { ...newLicenses[index], [field]: value };
    setLicenses(newLicenses);
  };

  const addLicense = () => {
    setLicenses([...licenses, { type: "", number: "", expiryDate: "", file: null }]);
  };

  const removeLicense = (index: number) => {
    if (licenses.length > 1) {
      setLicenses(licenses.filter((_, i) => i !== index));
    }
  };

  const handleDivisionChange = (id: DivisionId | "all") => {
    setForm({ ...form, division: id as DivisionId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let uploadedDocs: any[] = [];
    let qidDocUrl = "";
    let crDocUrl = "";
    let compCardDocUrl = "";
    let contractDocUrl = "";

    const uploadFile = async (file: File, module: string) => {
      const formData = new FormData();
      formData.append("files", file);
      const token = localStorage.getItem("token");
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${apiBase}/upload?module=${module}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      return result.success ? result.data[0].url : "";
    };

    try {
      // 1. Individual Mandatories
      if (qidFile) qidDocUrl = await uploadFile(qidFile, "legal");
      if (crFile) crDocUrl = await uploadFile(crFile, "legal");
      if (compCardFile) compCardDocUrl = await uploadFile(compCardFile, "legal");
      if (contractFile) contractDocUrl = await uploadFile(contractFile, "contracts");

      // 2. Licenses
      const updatedLicenses = [...licenses];
      for (let i = 0; i < updatedLicenses.length; i++) {
        if (updatedLicenses[i].file) {
          updatedLicenses[i].documentUrl = await uploadFile(updatedLicenses[i].file as File, "licenses");
        }
      }

      // 3. Supporting Docs
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach((file) => formData.append("files", file));
        const token = localStorage.getItem("token");
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/upload?module=general`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const result = await res.json();
        if (result.success) uploadedDocs = result.data;
      }

      const userPayload = {
        name: form.name,
        contactPerson: form.name,
        email: form.email,
        phone: form.phone,
        password: "DefaultPassword123", // Internal default since field was removed from UI
        role: "CLIENT",
        sector: form.division,
        division: form.division,
        company_name: form.company,
        companyName: form.company,
        address: form.address,
        qid: form.qid,
        cr_number: form.crNumber,
        computer_card: form.computerCard,
        start_date: form.startDate,
        renewal_date: form.renewalDate,
        contract_type: form.contractType,
        licenses: updatedLicenses.filter(l => l.number),
        documents: uploadedDocs,
        qid_doc_url: qidDocUrl,
        cr_doc_url: crDocUrl,
        computer_card_doc_url: compCardDocUrl,
        contract_doc_url: contractDocUrl,
        Company: form.company,
        Name: form.name
      };

      createMutation.mutate(userPayload);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to upload documents or save client. See console.");
    }
  };

  return (
    <>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
        Create Client
      </h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg border border-slate-100 shadow-sm max-w-4xl space-y-6 sm:space-y-8 mx-auto md:mx-0">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sector Selection (Visual Tiles) */}
          <DivisionTiles 
            label="Select Division / Sector" 
            selectedId={form.division} 
            onChange={handleDivisionChange} 
          />

          {form.division ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                <div className="col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Basic Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Full Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="+974 XXXX XXXX"
                  />
                </div>

                <div className="col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 mt-4">Mandatory Business Documents</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Qatar ID (QID)</label>
                    <input
                      name="qid"
                      value={form.qid}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Enter QID Number"
                    />
                  </div>
                  <MiniFileUpload 
                    label="QID Document" 
                    selectedFile={qidFile} 
                    onFileSelect={setQidFile} 
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CR Number</label>
                    <input
                      name="crNumber"
                      value={form.crNumber}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                      placeholder="Commercial Registration No."
                    />
                  </div>
                  <MiniFileUpload 
                    label="CR Document" 
                    selectedFile={crFile} 
                    onFileSelect={setCrFile} 
                  />
                </div>

                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Computer Card</label>
                    <input
                      name="computerCard"
                      value={form.computerCard}
                      onChange={handleChange}
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                      placeholder="Enter Computer Card Number"
                    />
                  </div>
                  <MiniFileUpload 
                    label="Computer Card Doc" 
                    selectedFile={compCardFile} 
                    onFileSelect={setCompCardFile} 
                  />
                </div>

                <div className="col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Licenses</label>
                    <button 
                      type="button" 
                      onClick={addLicense}
                      className="text-brand-600 text-xs font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Another License
                    </button>
                  </div>
                  
                  {licenses.map((license, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">License Type</label>
                        <input
                          value={license.type}
                          onChange={(e) => handleLicenseChange(index, "type", e.target.value)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="e.g. Trade License"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">License No.</label>
                        <input
                          value={license.number}
                          onChange={(e) => handleLicenseChange(index, "number", e.target.value)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                          placeholder="Ex: 12345/6"
                        />
                      </div>
                      <div className="col-span-1 md:col-span-3">
                        <MiniFileUpload 
                          label="License Document" 
                          selectedFile={license.file as File || null} 
                          onFileSelect={(file) => handleLicenseChange(index, "file", file)} 
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Expiry Date</label>
                        <input
                          type="date"
                          value={license.expiryDate}
                          onChange={(e) => handleLicenseChange(index, "expiryDate", e.target.value)}
                          className="w-full border border-slate-200 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      {licenses.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeLicense(index)}
                          className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="col-span-2">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 mt-4">Contract Details</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contract Type</label>
                    <select
                      name="contractType"
                      value={form.contractType === "Monthly PRO" || form.contractType === "Project Contract" || form.contractType === "Trading Customer" ? form.contractType : "Manual Entry"}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, contractType: val === "Manual Entry" ? "" : val });
                      }}
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                      <option>Monthly PRO</option>
                      <option>Project Contract</option>
                      <option>Trading Customer</option>
                      <option>Manual Entry</option>
                    </select>
                  </div>
                  {(form.contractType !== "Monthly PRO" && form.contractType !== "Project Contract" && form.contractType !== "Trading Customer") && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-brand-600 mb-1">Enter Custom Contract Type</label>
                      <input
                        name="contractType"
                        value={form.contractType}
                        onChange={handleChange}
                        className="w-full border border-brand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-brand-50/30"
                        placeholder="Type manual contract name..."
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Renewal Date</label>
                      <input
                        type="date"
                        name="renewalDate"
                        value={form.renewalDate}
                        onChange={handleChange}
                        className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                      />
                    </div>
                  </div>
                  <MiniFileUpload 
                    label="Contract Document" 
                    selectedFile={contractFile} 
                    onFileSelect={setContractFile} 
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Full Office/Site Address"
                  />
                </div>

                <div className="col-span-2 pt-4">
                  <label className="block text-sm font-bold text-slate-800 mb-4">Attach Agreement & Supporting Docs</label>
                  <DocumentUpload onChange={setUploadedFiles} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/clients")}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full sm:w-auto px-8 py-2.5 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Client Profile"
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-slate-50/50 p-12 text-center rounded-xl border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Plus className="text-slate-300" size={32} />
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Please select a sector above to begin entering basic information</p>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

export default CreateClient;