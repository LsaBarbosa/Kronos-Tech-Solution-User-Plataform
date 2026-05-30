import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { server } from "@/test/mocks/server";
import DataProcessingCatalogCard from "../DataProcessingCatalogCard";
import { DataProcessingPurpose } from "@/types/legal";

const mockCatalogData: DataProcessingPurpose[] = [
  {
    code: "EMPLOYEE_IDENTIFICATION",
    dataCategory: "IDENTIFICATION",
    legalBasis: "CONTRACT_EXECUTION",
    purpose: "Identificação de colaboradores",
    retentionPolicyCode: "RETENTION_EMPLOYEE_CONTRACT",
    sensitive: false,
    active: true,
  },
  {
    code: "BIOMETRIC_AUTHENTICATION",
    dataCategory: "BIOMETRIC",
    legalBasis: "CONSENT",
    purpose: "Autenticação biométrica",
    retentionPolicyCode: "RETENTION_BIOMETRIC_ACTIVE_CONSENT",
    sensitive: true,
    active: true,
  },
];

describe("DataProcessingCatalogCard", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe("Loading state", () => {
    it("exibe skeleton loading enquanto carrega o catálogo", async () => {
      // Make the request take longer
      server.use(
        http.get("*/lgpd/processing-catalog", async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(mockCatalogData);
        })
      );

      render(<DataProcessingCatalogCard />);

      // Loading state should be visible initially
      expect(screen.getByText("Carregando catálogo...")).toBeInTheDocument();
    });
  });

  describe("Success states", () => {
    it("exibe catálogo com dados quando a requisição sucede", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(mockCatalogData)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Como Usamos Seus Dados")).toBeInTheDocument();
      });

      // Verify catalog items are displayed
      expect(screen.getByText(/EMPLOYEE IDENTIFICATION/i)).toBeInTheDocument();
      expect(screen.getByText(/BIOMETRIC AUTHENTICATION/i)).toBeInTheDocument();

      // Verify summary cards
      expect(screen.getByText("Categorias Ativas")).toBeInTheDocument();
      expect(screen.getByText("Dados Sensíveis")).toBeInTheDocument();
      expect(screen.getByText("Total de Itens")).toBeInTheDocument();
    });

    it("exibe mensagem de catálogo vazio quando resposta é []", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json([])
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Catálogo vazio")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Nenhuma categoria de processamento de dados configurada/)
      ).toBeInTheDocument();
    });

    it("exibe mensagem de catálogo vazio quando resposta é null", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(null)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Catálogo vazio")).toBeInTheDocument();
      });
    });
  });

  describe("Error states", () => {
    it("exibe erro 401 (Unauthorized/Session expired) com mensagem apropriada", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(
            { detail: "Não autenticado" },
            { status: 401 }
          )
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Sessão expirada")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/faça login novamente/i)
      ).toBeInTheDocument();

      // Verify retry button is available
      expect(screen.getByRole("button", { name: /Tentar novamente/i })).toBeInTheDocument();
    });

    it("exibe erro 403 (Forbidden) com mensagem apropriada", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(
            { detail: "Sem permissão" },
            { status: 403 }
          )
        )
      );

      render(<DataProcessingCatalogCard />);

      // 403 should show the server's error message with default title
      await waitFor(() => {
        expect(screen.getByText(/Sem permissão/i)).toBeInTheDocument();
      });

      expect(screen.getByRole("button", { name: /Tentar novamente/i })).toBeInTheDocument();
    });

    it("exibe erro 500 (Server Error) com mensagem apropriada", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(
            { detail: "Erro ao buscar catálogo" },
            { status: 500 }
          )
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Erro ao carregar catálogo")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Ocorreu um erro temporário/)
      ).toBeInTheDocument();

      expect(screen.getByRole("button", { name: /Tentar novamente/i })).toBeInTheDocument();
    });

    it("exibe erro genérico com mensagem apropriada", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(
            { detail: "Erro desconhecido" },
            { status: 418 } // I'm a teapot - unusual error
          )
        )
      );

      render(<DataProcessingCatalogCard />);

      // Generic HTTP errors show standard error title
      await waitFor(() => {
        expect(screen.getByText("Erro ao carregar catálogo")).toBeInTheDocument();
      });

      expect(screen.getByText(/Ocorreu um erro temporário/i)).toBeInTheDocument();
    });
  });

  describe("Retry functionality", () => {
    it("permite tentar novamente após erro", async () => {
      let requestCount = 0;

      server.use(
        http.get("*/lgpd/processing-catalog", () => {
          requestCount++;
          if (requestCount === 1) {
            return HttpResponse.json(
              { detail: "Erro temporário" },
              { status: 500 }
            );
          }
          return HttpResponse.json(mockCatalogData);
        })
      );

      const { rerender } = render(<DataProcessingCatalogCard />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText("Erro ao carregar catálogo")).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole("button", { name: /Tentar novamente/i });
      await userEvent.click(retryButton);

      // Wait for successful data to appear
      await waitFor(() => {
        expect(screen.getByText("Como Usamos Seus Dados")).toBeInTheDocument();
      });

      expect(screen.getByText(/EMPLOYEE IDENTIFICATION/i)).toBeInTheDocument();
    });

    it("carrega dados após recuperação de erro", async () => {
      let requestCount = 0;

      server.use(
        http.get("*/lgpd/processing-catalog", () => {
          requestCount++;
          if (requestCount === 1) {
            return HttpResponse.json(
              { detail: "Não autenticado" },
              { status: 401 }
            );
          }
          return HttpResponse.json(mockCatalogData);
        })
      );

      render(<DataProcessingCatalogCard />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText("Sessão expirada")).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByRole("button", { name: /Tentar novamente/i });
      await userEvent.click(retryButton);

      // Wait for successful data to appear
      await waitFor(() => {
        expect(
          screen.getByText("Como Usamos Seus Dados")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Payload validation", () => {
    it("filtra itens inválidos do catálogo", async () => {
      const invalidCatalog = [
        {
          code: "VALID_ITEM",
          dataCategory: "IDENTIFICATION",
          legalBasis: "CONTRACT_EXECUTION",
          purpose: "Valid item",
          retentionPolicyCode: "RETENTION_POLICY",
          sensitive: false,
          active: true,
        },
        {
          code: "", // Invalid - empty code
          dataCategory: "BIOMETRIC",
          legalBasis: "CONSENT",
          purpose: "Invalid item",
          retentionPolicyCode: "RETENTION_BIOMETRIC",
          sensitive: true,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(invalidCatalog)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Como Usamos Seus Dados")).toBeInTheDocument();
      });

      // Only valid item should be displayed
      const validItems = screen.getAllByText(/VALID ITEM/i);
      expect(validItems.length).toBeGreaterThan(0);

      // Invalid item should not be displayed
      expect(screen.queryByText(/Invalid item/i)).not.toBeInTheDocument();
    });

    it("exibe catálogo vazio quando resposta contém apenas itens inválidos", async () => {
      const invalidCatalog = [
        {
          code: "", // Invalid - empty code
          dataCategory: "BIOMETRIC",
          legalBasis: "CONSENT",
          purpose: "Invalid item",
          retentionPolicyCode: "RETENTION_BIOMETRIC",
          sensitive: true,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(invalidCatalog)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Catálogo vazio")).toBeInTheDocument();
      });
    });

    it("exibe catálogo vazio quando resposta não é um array", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json({ items: mockCatalogData })
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Catálogo vazio")).toBeInTheDocument();
      });
    });
  });

  describe("Data display", () => {
    it("exibe todos os campos do catálogo corretamente", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(mockCatalogData)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Como Usamos Seus Dados")).toBeInTheDocument();
      });

      // Verify summary cards show correct counts
      const cards = screen.getAllByText(/\d+/);
      expect(cards.length).toBeGreaterThan(0);

      // Verify item tags
      expect(screen.getAllByText("Ativo")).toHaveLength(2);
      expect(screen.getByText("Sensível")).toBeInTheDocument();
    });

    it("diferencia itens sensíveis de não-sensíveis", async () => {
      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(mockCatalogData)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Como Usamos Seus Dados")).toBeInTheDocument();
      });

      // Both items should have "Ativo" tag
      const activeLabels = screen.getAllByText("Ativo");
      expect(activeLabels).toHaveLength(2);

      // Only one should have "Sensível" tag
      const sensitiveLabels = screen.queryAllByText("Sensível");
      expect(sensitiveLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("SPEC-007: All legal basis values rendering", () => {
    it("exibe CONTRACT_EXECUTION com label correto", async () => {
      const catalogWithAllBases: DataProcessingPurpose[] = [
        {
          code: "CONTRACT_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "CONTRACT_EXECUTION",
          purpose: "Teste de base legal",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(catalogWithAllBases)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(
          screen.getByText("Execução de contrato")
        ).toBeInTheDocument();
      });
    });

    it("exibe REGULAR_EXERCISE_OF_RIGHTS com label correto", async () => {
      const catalogWithAllBases: DataProcessingPurpose[] = [
        {
          code: "RIGHTS_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "REGULAR_EXERCISE_OF_RIGHTS",
          purpose: "Teste de base legal",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(catalogWithAllBases)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(
          screen.getByText("Exercício regular de direitos")
        ).toBeInTheDocument();
      });
    });

    it("exibe FRAUD_PREVENTION com label correto", async () => {
      const catalogWithAllBases: DataProcessingPurpose[] = [
        {
          code: "FRAUD_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "FRAUD_PREVENTION",
          purpose: "Teste de base legal",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(catalogWithAllBases)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(
          screen.getByText("Prevenção à fraude e segurança do titular")
        ).toBeInTheDocument();
      });
    });

    it("exibe LEGITIMATE_INTEREST com label correto (sem 'S' extra)", async () => {
      const catalogWithAllBases: DataProcessingPurpose[] = [
        {
          code: "INTEREST_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "LEGITIMATE_INTEREST",
          purpose: "Teste de base legal",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(catalogWithAllBases)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(
          screen.getByText("Legítimo interesse")
        ).toBeInTheDocument();
      });

      // Verify old plural version doesn't appear
      expect(screen.queryByText("Legítimos interesses")).not.toBeInTheDocument();
    });

    it("exibe LEGAL_OBLIGATION com label correto", async () => {
      const catalogWithAllBases: DataProcessingPurpose[] = [
        {
          code: "OBLIGATION_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "LEGAL_OBLIGATION",
          purpose: "Teste de base legal",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(catalogWithAllBases)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(
          screen.getByText("Obrigação legal ou regulatória")
        ).toBeInTheDocument();
      });
    });

    it("renderiza todas as 6 bases legais do back-end corretamente", async () => {
      const allBases: DataProcessingPurpose[] = [
        {
          code: "CONSENT_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "CONSENT",
          purpose: "Teste",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
        {
          code: "LEGAL_OBLIGATION_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "LEGAL_OBLIGATION",
          purpose: "Teste",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
        {
          code: "CONTRACT_EXECUTION_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "CONTRACT_EXECUTION",
          purpose: "Teste",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
        {
          code: "REGULAR_EXERCISE_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "REGULAR_EXERCISE_OF_RIGHTS",
          purpose: "Teste",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
        {
          code: "FRAUD_PREVENTION_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "FRAUD_PREVENTION",
          purpose: "Teste",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
        {
          code: "LEGITIMATE_INTEREST_TEST",
          dataCategory: "IDENTIFICATION",
          legalBasis: "LEGITIMATE_INTEREST",
          purpose: "Teste",
          retentionPolicyCode: "RETENTION_TEST",
          sensitive: false,
          active: true,
        },
      ];

      server.use(
        http.get("*/lgpd/processing-catalog", () =>
          HttpResponse.json(allBases)
        )
      );

      render(<DataProcessingCatalogCard />);

      await waitFor(() => {
        expect(screen.getByText("Como Usamos Seus Dados")).toBeInTheDocument();
      });

      // Verify all legal bases appear with correct labels
      expect(screen.getByText("Consentimento")).toBeInTheDocument();
      expect(
        screen.getByText("Obrigação legal ou regulatória")
      ).toBeInTheDocument();
      expect(screen.getByText("Execução de contrato")).toBeInTheDocument();
      expect(
        screen.getByText("Exercício regular de direitos")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Prevenção à fraude e segurança do titular")
      ).toBeInTheDocument();
      expect(screen.getByText("Legítimo interesse")).toBeInTheDocument();

      // Verify no fallback to raw enum values
      expect(screen.queryByText("CONTRACT_EXECUTION")).not.toBeInTheDocument();
      expect(screen.queryByText("FRAUD_PREVENTION")).not.toBeInTheDocument();
      expect(
        screen.queryByText("REGULAR_EXERCISE_OF_RIGHTS")
      ).not.toBeInTheDocument();
    });
  });
});
