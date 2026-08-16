import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Static contract for the built page's initial markup, not the interaction
// itself — see spec/assignment-1.test.ts for the interaction contract.
const distPath = resolve("dist/index.html");
const doc = new JSDOM(readFileSync(distPath, "utf8")).window.document;

describe("initial bead state", () => {
  it("has exactly one bead, starting raw", () => {
    const beads = doc.querySelectorAll('[data-testid="bead"]');
    expect(beads).toHaveLength(1);
    expect(beads[0].getAttribute("data-stage")).toBe("raw");
  });

  it("has one horizontal progress control", () => {
    const control = doc.querySelector('[data-testid="progress"]');
    expect(control?.tagName).toBe("INPUT");
    expect(control?.getAttribute("type")).toBe("range");
  });
});
