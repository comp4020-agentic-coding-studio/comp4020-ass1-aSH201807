import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Static contract for the built page's initial markup, not the interaction
// itself — see spec/assignment-1.test.ts for the interaction contract.
const distPath = resolve("dist/index.html");
const doc = new JSDOM(readFileSync(distPath, "utf8")).window.document;

describe("initial bead state", () => {
  it("has exactly one bead, starting at selecting-the-blank", () => {
    const beads = doc.querySelectorAll('[data-testid="bead"]');
    expect(beads).toHaveLength(1);
    expect(beads[0].getAttribute("data-stage")).toBe("selecting-the-blank");
  });

  it("has one horizontal progress control", () => {
    const control = doc.querySelector('[data-testid="progress"]');
    expect(control?.tagName).toBe("INPUT");
    expect(control?.getAttribute("type")).toBe("range");
  });

  // The control is deliberately invisible (see styles/global.css's
  // .visually-hidden) so it can't be eyeballed like the rest of the page — a
  // future edit could add `disabled`, `hidden`, `tabindex="-1"`, or
  // `aria-hidden="true"` and the rendered page would look exactly the same
  // while a marker tabbing through it would silently lose keyboard access.
  it("keeps the progress control keyboard-reachable", () => {
    const control = doc.querySelector('[data-testid="progress"]');
    expect(control?.hasAttribute("disabled")).toBe(false);
    expect(control?.hasAttribute("hidden")).toBe(false);
    expect(control?.getAttribute("tabindex")).not.toBe("-1");
    expect(control?.getAttribute("aria-hidden")).not.toBe("true");
  });
});
