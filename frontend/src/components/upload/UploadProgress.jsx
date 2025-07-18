// src/components/upload/UploadProgress.jsx
export default function UploadProgress({ isUploading }) {
  if (!isUploading) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Procesando archivo...</span>
            <span>Detectando casos problemáticos</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}