// Single source of truth for what "progress" means: a fraction from 0
// (selecting the blank) to 1 (final polishing), in threshold order. Every
// visible change — including which two stage images are cross-fading —
// derives from this one list — see CLAUDE.md's "Assignment 1" section.
//
// Exported so spec/assignment-1.test.ts can assert the mapping directly:
// jsdom doesn't execute `<script type="module">` (Astro's build output for
// this file), so a test can't drive this through the rendered page's own
// script the way spec/bead-initial-state.test.ts drives static markup.
export type Stage = { id: string; label: string; threshold: number; image: ImageMetadata };

import selectingTheBlank from "../assets/bead-stages/01-selecting-the-blank.png";
import applyingTheBaseCoat from "../assets/bead-stages/02-applying-the-base-coat.png";
import buildingUpTheLacquer from "../assets/bead-stages/03-building-up-the-lacquer.png";
import layeringTheLacquer from "../assets/bead-stages/04-layering-the-lacquer.png";
import curingInTheShade from "../assets/bead-stages/05-curing-in-the-shade.png";
import sandingToReveal from "../assets/bead-stages/06-sanding-to-reveal.png";
import revealingTheLayers from "../assets/bead-stages/07-revealing-the-layers.png";
import finalPolishing from "../assets/bead-stages/08-final-polishing.png";

export const STAGES: Stage[] = [
  { id: "selecting-the-blank", label: "Selecting the Blank", threshold: 0, image: selectingTheBlank },
  { id: "applying-the-base-coat", label: "Applying the Base Coat", threshold: 0.12, image: applyingTheBaseCoat },
  { id: "building-up-the-lacquer", label: "Building Up the Lacquer", threshold: 0.25, image: buildingUpTheLacquer },
  { id: "layering-the-lacquer", label: "Layering the Lacquer", threshold: 0.38, image: layeringTheLacquer },
  { id: "curing-in-the-shade", label: "Curing in the Shade", threshold: 0.5, image: curingInTheShade },
  { id: "sanding-to-reveal", label: "Sanding to Reveal", threshold: 0.62, image: sandingToReveal },
  { id: "revealing-the-layers", label: "Revealing the Layers", threshold: 0.75, image: revealingTheLayers },
  { id: "final-polishing", label: "Final Polishing", threshold: 0.88, image: finalPolishing },
];

export function stageForProgress(progress: number): Stage {
  return STAGES.reduce(
    (current, candidate) => (progress >= candidate.threshold ? candidate : current),
    STAGES[0],
  );
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

// Cross-fade weights for every stage's image, keyed by stage id (see
// CLAUDE.md's "Visual continuity" rule): only the current stage and the next
// one ever have non-zero opacity, blending linearly across the gap between
// their thresholds so one image gradually becomes the next rather than
// hard-cutting.
function layerOpacities(progress: number): Record<string, number> {
  const opacities: Record<string, number> = {};
  for (const stage of STAGES) opacities[stage.id] = 0;

  let i = 0;
  for (let k = 0; k < STAGES.length; k++) {
    if (progress >= STAGES[k].threshold) i = k;
  }

  if (i === STAGES.length - 1) {
    opacities[STAGES[i].id] = 1;
    return opacities;
  }

  const start = STAGES[i].threshold;
  const end = STAGES[i + 1].threshold;
  const t = clamp01((progress - start) / (end - start));
  opacities[STAGES[i].id] = 1 - t;
  opacities[STAGES[i + 1].id] = t;
  return opacities;
}

// Guarded so this file can be imported for its pure exports above (see
// spec/assignment-1.test.ts) without a `document` global in scope.
if (typeof document !== "undefined") {
  const progressInput = document.querySelector<HTMLInputElement>('[data-testid="progress"]');
  const bead = document.querySelector<HTMLElement>('[data-testid="bead"]');
  const beadLayers = document.querySelectorAll<HTMLElement>(".bead-layer");
  const stageLabel = document.querySelector<HTMLElement>('[data-testid="stage-label"]');
  const stageDots = document.querySelectorAll<HTMLElement>(".stage-dot");
  const dragHint = document.querySelector<HTMLElement>(".drag-hint");
  // The "Drag" label is a first-look-only affordance: once any interaction
  // has happened, .drag-hint-used hides it for good. The ring underneath it
  // keeps recurring, though — hidden while a drag is in progress, faded back
  // in (label-less) once it ends, so it stays a standing hint rather than a
  // one-time tip.
  const markDragHintUsed = () => dragHint?.classList.add("drag-hint-used");
  const hideDragHint = () => dragHint?.classList.add("drag-hint-hidden");
  const showDragHintRing = () => {
    markDragHintUsed();
    dragHint?.classList.remove("drag-hint-hidden");
  };

  const applyProgress = (progress: number) => {
    const stage = stageForProgress(progress);
    if (bead) bead.dataset.stage = stage.id;
    const opacities = layerOpacities(progress);
    for (const layer of beadLayers) {
      const id = layer.dataset.stage;
      layer.style.opacity = id ? String(opacities[id] ?? 0) : "0";
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
      markDragHintUsed();
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
    let isDragging = false;

    main?.addEventListener("pointerdown", (event) => {
      const target = event.target as HTMLElement;
      if (target.closest("p")) return; // leave text selectable/readable
      isDragging = true;
      hideDragHint();
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

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      showDragHintRing();
    };
    main?.addEventListener("pointerup", endDrag);
    main?.addEventListener("pointercancel", endDrag);
  }
}
