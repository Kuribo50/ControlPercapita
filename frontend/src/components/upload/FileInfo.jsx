// src/components/upload/FileInfo.jsx
export default function FileInfo({ file, onRemove, disabled }) {
  const getFileIcon = (filename) => {
    const name = filename.toLowerCase();
    if (name.endsWith('.csv')) return '📄';
    if (name.endsWith('.txt')) return '📝';
    if (name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    return '📁';
  };

  const getFileType = (filename) => {
    const name = filename.toLowerCase();
    if (name.endsWith('.csv')) return 'CSV';
    if (name.endsWith('.txt')) return 'TXT';
    if (name.endsWith('.xls')) return 'Excel 97';
    if (name.endsWith('.xlsx')) return 'Excel';
    return 'Desconocido';
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getFileIcon(file.name)}</div>
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">
              {getFileType(file.name)} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600"
          disabled={disabled}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}