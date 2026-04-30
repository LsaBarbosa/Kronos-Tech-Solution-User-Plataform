import { expect, test } from "@playwright/test";

test("carrega a tela de login sem depender de endpoints legados", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("button", { name: "Entrar", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar com Biometria Facial" })).toBeVisible();
});
