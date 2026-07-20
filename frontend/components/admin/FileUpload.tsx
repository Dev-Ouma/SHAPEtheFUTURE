import React, { useState } from "react";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { uploadFile, resolveImageUrl } from "@/lib/api";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  currentValue?: string;
  label?: string;
}

const FileUpload = ({ onUploadComplete, currentValue, label }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadFile(file);
      onUploadComplete(result.url); // Use the relative URL returned by the backend
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {label && <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>}
      
      <div className="relative group">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          disabled={uploading}
          accept="image/*"
        />
        
        <div className={`p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-4 ${
          uploading ? "border-primary bg-primary/5" : "border-slate-200 bg-slate-50 group-hover:border-[#ff7f50] group-hover:bg-white"
        }`}>
          {uploading ? (
            <Loader2 className="animate-spin text-primary" size={32} />
          ) : currentValue ? (
            <Check className="text-green-500" size={32} />
          ) : (
            <Upload className="text-slate-300 group-hover:text-primary transition-colors" size={32} />
          )}
          
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary-darker">
              {uploading ? "Uploading institutional asset..." : currentValue ? "Upload Complete" : "Drop institucional image here"}
            </p>
            <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400 mt-1">
              Supports PNG, JPG, WEBP (Max 5MB)
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 p-3 border-l-4 border-red-500">
          Error: {error}
        </p>
      )}

      {currentValue && !uploading && (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200">
          <div className="flex items-center space-x-4 overflow-hidden">
             <div className="w-10 h-10 bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
               <img 
                 src={resolveImageUrl(currentValue)} 
                 className="w-full h-full object-cover" 
                 alt="Preview" 
                 onError={(e: any) => {
                   // Fallback for different environments
                   if (e.target.src.includes('localhost:3001') && window.location.hostname !== 'localhost') {
                     e.target.src = currentValue; // Try absolute if on production
                   }
                 }}
               />
             </div>
             <p className="text-[10px] font-bold text-slate-500 truncate lowercase">{currentValue}</p>
          </div>
          <button 
            type="button"
            onClick={() => onUploadComplete("")}
            className="text-slate-300 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
