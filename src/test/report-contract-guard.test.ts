import { readFile, readdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const PATHS_TO_SCAN = ["src", "docs", "README.md", ".github"];
const FORBIDDEN_PATTERNS = [
  ["records", "report", "simple"].join("/"),
  ["report", "simple"].join("/"),
  ["fetch", "Simple", "Report"].join(""),
  ["Simple", "Report", "Query", "Params"].join(""),
  ["Simple", "Report", "Response"].join(""),
  ["simple", "Report"].join(""),
];

const SKIP_DIRECTORIES = new Set(["node_modules", "dist", ".git"]);
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml"]);

const shouldScanFile = (filePath: string): boolean => {
  if (filePath === "README.md") {
    return true;
  }

  const extensionIndex = filePath.lastIndexOf(".");
  if (extensionIndex < 0) {
    return false;
  }

  return TEXT_EXTENSIONS.has(filePath.slice(extensionIndex));
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
    if (shouldScanFile(filePath)) {
      collected.push(filePath);
    }
  }

  return collected;
};

const readScanTargets = async (): Promise<string[]> => {
  const files: string[] = [];

  for (const target of PATHS_TO_SCAN) {
    if (!existsSync(target)) {
      continue;
    }

    if (statSync(target).isDirectory()) {
      files.push(...(await collectFiles(target)));
      continue;
    }

    files.push(target);
  }

  return files;
};

describe("report contract guard", () => {
  it("não permite reintrodução do relatório simples removido", async () => {
    const targets = await readScanTargets();
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
  });
});
