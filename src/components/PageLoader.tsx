import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Synchronizing System Data..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
        <Loader2 size={48} className="text-brand-600 animate-spin relative z-10" />
      </div>
      <div className="mt-8 text-center space-y-2 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
            {message}
        </p>
        <div className="flex gap-1 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
