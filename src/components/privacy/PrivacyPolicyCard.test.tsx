import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { APP_PATHS } from "@/config/app-routes";
import PrivacyPolicyCard from "./PrivacyPolicyCard";

describe("PrivacyPolicyCard", () => {
  it("opens the configured privacy policy route", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<PrivacyPolicyCard />);

    await userEvent.click(
      screen.getByRole("button", { name: /Ler Política de Privacidade/i })
    );

    expect(openSpy).toHaveBeenCalledWith(
      APP_PATHS.privacyPolicy,
      "_blank",
      "noopener,noreferrer"
    );
    expect(openSpy.mock.calls[0][0]).not.toBe("/privacy-policy");
  });
});
