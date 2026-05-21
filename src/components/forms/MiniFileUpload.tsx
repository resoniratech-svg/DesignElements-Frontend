import { Upload, FileText, Check, X } from "lucide-react";

interface Props {
  label?: string;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  accept?: string;
  className?: string;
}

export default function MiniFileUpload({ 
  label, 
  onFileSelect, 
  selectedFile, 
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg",
  className = ""
}: Props) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-[10px] uppercase font-bold text-slate-400">{label}</label>}
      <div className="relative group">
        {!selectedFile ? (
          <label className="flex items-center gap-2 p-2 border border-slate-200 border-dashed rounded-lg bg-slate-50 hover:bg-white hover:border-brand-300 transition-all cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept={accept}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onFileSelect(file);
              }}
            />
            <div className="w-6 h-6 rounded bg-brand-50 text-brand-500 flex items-center justify-center">
              <Upload size={12} />
            </div>
            <span className="text-xs text-slate-500 font-medium">Click to upload doc</span>
          </label>
        ) : (
          <div className="flex items-center justify-between p-2 border border-brand-200 rounded-lg bg-brand-50/50 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
                <FileText size={12} />
              </div>
              <p className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</p>
              <Check size={12} className="text-emerald-500 flex-shrink-0" />
            </div>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
