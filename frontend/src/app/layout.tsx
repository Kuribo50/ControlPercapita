  import './globals.css'
  import { ReactNode } from 'react'
  import LayoutWrapper from "./components/LayoutWrapper";
  import { Sidebar } from "./components/layout/Sidebar";

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar currentPage="upload" />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}