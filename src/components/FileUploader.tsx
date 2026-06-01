import { useState, useCallback, useEffect } from "react";
import { Upload, X, File, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import api from "../services/api";


interface FileUploaderProps {

  existingFiles?: string[];

  onUpload?: (files: File[], urls: string[]) => void;

  maxSize?: number;

  accept?: string[];

  multiple?: boolean;

  module?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  url?: string;
}

function FileUploader({

  existingFiles = [],

  onUpload,

  maxSize = 10,

  accept = ["image/*", ".pdf", ".doc", ".docx"],

  multiple = true,

  module = "general"

}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  useEffect(() => {

    if (existingFiles.length > 0) {

      const mappedFiles = existingFiles.map((url, index) => ({

        file: {
          name: url.split("/").pop() || `file-${index}`
        } as File,

        progress: 100,

        status: "success" as const,

        url
      }));

      setUploadingFiles(mappedFiles);
    }

  }, [existingFiles]);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    const newFiles: UploadingFile[] = filesArray.map(file => {
      if (file.size > maxSize * 1024 * 1024) {
        return { file, progress: 0, status: "error", error: `File size exceeds ${maxSize}MB` };
      }
      return { file, progress: 0, status: "uploading" };
    });

    setUploadingFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);

    // Filter only valid files for actual upload
    const validFilesToUpload = newFiles.filter(f => f.status === "uploading");

    for (const f of validFilesToUpload) {
      const formData = new FormData();
      formData.append("files", f.file);

      try {
        const response = await api.post(`/upload?module=${module}`, formData, {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadingFiles(prev => prev.map(item =>
              item.file === f.file ? { ...item, progress } : item
            ));
          }
        });

        const uploadedUrl = response.data?.data?.[0]?.url;

        setUploadingFiles(prev => prev.map(item =>
          item.file === f.file ? { ...item, status: "success", progress: 100, url: uploadedUrl } : item
        ));

        if (onUpload) {
          onUpload([f.file], [uploadedUrl]);
        }
      } catch (err: any) {
        setUploadingFiles(prev => prev.map(item =>
          item.file === f.file ? { ...item, status: "error", error: err.response?.data?.message || err.message } : item
        ));
      }
    }
  }, [maxSize, multiple, onUpload, module]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = uploadingFiles.filter((_, i) => i !== index);
    setUploadingFiles(updated);
    if (onUpload) {
      const remainingFiles = updated.map(f => f.file);
      const remainingUrls = updated.map(f => f.url).filter((url): url is string => !!url);
      onUpload(remainingFiles, remainingUrls);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 flex flex-col items-center justify-center text-center group
          ${isDragging
            ? "border-brand-500 bg-brand-50/50 scale-[1.01]"
            : "border-slate-200 hover:border-brand-300 hover:bg-slate-50"
          }
        `}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          multiple={multiple}
          accept={accept.join(",")}
          onChange={handleFileSelect}
        />

        <div className={`
          w-16 h-16 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110
          ${isDragging ? "bg-brand-500 text-white shadow-xl shadow-brand-500/20" : "bg-brand-50 text-brand-600"}
        `}>
          <Upload size={28} className={isDragging ? "animate-bounce" : ""} />
        </div>

        <h3 className="text-sm font-bold text-slate-800">
          Click or drag files to upload
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {accept.join(", ")} up to {maxSize}MB
        </p>
      </div>

      {/* File List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-lg shadow-sm animate-fade-in"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <File size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <p className="text-xs font-bold text-slate-700 truncate">{item.file.name}</p>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${item.status === "error" ? "bg-rose-500" : "bg-brand-500"
                      }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.status === "uploading" && (
                      <>
                        <Loader2 size={10} className="animate-spin text-brand-500" />
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                          Uploading {Math.round(item.progress)}%
                        </span>
                      </>
                    )}
                    {item.status === "success" && (
                      <>
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          Ready to save
                        </span>
                      </>
                    )}
                    {item.status === "error" && (
                      <>
                        <AlertCircle size={10} className="text-rose-500" />
                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                          {item.error}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUploader;
