// src/components/dashboard/Loader.jsx
import React from 'react';

export default function Loader({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-slate-500">{msg}</p>
    </div>
  );
}
