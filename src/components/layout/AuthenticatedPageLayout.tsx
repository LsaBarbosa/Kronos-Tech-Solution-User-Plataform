import { type ReactNode } from "react";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

type AuthenticatedPageLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function AuthenticatedPageLayout({
  children,
  className,
}: AuthenticatedPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Header />

      <main className={cn("relative z-10 pt-20 lg:pt-24 pb-8 px-4 md:px-8", className)}>
        {children}
      </main>
    </div>
  );
}
