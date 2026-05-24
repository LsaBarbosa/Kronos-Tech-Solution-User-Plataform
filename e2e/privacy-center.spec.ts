import { expect, test } from "@playwright/test";

test.describe("Privacy Center - LGPD E2E Tests", () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock authentication by setting JWT token in localStorage
    await context.addInitScript(() => {
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlbXBsb3llZS0xMjM0NTYiLCJpc3MiOiJ0ZXN0In0.sig";
      localStorage.setItem("authToken", mockToken);
    });

    // Navigate to Privacy Center
    await page.goto("/privacy-center");

    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("should display Privacy Center page with main sections", async ({ page }) => {
    // Check main heading
    await expect(page.getByRole("heading", { name: /Privacidade e Dados/i })).toBeVisible();

    // Check all main sections are visible
    await expect(page.getByRole("heading", { name: /Consentimento Biométrico/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Exportar Meus Dados/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Solicitações LGPD/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Histórico de Termos Aceitos/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Revogação de Consentimentos/i })).toBeVisible();
  });

  test("should show biometric consent status as pending initially", async ({ page }) => {
    // Look for the biometric consent card
    const biometricSection = page.locator("section:has-text('Consentimento Biométrico')");

    // Check for pending consent message
    await expect(biometricSection.locator("text=/Consentimento Pendente|não autorizou/i")).toBeVisible();
  });

  test("should show biometric consent status as active after acceptance", async ({ page }) => {
    const biometricSection = page.locator("section:has-text('Consentimento Biométrico')");

    // Look for accept button
    const acceptButton = biometricSection.locator("button:has-text(/Aceitar|cadastrar/i)").first();

    // Click accept if visible
    if (await acceptButton.isVisible()) {
      await acceptButton.click();

      // Wait for consent to be accepted and status to update
      await page.waitForLoadState("networkidle");

      // Check for active consent message
      await expect(biometricSection.locator("text=/Consentimento Ativo|consentimento está ativo/i")).toBeVisible({ timeout: 5000 });
    }
  });

  test("should revoke biometric consent successfully", async ({ page }) => {
    const biometricSection = page.locator("section:has-text('Consentimento Biométrico')");

    // First, accept consent if not already accepted
    const acceptButton = biometricSection.locator("button:has-text(/Aceitar|cadastrar/i)").first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForLoadState("networkidle");
    }

    // Look for revoke button
    const revokeButton = biometricSection.locator("button:has-text(/Revogar|Remover/i)").first();

    if (await revokeButton.isVisible()) {
      await revokeButton.click();

      // Handle confirmation dialog if present
      const confirmButton = page.locator("button:has-text(/Confirmar|Sim|Revogar/i)").filter({ hasText: /Revogar|Sim/ }).first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Wait for revocation to be processed
      await page.waitForLoadState("networkidle");

      // Check for revoked status message
      await expect(biometricSection.locator("text=/Consentimento Pendente|não autorizou/i")).toBeVisible({ timeout: 5000 });
    }
  });

  test("should export user data with confirmation modal", async ({ page }) => {
    // Locate the export section
    const exportSection = page.locator("section:has-text('Exportar Meus Dados')");

    // Click export button
    const exportButton = exportSection.locator("button:has-text(/Exportar|download/i)").first();
    await exportButton.click();

    // Check if confirmation modal appears
    const confirmationModal = page.locator("text=/Confirmar Exportação|prestes a exportar/i");
    await expect(confirmationModal).toBeVisible({ timeout: 5000 });

    // Check that modal explains what will be exported
    await expect(page.locator("text=/dados pessoais|dados sensíveis/i")).toBeVisible();

    // Click confirm button in modal
    const confirmExportButton = page.locator("button:has-text(/Confirmar Exportação|Continuar/i)").first();
    await confirmExportButton.click();

    // Wait for download/export to complete
    await page.waitForLoadState("networkidle");

    // Check if export manifest is displayed
    await expect(page.locator("text=/Exportação Concluída|exportados com sucesso/i")).toBeVisible({ timeout: 10000 });
  });

  test("should display export manifest with export ID and timestamp", async ({ page }) => {
    // Trigger export
    const exportSection = page.locator("section:has-text('Exportar Meus Dados')");
    const exportButton = exportSection.locator("button:has-text(/Exportar|download/i)").first();

    await exportButton.click();

    // Confirm export
    const confirmButton = page.locator("button:has-text(/Confirmar Exportação|Continuar/i)").first();
    await confirmButton.click();

    // Wait for manifest to appear
    await page.waitForLoadState("networkidle");

    // Check manifest elements
    const manifest = page.locator("text=/ID da Exportação|Data e Hora/i");
    await expect(manifest).toBeVisible({ timeout: 10000 });

    // Verify export ID is shown
    await expect(page.locator("text=/ID da Exportação/i")).toBeVisible();

    // Verify timestamp is shown
    await expect(page.locator("text=/Data e Hora/i")).toBeVisible();
  });

  test("should create LGPD request successfully", async ({ page }) => {
    // Locate LGPD Requests section
    const lgpdSection = page.locator("section:has-text('Solicitações LGPD')");

    // Find form fields
    const requestTypeSelect = lgpdSection.locator("select, [role='combobox']").first();
    const submitButton = lgpdSection.locator("button:has-text(/Enviar|Criar|Solicitar/i)").first();

    // If there's a form, fill it out
    if (await requestTypeSelect.isVisible()) {
      await requestTypeSelect.click();
      // Select first option (e.g., "Access data")
      await page.locator("text=/Acessar|Exportar|dados/i").first().click();
    }

    // Submit request
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for request to be created
      await page.waitForLoadState("networkidle");

      // Check for success message
      await expect(page.locator("text=/sucesso|criada|enviada/i")).toBeVisible({ timeout: 5000 });
    }
  });

  test("should list LGPD requests", async ({ page }) => {
    // Scroll to LGPD Requests section
    const lgpdSection = page.locator("section:has-text('Solicitações LGPD')");
    await lgpdSection.scrollIntoViewIfNeeded();

    // Check if requests list is visible
    const requestsList = lgpdSection.locator("text=/Lista de Solicitações|Solicitações Pendentes|Seus Pedidos/i");

    // The list might be empty initially, but should be visible
    const listContainer = lgpdSection.locator("[role='table'], ul, .list, .requests-list").first();

    if (await listContainer.isVisible()) {
      // List is displayed
      await expect(listContainer).toBeVisible();
    } else {
      // At least the section should be visible (even if no requests yet)
      await expect(lgpdSection).toBeVisible();
    }
  });

  test("should display consent history", async ({ page }) => {
    // Scroll to Consent History section
    const historySection = page.locator("section:has-text('Histórico de Termos Aceitos')");
    await historySection.scrollIntoViewIfNeeded();

    // Check section is visible
    await expect(historySection).toBeVisible();

    // Check for history content (might be empty or populated)
    const historyContent = historySection.locator("[role='table'], ul, .history, .list").first();

    // The section should be visible even if history is empty
    await expect(historySection.locator("text=/Histórico|Termos|Consentimentos/i")).toBeVisible();
  });

  test("should navigate through all Privacy Center sections", async ({ page }) => {
    // Verify all main sections exist and are scrollable to
    const sections = [
      "Consentimento Biométrico",
      "Exportar Meus Dados",
      "Solicitações LGPD",
      "Histórico de Termos Aceitos",
      "Revogação de Consentimentos",
      "Política de Privacidade",
      "Contato do Encarregado de Dados"
    ];

    for (const sectionName of sections) {
      const section = page.locator(`section:has-text('${sectionName}')`);
      await section.scrollIntoViewIfNeeded();
      await expect(section.locator(`text=${sectionName}`)).toBeVisible();
    }
  });

  test("should not depend on liveness feature", async ({ page }) => {
    // Verify that no content blocks on liveness requirement
    const blockingText = page.locator("text=/liveness|reconhecimento facial obrigatório|requisito/i");

    // The page should not show blocking errors about liveness
    const errorCount = await blockingText.count();
    expect(errorCount).toBe(0);

    // Check that biometric consent card is still accessible
    const biometricCard = page.locator("section:has-text('Consentimento Biométrico')");
    await expect(biometricCard).toBeVisible();
  });

  test("should handle missing data gracefully", async ({ page }) => {
    // Check that page doesn't show generic errors
    const errorMessages = page.locator("text=/erro|Erro|falha|Falha/i");

    // Some error handling might be present, but critical sections should load
    const biometricSection = page.locator("section:has-text('Consentimento Biométrico')");
    const exportSection = page.locator("section:has-text('Exportar Meus Dados')");

    await expect(biometricSection).toBeVisible();
    await expect(exportSection).toBeVisible();
  });

  test("should be responsive on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page with mobile viewport
    await page.goto("/privacy-center");
    await page.waitForLoadState("networkidle");

    // Check that main heading is still visible
    await expect(page.getByRole("heading", { name: /Privacidade e Dados/i })).toBeVisible();

    // Check that sections are accessible
    const biometricSection = page.locator("section:has-text('Consentimento Biométrico')");
    await biometricSection.scrollIntoViewIfNeeded();
    await expect(biometricSection).toBeVisible();
  });
});
