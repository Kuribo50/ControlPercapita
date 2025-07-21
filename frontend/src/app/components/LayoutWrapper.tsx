"use client"
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
} 