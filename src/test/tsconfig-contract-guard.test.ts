import { readFile } from "node:fs/promises";
import ts from "typescript";
import { describe, expect, it } from "vitest";

type TsConfigApp = {
  compilerOptions?: {
    strict?: boolean;
    noImplicitAny?: boolean;
    strictNullChecks?: boolean;
    noUnusedLocals?: boolean;
    noUnusedParameters?: boolean;
  };
};

describe("tsconfig contract guard", () => {
  it("mantem strict e flags enterprise", async () => {
    const content = await readFile("tsconfig.app.json", "utf8");
    const result = ts.parseConfigFileTextToJson("tsconfig.app.json", content);

    expect(result.error).toBeUndefined();

    const tsconfig = result.config as TsConfigApp;
    const compilerOptions = tsconfig.compilerOptions ?? {};

    expect(compilerOptions.strict).toBe(true);
    expect(compilerOptions.noImplicitAny).toBe(true);
    expect(compilerOptions.strictNullChecks).toBe(true);
    expect(compilerOptions.noUnusedLocals).toBe(true);
    expect(compilerOptions.noUnusedParameters).toBe(true);
  });
});
