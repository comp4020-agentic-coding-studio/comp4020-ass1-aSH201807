import { describe, expect, it } from "vitest";
import { stageForProgress, STAGES } from "../src/scripts/main";

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
// That leaves one line that needed a design decision before it could be a
// test:
//
//   "the visitor does something that changes what they see — state the
//   core interaction plainly enough to write a test for it"
//
// The interaction: dragging (or keying) the `data-testid="progress"` range
// input changes the bead's stage. The obvious way to assert that is to load
// the built page with scripts running and dispatch an event on it — but
// jsdom doesn't execute `<script type="module">` (Astro's build output for
// this file), so that approach can never see main.ts run. Instead this
// asserts the exported progress->stage mapping directly; the DOM-wiring half
// of the contract (the right data-testid hooks exist) is already covered by
// spec/bead-initial-state.test.ts.
describe("core interaction", () => {
  it("starts at the selecting-the-blank stage", () => {
    expect(stageForProgress(0).id).toBe("selecting-the-blank");
  });

  it("ends at the final-polishing stage", () => {
    expect(stageForProgress(1).id).toBe("final-polishing");
  });

  it("passes through every named stage as progress increases", () => {
    const seen = STAGES.map((stage) => stageForProgress(stage.threshold).id);
    expect(seen).toEqual(STAGES.map((stage) => stage.id));
  });
});
