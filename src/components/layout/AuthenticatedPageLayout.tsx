import { type ReactNode } from "react";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTawkWidget } from "@/hooks/useTawkWidget";

type AuthenticatedPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function AuthenticatedPageLayout({
  children,
  className,
}: AuthenticatedPageLayoutProps) {
  const { isAuthenticated } = useAuth();
  useTawkWidget({ isAuthenticated });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />

      <main className={cn("relative z-10 pt-20 lg:pt-24 pb-8 px-4 md:px-8", className)}>
        {children}
      </main>
    </div>
  );
}
