import { describe, expect, it } from "vitest";

// Assignment 1's published spec (see the course site), sorted:
//
//   - "deployed and live at its public GitHub Pages URL by the deadline"
//     -> CI's deploy job, not a vitest test.
//   - "static and client-side throughout, and the starter's invariant
//     checks pass" -> spec/invariants.test.ts, already shipped.
//   - "evidence of process is in the repo: PROCESS.md, your CLAUDE.md,
//     reflections/assignment-1.md, and a commit history" -> `pnpm
//     check:evidence`, already shipped.
//   - "it works at both marking viewports (desktop and phone)" and "one
//     strong idea with a point of view, and nothing else" -> judged by a
//     person at the crit, not mechanically checkable here.
//
// That leaves one line that needs a design decision before it can be a
// test:
//
//   "the visitor does something that changes what they see — state the
//   core interaction plainly enough to write a test for it"
//
// Intentionally red until the interaction exists. Replace the TODO below
// with the real thing: pick a `data-testid` (or similar hook) on the
// control, load the built page with scripts running, fire the interaction,
// and assert something visible actually changed.
const NEXT_STEP =
  "Name the interaction, give its control a stable hook (e.g. data-testid), " +
  "and replace this assertion with one that fires it and checks the page " +
  "actually changed. See the worked recipe below.";

describe("core interaction", () => {
  it("changes what the visitor sees", () => {
    expect(false, NEXT_STEP).toBe(true);
  });

  // Worked recipe once you have a control to test:
  //
  // const distPath = resolve("dist/index.html");
  // const dom = new JSDOM(readFileSync(distPath, "utf8"), {
  //   runScripts: "dangerously",
  //   resources: "usable",
  //   url: "http://localhost/",
  // });
  // const { document } = dom.window;
  // const before = document.querySelector('[data-testid="..."]')?.textContent;
  // document.querySelector('[data-testid="..."]')?.dispatchEvent(
  //   new dom.window.Event("click", { bubbles: true }),
  // );
  // const after = document.querySelector('[data-testid="..."]')?.textContent;
  // expect(after).not.toBe(before);
});
