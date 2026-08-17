// Single source of truth for what "progress" means: a fraction from 0 (raw
// blank) to 1 (finished), in threshold order. Every visible change derives
// from this one list — see CLAUDE.md's "Assignment 1" section.
//
// Exported so spec/assignment-1.test.ts can assert the mapping directly:
// jsdom doesn't execute `<script type="module">` (Astro's build output for
// this file), so a test can't drive this through the rendered page's own
// script the way spec/bead-initial-state.test.ts drives static markup.
export type Stage = { id: string; label: string; threshold: number };

export const STAGES: Stage[] = [
  { id: "raw", label: "Raw blank", threshold: 0 },
  { id: "surface-prep", label: "Surface preparation", threshold: 0.1 },
  { id: "lacquering", label: "Lacquering", threshold: 0.25 },
  { id: "drying", label: "Drying", threshold: 0.4 },
  { id: "sanding", label: "Sanding", threshold: 0.55 },
  { id: "repeated", label: "Repeated lacquering & sanding", threshold: 0.7 },
  { id: "finished", label: "Final polishing", threshold: 0.9 },
];

export function stageForProgress(progress: number): Stage {
  return STAGES.reduce(
    (current, candidate) => (progress >= candidate.threshold ? candidate : current),
    STAGES[0],
  );
}

// Continuous visual parameters derived from progress, so the bead's material
// interpolates rather than jumping per named stage (see CLAUDE.md's "Visual
// continuity" rule). Each communicates one of the three required cues:
//   - layersProgress / ring opacities -> the surface gaining layers and colour
//   - dryness -> waiting/drying as a distinct, passive zone
//   - sheen -> repeated work gradually building depth and shine
function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function rampUp(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

// A trapezoid: zero outside the drying stage, full across its plateau, with
// short ramps in and out either side — a dip in vibrancy, not a hard cut.
function dryness(progress: number): number {
  return Math.min(rampUp(progress, 0.34, 0.4), 1 - rampUp(progress, 0.55, 0.61));
}

// Near-zero until sanding starts; ramps toward full shine by the end, with a
// small step added per pass through the "repeated" band so each pass reads as
// a distinct addition rather than one smooth fade.
function sheen(progress: number): number {
  const base = rampUp(progress, 0.55, 1);
  const passes = Math.floor(rampUp(progress, 0.7, 0.9) * 3) * 0.05;
  return Math.min(1, base + passes);
}

// Visible fine scratching appears once sanding starts, stays through the
// repeated passes, and is only removed by the final polish — the texture
// that repeated work leaves behind until the last step smooths it away.
function scratchiness(progress: number): number {
  return Math.min(rampUp(progress, 0.5, 0.58), 1 - rampUp(progress, 0.85, 1));
}

// The marbled cross-section built up by repeated colour coats stays hidden
// under flat colour until sanding cuts into it, then sharpens into full
// clarity by the final polish — sanding reveals depth that was already there.
function marbleVisibility(progress: number): number {
  return rampUp(progress, 0.55, 0.75);
}

// Guarded so this file can be imported for its pure exports above (see
// spec/assignment-1.test.ts) without a `document` global in scope.
if (typeof document !== "undefined") {
  const progressInput = document.querySelector<HTMLInputElement>('[data-testid="progress"]');
  const bead = document.querySelector<HTMLElement>('[data-testid="bead"]');
  const stageLabel = document.querySelector<HTMLElement>('[data-testid="stage-label"]');
  const stageDots = document.querySelectorAll<HTMLElement>(".stage-dot");
  const dragHint = document.querySelector<HTMLElement>(".drag-hint");
  const dismissDragHint = () => dragHint?.classList.add("drag-hint-dismissed");

  const applyProgress = (progress: number) => {
    const stage = stageForProgress(progress);
    if (bead) {
      bead.dataset.stage = stage.id;
      bead.style.setProperty("--progress", progress.toFixed(4));
      bead.style.setProperty("--dryness", dryness(progress).toFixed(4));
      bead.style.setProperty("--sheen", sheen(progress).toFixed(4));
      bead.style.setProperty("--ring1", rampUp(progress, 0.18, 0.32).toFixed(4));
      bead.style.setProperty("--ring2", rampUp(progress, 0.65, 0.85).toFixed(4));
      bead.style.setProperty("--scratch", scratchiness(progress).toFixed(4));
      bead.style.setProperty("--marble", marbleVisibility(progress).toFixed(4));
    }
    if (stageLabel) stageLabel.textContent = stage.label;
    for (const dot of stageDots) {
      dot.classList.toggle("active", dot.dataset.stage === stage.id);
    }
    progressInput?.setAttribute("aria-valuetext", stage.label);
  };

  if (progressInput) {
    applyProgress(Number(progressInput.value) / 100);
    progressInput.addEventListener("input", () => {
      dismissDragHint();
      applyProgress(Number(progressInput.value) / 100);
    });

    // The range input stays in the DOM as the single value source — focusable
    // and keyboard-operable (see styles/global.css's .visually-hidden) — but
    // it's no longer the drag surface. Dragging anywhere in `main`, except on
    // text, moves progress by the pointer's travel direction and distance
    // rather than jumping to the pointer's absolute position: moving left
    // keeps heading toward raw, moving right keeps heading toward finished.
    const main = document.querySelector("main");
    const POINTS_PER_PIXEL = 0.2;
    let lastClientX = 0;

    main?.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("p")) return; // leave text selectable/readable
      dismissDragHint();
      lastClientX = event.clientX;
      main.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    main?.addEventListener("pointermove", (event) => {
      if (!main.hasPointerCapture(event.pointerId)) return;
      const deltaX = event.clientX - lastClientX;
      lastClientX = event.clientX;
      const next = Math.min(100, Math.max(0, Number(progressInput.value) + deltaX * POINTS_PER_PIXEL));
      progressInput.value = String(next);
      progressInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
}
