import { useCallback, useState, type ReactNode } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

type AuthenticatedPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function AuthenticatedPageLayout({
  children,
  className,
}: AuthenticatedPageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header toggleSidebar={handleToggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={handleToggleSidebar} />

      <main className={cn("relative z-10 pt-20 lg:pt-24 pb-8 px-4 md:px-8", className)}>
        {children}
      </main>
    </div>
  );
}
