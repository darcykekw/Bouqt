import { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex -mt-16 min-h-[calc(100vh+4rem)]">
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 lg:ml-64 min-h-screen bg-[#FAF8F5]">
        {children}
      </div>
    </div>
  );
}
