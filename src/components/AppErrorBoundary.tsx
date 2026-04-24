import { Component, type ErrorInfo, type ReactNode } from "react";
import { APP_PATHS } from "@/config/app-routes";
import { redirectBrowserTo, reloadBrowserPage } from "@/lib/browser";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro inesperado na aplicação.", error, errorInfo);
  }

  handleReload = () => {
    reloadBrowserPage();
  };

  handleDashboardRedirect = () => {
    redirectBrowserTo(APP_PATHS.dashboard);
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Kronos Enterprise
          </p>
          <h1 className="text-2xl font-bold">Algo inesperado aconteceu.</h1>
          <p className="text-muted-foreground">
            A tela encontrou um erro de renderização. Você pode voltar ao dashboard
            ou recarregar a aplicação para tentar novamente.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.handleDashboardRedirect}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Voltar ao Dashboard
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2"
            >
              Recarregar página
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
