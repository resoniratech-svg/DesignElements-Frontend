import { Upload, FileText, X } from "lucide-react";
import { useState } from "react";

interface Props {
  onChange?: (files: File[]) => void;
}

function DocumentUpload({ onChange }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFilesList = Array.from(selectedFiles);
    const updatedFiles = [...files, ...newFilesList];
    setFiles(updatedFiles);
    if (onChange) onChange(updatedFiles);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onChange) onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`card-hover flex flex-col items-center justify-center py-10 cursor-pointer border-2 border-dashed transition-all duration-200 rounded-xl relative
          ${isDragging 
            ? "border-brand-500 bg-brand-50/50 scale-[1.02]" 
            : "border-slate-200 hover:border-brand-300 hover:bg-brand-50/30"
          }`}
      >
        <label className="absolute inset-0 cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors
          ${isDragging ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-500"}`}
        >
          <Upload size={22} className={isDragging ? "animate-bounce" : ""} />
        </div>
        <p className="text-sm font-black text-slate-700 tracking-tight">
          {isDragging ? "Drop files here now" : "Select or Drag & Drop Documents"}
        </p>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">
          PDF, DOC, XLS, PNG up to 10MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Uploaded Files ({files.length})
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-surface-muted border border-gray-100 group animate-slide-up"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center flex-shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {file.name}
                </p>
                <p className="text-[11px] text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;