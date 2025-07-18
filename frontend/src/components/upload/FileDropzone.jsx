// src/components/upload/FileDropzone.jsx
import { useState } from 'react';

export default function FileDropzone({ onFileSelect, disabled }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const allowedExtensions = ['.csv', '.txt', '.xls', '.xlsx'];
    const fileName = file.name.toLowerCase();
    return allowedExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        onFileSelect(droppedFile);
      } else {
        onFileSelect(null, 'Formato no soportado. Use CSV, TXT, XLS o XLSX');
      }
    }
  };

  const handleFileSelectInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        onFileSelect(selectedFile);
      } else {
        onFileSelect(null, 'Formato no soportado. Use CSV, TXT, XLS o XLSX');
      }
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer ${
        dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="space-y-3">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900">Seleccionar archivo</p>
          <p className="text-sm text-gray-500">Arrastra o haz clic aquí</p>
        </div>
      </div>
      <input
        type="file"
        accept=".csv,.txt,.xls,.xlsx"
        onChange={handleFileSelectInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={disabled}
      />
    </div>
  );
}