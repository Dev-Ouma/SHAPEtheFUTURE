import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Link as LinkIcon, UploadCloud, X, Loader2, Play } from 'lucide-react';
import { uploadFile, resolveImageUrl } from '@/lib/api';

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  accept?: string;
  type?: "image" | "video";
}

export default function ImageUploader({ 
  value, 
  onChange, 
  label = "Image", 
  placeholder = "https://...", 
  accept = "image/*",
  type = "image"
}: ImageUploaderProps) {
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("File is too large. Maximum size is 15MB.");
        return;
      }
      await performUpload(file);
    }
  };

  const performUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      onChange(result.url); // Use the URL returned by the server
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await performUpload(file);
    }
  };

  const displayUrl = resolveImageUrl(value);
  const isVideo = type === "video" || (value && (value.endsWith('.mp4') || value.endsWith('.webm') || value.endsWith('.mov')));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">{label}</label>
        <div className="flex bg-slate-100 p-1 rounded-sm">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center space-x-1 transition-all ${mode === 'url' ? 'bg-white text-primary shadow-sm rounded-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LinkIcon size={12} />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest flex items-center space-x-1 transition-all ${mode === 'upload' ? 'bg-white text-primary shadow-sm rounded-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <UploadCloud size={12} />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <div className="relative group">
          {isVideo ? (
            <Play className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          ) : (
            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          )}
          <input 
            key="url-input"
            type="text" 
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 border-none p-5 pl-14 font-bold text-primary-darker focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300"
            placeholder={placeholder}
          />
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center cursor-pointer relative min-h-[160px] ${
            uploading ? 'bg-slate-50 border-slate-200' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
          }`}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 size={32} className="text-primary animate-spin mb-3" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Uploading...</span>
            </div>
          ) : value ? (
            <div className="relative p-2 bg-white shadow-md rounded-md w-full flex justify-center">
              {isVideo ? (
                <video src={displayUrl} className="max-h-32 object-contain" muted />
              ) : (
                <img src={displayUrl} alt="Preview" className="max-h-32 object-contain" />
              )}
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <UploadCloud size={32} className="text-slate-300 mb-3" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click to browse or drag and drop</span>
              <span className="text-[9px] font-bold text-slate-400 mt-1">
                {type === 'video' ? 'MP4, WebM or MOV' : 'SVG, PNG, JPG or GIF'} (max. 15MB)
              </span>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept={accept}
            onChange={handleFileChange}
          />
        </div>
      )}
      
      {value && mode === "url" && (
        <div className="mt-2 flex items-center justify-end space-x-4">
            {displayUrl && !isVideo && (
              <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden bg-slate-50">
                <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            {displayUrl && isVideo && (
              <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                <Play size={16} className="text-primary" />
              </div>
            )}
            <a href={displayUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline font-black uppercase tracking-tighter">Preview Metadata</a>
        </div>
      )}
    </div>
  );
}
