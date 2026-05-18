import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  mainClassName?: string;
  contentClassName?: string;
  withBackground?: boolean;
}

const PageShell = ({
  children,
  sidebarOpen,
  toggleSidebar,
  mainClassName = "pt-28 sm:pt-40 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10",
  contentClassName = "flex-1 flex flex-col overflow-hidden",
  withBackground = true,
}: PageShellProps) => {

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {withBackground && (
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background:
                "linear-gradient(-45deg, hsl(var(--black-primary)), hsl(var(--primary)), hsl(var(--black-primary)), hsl(var(--primary)))",
              backgroundSize: "400% 400%",
              animation: "gradient-flow 15s ease-in-out infinite",
            }}
          />
          <div className="absolute inset-0">
            <div
              className="absolute top-1/4 left-1/4 w-32 h-32 opacity-3"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.50), transparent)",
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                animation: "float-shapes 20s ease-in-out infinite",
              }}
            />
            <div
              className="absolute top-3/4 right-1/4 w-48 h-48 opacity-2"
              style={{
                background: "linear-gradient(45deg, hsl(var(--black-primary) / 0.50), transparent)",
                borderRadius: "70% 30% 30% 70% / 70% 70% 30% 30%",
                animation: "float-shapes 25s ease-in-out infinite reverse",
              }}
            />
            <div
              className="absolute top-1/2 right-1/3 w-24 h-24 opacity-4"
              style={{
                background: "radial-gradient(circle, hsl(var(--primary) / 0.50), transparent)",
                borderRadius: "50%",
                animation: "float-shapes 18s ease-in-out infinite 5s",
              }}
            />
          </div>
        </div>
      )}

      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={cn(contentClassName)}>
        <Header toggleSidebar={toggleSidebar} />
        <main className={mainClassName}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageShell;
