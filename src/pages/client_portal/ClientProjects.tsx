import { useState } from "react";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  User as UserIcon,
  FileText,
  Download,
  Paperclip,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { projectService } from "../../services/projectService";
import { downloadBase64File } from "../../utils/fileUtils";

export default function ClientProjects() {
  const { user } = useAuth();
  const clientName = user?.name || "";

  const { data: projectResponse, isLoading } = useQuery({
    queryKey: ["client-projects"],
    queryFn: () => projectService.getProjects(undefined, 1, 100) // Fetch all for portal
  });

  const projects = projectResponse?.data || [];

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select first project
  const effectiveSelectedId = selectedProjectId || (projects.length > 0 ? projects[0].id : null);
  const selectedProject = projects.find((p: any) => p.id === effectiveSelectedId);

  // Calculate progress and duration based on real dates


  const getDuration = (project: any) => {
    if (!project.startDate || !project.endDate) return "N/A";
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Not Set";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const downloadFile = (doc: any) => {
    if (doc.data && doc.data.startsWith('data:')) {
      downloadBase64File(doc.data, doc.name);
    } else {
      const link = document.createElement("a");
      link.href = doc.data;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Projects</h1>
        <p className="text-sm text-slate-500 mt-1">View project details and manage project documents.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Fetching your projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
              Assigned Projects ({projects.length})
            </h2>
            {projects.length > 0 ? projects.map((project: any) => (
              <div 
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                  effectiveSelectedId === project.id
                  ? "bg-brand-600 border-brand-500 shadow-lg shadow-brand-100 ring-4 ring-brand-50/50"
                  : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    effectiveSelectedId === project.id ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500"
                  }`}>
                    <Briefcase size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold truncate ${
                      effectiveSelectedId === project.id ? "text-white" : "text-slate-800"
                    }`}>
                      {project.projectName || project.name || "Unnamed Project"}
                    </h3>
                    <div className={`flex items-center gap-1.5 mt-1 text-[10px] ${
                      effectiveSelectedId === project.id ? "text-white/70" : "text-slate-400"
                    }`}>
                      <MapPin size={10} /> {project.division || "Qatar"}
                    </div>
                  </div>
                  <ChevronRight size={16} className={`mt-1 transition-transform group-hover:translate-x-1 ${
                    effectiveSelectedId === project.id ? "text-white/50" : "text-slate-300"
                  }`} />
                </div>

                <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                   <span className={`text-[10px] font-bold uppercase py-1 px-2 rounded-lg ${
                      effectiveSelectedId === project.id 
                      ? "bg-white/20 text-white" 
                      : project.status === "Active" || project.status === "Ongoing" || project.status === "In Progress" ? "bg-emerald-50 text-emerald-600"
                      : project.status === "Completed" ? "bg-blue-50 text-blue-600"
                      : "bg-amber-50 text-amber-600"
                   }`}>
                     {project.status || "Pending"}
                   </span>
                </div>
              </div>
            )) : (
              <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                 <Briefcase size={32} className="mx-auto text-slate-300 mb-3" />
                 <p className="text-xs text-slate-500 italic">No projects found for "{clientName}".</p>
                 <p className="text-[10px] text-slate-400 mt-1">Newly created projects will appear here once assigned to you.</p>
              </div>
            )}
          </div>

          {/* Project Details / Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {selectedProject ? (
              <>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-inner">
                        <TrendingUp size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            {selectedProject.projectName || selectedProject.name}
                          </h2>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider ${
                            selectedProject.status === "Active" || selectedProject.status === "Ongoing" || selectedProject.status === "In Progress"
                              ? "bg-emerald-100 text-emerald-600" 
                              : selectedProject.status === "Completed"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-amber-100 text-amber-600"
                          }`}>
                            {selectedProject.status === "Active" || selectedProject.status === "Ongoing" || selectedProject.status === "In Progress" ? "LIVE" : (selectedProject.status || "PENDING")}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Project ID: {selectedProject.id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                             <Calendar size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Start Date</span>
                          </div>
                          <p className="text-xs font-black text-slate-800">{formatDate(selectedProject.startDate)}</p>
                       </div>
                       <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                             <Clock size={12} />
                             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Duration</span>
                          </div>
                          <p className="text-xs font-black text-slate-800">{getDuration(selectedProject)}</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-brand-50 rounded-2xl border border-brand-100">
                       <h4 className="text-sm font-black text-brand-700 mb-3 flex items-center gap-2">
                          <TrendingUp size={16} />
                          Project Overview
                       </h4>
                       <div className="text-sm text-brand-600/90 leading-relaxed space-y-3">
                         {selectedProject.description ? (
                           <p className="whitespace-pre-line">{selectedProject.description}</p>
                         ) : (
                           <p>Your project is currently in the <strong>{selectedProject.status || "Pending"}</strong> phase.</p>
                         )}
                         <div className="pt-4 mt-4 border-t border-brand-100/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {selectedProject.budget && (
                             <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                               <span className="text-[10px] font-bold text-brand-400 uppercase">Budget</span>
                               <span className="text-xs font-black text-brand-700">{selectedProject.budget}</span>
                             </div>
                           )}
                           {selectedProject.manager && (
                             <div className="flex items-center gap-2 p-2 bg-white/50 rounded-lg">
                               <span className="text-[10px] font-bold text-brand-400 uppercase pl-1 border-l-2 border-brand-200">Manager</span>
                               <div className="flex items-center gap-1.5 text-xs font-black text-brand-700">
                                 <UserIcon size={12} className="text-brand-400" />
                                 {selectedProject.manager}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>

                    {/* Documents Section */}
                    {(() => {
                      const allDocs = [...(selectedProject.documents || [])];
                      if (selectedProject.uploadedDocument) {
                        allDocs.unshift({
                          id: "main-project-doc",
                          name: `${selectedProject.projectName || selectedProject.name || 'Project'}_Document`, 
                          data: selectedProject.uploadedDocument as string,
                          size: (selectedProject.uploadedDocument as string).length * 0.75, // Rough estimate for Base64 to bytes
                          type: "application/pdf",
                          uploadedAt: new Date().toISOString()
                        });
                      }

                      return allDocs.length > 0 && (
                        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500/20" />
                          <h4 className="text-sm font-black text-slate-800 mb-5 flex items-center gap-2">
                            <Paperclip size={16} className="text-brand-500" />
                            Project Resources & Documents
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {allDocs.map((doc: any) => (
                              <div key={doc.id} className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl hover:border-brand-200 hover:bg-white hover:shadow-md transition-all group">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-50">
                                    <FileText size={20} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">{formatFileSize(doc.size || 0)}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadFile(doc)}
                                  className="p-2.5 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                                  title="Download"
                                >
                                  <Download size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 border-dashed text-slate-300">
                 <Briefcase size={64} strokeWidth={1} className="mb-4" />
                 <p className="font-bold text-sm">
                   {projects.length === 0 ? "No projects assigned yet" : "Select a project to view detailed tracking"}
                 </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
