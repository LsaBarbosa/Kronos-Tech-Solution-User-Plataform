import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

// Mock brand assets (Vite handles PNG imports as URLs in prod; in tests we stub them)
vi.mock("@/assets/brand/logo-azul.png", () => ({ default: "logo-azul.png" }));
vi.mock("@/assets/brand/logo-branca.png", () => ({ default: "logo-branca.png" }));

const renderWithRouter = (ui: React.ReactElement, { route = "/" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe("CommercialLanding", () => {
  it("renderiza a página sem erros", async () => {
    const { default: CommercialLanding } = await import("@/pages/CommercialLanding");
    const { container } = renderWithRouter(<CommercialLanding />);
    expect(container).toBeTruthy();
  });

  it("exibe o H1 principal", async () => {
    const { default: CommercialLanding } = await import("@/pages/CommercialLanding");
    renderWithRouter(<CommercialLanding />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1.textContent).toMatch(/gestão de ponto/i);
  });

  it("exibe CTAs de demonstração e acesso", async () => {
    const { default: CommercialLanding } = await import("@/pages/CommercialLanding");
    renderWithRouter(<CommercialLanding />);

    expect(screen.getAllByText(/agendar demonstração|agendar demo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/acessar plataforma/i).length).toBeGreaterThan(0);
  });

  it("exibe link para /login", async () => {
    const { default: CommercialLanding } = await import("@/pages/CommercialLanding");
    renderWithRouter(<CommercialLanding />);

    const loginLinks = screen.getAllByRole("link", { name: /acessar plataforma/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    loginLinks.forEach((link) => expect(link).toHaveAttribute("href", "/login"));
  });

  it("exibe links para as rotas de privacidade públicas", async () => {
    const { default: CommercialLanding } = await import("@/pages/CommercialLanding");
    renderWithRouter(<CommercialLanding />);

    expect(screen.getAllByRole("link", { name: /política de privacidade/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /catálogo de tratamento/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /termo de biometria/i }).length).toBeGreaterThan(0);
  });

  it("exibe seção de funcionalidades com módulos reais", async () => {
    const { default: CommercialLanding } = await import("@/pages/CommercialLanding");
    renderWithRouter(<CommercialLanding />);

    expect(screen.getAllByText(/ponto eletrônico/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/lgpd/i).length).toBeGreaterThan(0);
  });
});

describe("Rota / (TokenRedirect)", () => {
  it("sem token: renderiza a landing page (H1 presente)", async () => {
    vi.mock("react-router-dom", async (importOriginal) => {
      const actual = await importOriginal<typeof import("react-router-dom")>();
      return {
        ...actual,
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
        useNavigate: () => vi.fn(),
      };
    });

    const { default: TokenRedirect } = await import("@/pages/TokenRedirect");
    renderWithRouter(<TokenRedirect />);

    const h1 = await screen.findByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
  });
});
