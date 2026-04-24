import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { APP_ROUTE_META } from "@/config/app-routes";
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
  mainClassName = "pt-16 mobile-container py-4 sm:py-20 space-y-6 sm:space-y-8 relative z-10",
  contentClassName = "flex-1 flex flex-col overflow-hidden",
  withBackground = true,
}: PageShellProps) => {
  const { pathname } = useLocation();
  const currentRouteMeta = Object.values(APP_ROUTE_META).find((route) => route.path === pathname);

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
          {currentRouteMeta?.breadcrumbs?.length ? (
            <nav aria-label="Breadcrumb" className="mb-2 text-xs sm:text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1.5">
                {currentRouteMeta.breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === currentRouteMeta.breadcrumbs.length - 1;

                  return (
                    <li key={`${breadcrumb.label}-${breadcrumb.path ?? index}`} className="flex items-center gap-1.5">
                      {breadcrumb.path && !isLast ? (
                        <Link to={breadcrumb.path} className="hover:text-foreground transition-colors">
                          {breadcrumb.label}
                        </Link>
                      ) : (
                        <span className={isLast ? "font-medium text-foreground" : undefined}>
                          {breadcrumb.label}
                        </span>
                      )}
                      {!isLast && <span aria-hidden="true">/</span>}
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageShell;
