'use client';

import React, { useState, useCallback } from 'react';

export default function PaperUpload({ onUpload }: { onUpload: (files: File[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
      if (droppedFiles.length > 0) {
        setFiles(prev => [...prev, ...droppedFiles]);
        onUpload(droppedFiles);
      }
    }
  }, [onUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      if (selectedFiles.length > 0) {
        setFiles(prev => [...prev, ...selectedFiles]);
        onUpload(selectedFiles);
      }
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#27272a] bg-[#18181b] hover:border-[#71717a]'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple 
          accept="application/pdf" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
        />
        
        <svg className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-indigo-400' : 'text-[#71717a]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        
        <p className="text-[#fafafa] font-medium text-sm text-center">
          Drag & drop PDF papers here<br/>
          <span className="text-[#71717a] font-normal text-xs mt-1 block">or click to browse files</span>
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[#fafafa] bg-[#27272a] px-3 py-2 rounded-md border border-[#27272a]">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              <span className="truncate">{file.name}</span>
              <span className="text-[#71717a] ml-auto">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
