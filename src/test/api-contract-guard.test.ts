import { existsSync, statSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_TARGETS = ["src", "docs", "README.md", ".github"];
const SKIP_DIRECTORIES = new Set(["node_modules", "dist", ".git"]);
const SKIP_FILES = new Set(["docs/task.md"]);
const FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
]);

const FORBIDDEN_PATTERNS = [
  ["records", "report", "simple"].join("/"),
  ["report", "simple"].join("/"),
  ["documents", "me"].join("/"),
  ["documents", "upload"].join("/"),
  ["records", "time-off-request"].join("/"),
];

const REQUIRED_PATTERNS = [
  "/records/report",
  "/terms/revoke-biometric",
  "/auth/login-face",
  "/documents",
  "/geolocation/resolve",
  "/legal/espelho-ponto",
];

const GELOCATION_DOC_PATH = "docs/api-contract-map.md";
const GELOCATION_DOC_PATTERNS = ["/geolocation/resolve", "flag/redis"];
const GEOLOCATION_ADHERENT_ROW =
  /\|\s*Geolocation\s*\|\s*`POST\s+\/geolocation\/resolve`\s*\|\s*Aderente\s*\|/i;
const GEOLOCATION_STALE_STATUS_PATTERNS = [
  /Bloqueado/i,
  /pendente/i,
  /não exposto/i,
  /nao exposto/i,
  /não existe/i,
  /nao existe/i,
];

const shouldScanFile = (filePath: string): boolean => {
  if (SKIP_FILES.has(filePath) || filePath === "README.md") {
    return true;
  }

  const extensionIndex = filePath.lastIndexOf(".");
  if (extensionIndex < 0) {
    return false;
  }

  return FILE_EXTENSIONS.has(filePath.slice(extensionIndex));
};

const collectFiles = async (targetPath: string): Promise<string[]> => {
  const entries = await readdir(targetPath, { withFileTypes: true });
  const collected: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) {
        continue;
      }

      collected.push(...(await collectFiles(join(targetPath, entry.name))));
      continue;
    }

    const filePath = join(targetPath, entry.name);
    if (SKIP_FILES.has(filePath)) {
      continue;
    }

    if (shouldScanFile(filePath)) {
      collected.push(filePath);
    }
  }

  return collected;
};

const readTargets = async (): Promise<string[]> => {
  const files: string[] = [];

  for (const target of ROOT_TARGETS) {
    if (!existsSync(target)) {
      continue;
    }

    if (statSync(target).isDirectory()) {
      files.push(...(await collectFiles(target)));
      continue;
    }

    if (!SKIP_FILES.has(target)) {
      files.push(target);
    }
  }

  return files;
};

describe("api contract guard", () => {
  it("impede endpoints legados e garante os endpoints criticos", async () => {
    const targets = await readTargets();
    const violations: string[] = [];

    for (const filePath of targets) {
      const content = await readFile(filePath, "utf8");

      for (const pattern of FORBIDDEN_PATTERNS) {
        if (content.includes(pattern)) {
          violations.push(`${filePath}: ${pattern}`);
        }
      }
    }

    expect(violations).toEqual([]);

    const combinedContent = await Promise.all(
      targets.map(async (filePath) => ({
        filePath,
        content: await readFile(filePath, "utf8"),
      }))
    );

    for (const requiredPattern of REQUIRED_PATTERNS) {
      expect(
        combinedContent.some(({ content }) => content.includes(requiredPattern))
      ).toBe(true);
    }

    const geolocationDoc = combinedContent.find(
      ({ filePath }) => filePath === GELOCATION_DOC_PATH
    );

    expect(geolocationDoc).toBeDefined();
    expect(geolocationDoc?.content).toContain(GELOCATION_DOC_PATTERNS[0]);
    expect(geolocationDoc?.content).toContain(GELOCATION_DOC_PATTERNS[1]);
    expect(geolocationDoc?.content).toMatch(GEOLOCATION_ADHERENT_ROW);
    for (const stalePattern of GEOLOCATION_STALE_STATUS_PATTERNS) {
      expect(geolocationDoc?.content).not.toMatch(stalePattern);
    }
  });
});
