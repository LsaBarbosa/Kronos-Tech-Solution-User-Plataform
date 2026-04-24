import { existsSync, statSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = "src";
const SKIP_DIRECTORIES = new Set(["node_modules", "dist", ".git"]);
const FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const FORBIDDEN_PATTERNS = [
  ["fetch", "Documents", "()"].join(""),
  ["fetch", "Documents", "({})"].join(""),
  ["fetch", "User", "Documents", "()"].join(""),
];

const scanFiles = async (target: string): Promise<string[]> => {
  const entries = await readdir(target, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) {
        continue;
      }

      files.push(...(await scanFiles(join(target, entry.name))));
      continue;
    }

    const fullPath = join(target, entry.name);
    const extension = fullPath.slice(fullPath.lastIndexOf("."));
    if (FILE_EXTENSIONS.has(extension)) {
      files.push(fullPath);
    }
  }

  return files;
};

const collectTargets = async (): Promise<string[]> => {
  if (!existsSync(ROOT_DIR) || !statSync(ROOT_DIR).isDirectory()) {
    return [];
  }

  return scanFiles(ROOT_DIR);
};

describe("document contract guard", () => {
  it("impede reintrodução de listagem de documentos sem type", async () => {
    const targets = await collectTargets();
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
