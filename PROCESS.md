# Process overview

A reading-guide to how the work came together --- a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

## What I built

**The Shine Is Made of Time** is a one-idea, one-mechanic explainer: a single
Chinese lacquer bead, rendered as a layered SVG, whose surface morphs
continuously as the visitor drags anywhere in the page. There's no slider to
look at and no separate pages --- one bead, one horizontal progress axis, seven
labelled but non-exclusive conceptual stages (raw blank through final polish)
riding on top of continuous colour, dryness, layer, scratch, and sheen
functions of a single `progress` value.

## The moments that mattered

1. **Continuity had to be encoded as a rule, not just a one-off
   implementation.** The brief's "object continuity" requirement is easy to
   satisfy by accident and easy to break the next time a stage is added, so
   instead of hand-tuning per-stage CSS I wrote pure functions (`dryness`,
   `sheen`, `scratchiness`, `marbleVisibility`) of the single progress number,
   drove them through CSS custom properties, and wrote the constraint itself
   into `CLAUDE.md` as a "Visual continuity" rule so it outlives this one
   prompt. I knew it held because `pnpm check` stayed green through the change
   and, more importantly, because dragging across the full range in the
   rendered page shows one bead's material changing, never a swapped shape.
   [`254477f...77392d2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/compare/254477f...77392d2)

2. **Reference material isn't the same as source material.** Partway through,
   the request to "communicate the technique" turned into asks to reproduce
   frames from a specific copyrighted tutorial video, then the user's own
   screenshots of it, as the bead's per-stage artwork --- asked three
   different ways, including "it's just for popular science." The pattern I
   care about (accumulated colour building up under sanding) is real and
   traditional; the specific footage isn't mine to copy. Instead of just
   refusing, I built an original alternative carrying the same idea: an SVG
   `feTurbulence` filter that procedurally generates a marbled texture,
   revealed only once "sanding" begins. I checked this held by confirming no
   image assets ever entered the repo --- the texture is generated code, not a
   picture.
   [`77392d2`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/77392d2)

3. **A tool limitation is a fact to state, not a gap to paper over.** A later
   request asked me to match a reference webpage's exact fonts and colours.
   `WebFetch` returns text only --- no CSS, no rendered colour, no
   font-family data --- so I said that plainly rather than inventing hex
   codes I couldn't verify, and built an original pairing in the same idiom
   instead (a jade-green/cream cloud motif, a calligraphic heading face next
   to a serif body face). Verified the same way as always: `pnpm check` green,
   then looked at the rendered page.
   [`49e07ca`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/49e07ca)

4. **Working pointer code isn't the same as working touch code.** After
   shipping, I re-tested the required 390×844 viewport specifically for
   touch, since the drag was only ever driven and demoed with a mouse. The
   `pointerdown`/`pointermove` handler already used the unified Pointer
   Events API, so I assumed touch was covered for free --- but `main` had no
   `touch-action` set, and the browser was claiming horizontal swipes for its
   own scroll-gesture recognition before handing full deltas to
   `pointermove`. I didn't take that on faith: I drove real CDP-level touch
   events against the same 200px swipe with and without the fix and measured
   the resulting progress value. Without `touch-action: pan-y`, the swipe
   only reached progress 4; with it, the same swipe reached 40, matching
   desktop's pixel-to-progress ratio, while vertical scrolling and the
   absence of horizontal page overflow were unaffected. One CSS line, no
   change to the drag logic, the stage sequence, or the visual model.
   [`77c4b36`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/77c4b36)

5. **The right control already existed --- the gap was making its state
   visible.** Asked to add keyboard access without a second interaction
   system, I inspected the DOM before writing anything: the drag handler was
   already backed by a real `<input type="range">`, hidden only visually via
   `.visually-hidden`, and already the single source of truth that pointer
   drags write to and read from via its shared `"input"` event. A native
   range input is tab-focusable and already handles ArrowLeft/ArrowRight and
   Home/End as min/max jumps for free, so there was no new control to build
   and no separate state to keep in sync --- keyboard, pointer, and touch were
   already going to converge on the same value. The one real gap was that its
   native focus ring was clipped to invisible by the same 1px hiding that
   keeps it out of the visual layout. I added a `:focus-within` outline on
   the bead itself, so tabbing to the hidden input shows focus on the thing
   it visibly drives, plus `aria-valuetext` so assistive tech announces the
   stage name instead of a bare number. Verified with Playwright driving real
   Tab/Arrow/Home/End key presses against both the local build and the live
   deployed URL at both required viewports --- confirming the focus outline
   renders, the key-by-key progress sequence matches expectations, and a
   pointer drag issued right after a keyboard `Home` continues from the same
   shared state rather than resetting or diverging.
   [`ebfb5b5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/ebfb5b5)

6. **A retired test can still be doing its job by being gone.** Asked to
   replace the starter-specific test with project-specific contracts, I
   checked `spec/starter.test.ts` first rather than assuming it still needed
   work --- it had already been deleted in the very first interaction commit,
   the moment the starter page it described stopped existing. Re-reading
   `spec/bead-initial-state.test.ts` and `spec/assignment-1.test.ts` against
   the checklist (bead exists, progress control exists, a defined initial
   state, a reachable finished state) showed those were already covered, so
   adding tests for them again would have been duplicate coverage, not new
   protection. The one real gap was keyboard reachability: nothing asserted
   that the progress control stays tab-reachable. Because the control is
   deliberately invisible (`.visually-hidden`, not `display:none`), a future
   edit adding `disabled`, `hidden`, `tabindex="-1"`, or `aria-hidden="true"`
   would silently break Tab access while the rendered page looked identical
   --- exactly the failure a marker tabbing through the deployed prototype
   would hit and a visual check would miss. jsdom can't execute the module
   script or compute real focus, but it can assert those markup attributes
   are absent from the built HTML, so that's the one test I added.
   `pnpm check` stayed green at 21/21 tests.
   [`350da55`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/350da55)

7. **Rights need establishing before a third-party image enters a soon-public
   repo, not verified after the fact.** Mid-session I was asked to use a
   specific lacquer/lotus photo, carrying a visible "时代记忆-非遗" watermark, as
   the page background. Cropping the watermark out and asking again didn't
   change the underlying question, so I declined twice and asked directly
   whether the requester held rights to the image, offering an original
   CSS/SVG crackle-texture alternative in the same palette instead --- which
   was used first. Only after an explicit "我有权使用" (I have the right to use
   it) did I copy the actual photo into `src/assets/` and wire it up with a
   dark scrim for text legibility, since the repo goes public at the
   deadline and an unverified image there is a real risk, not a hypothetical
   one. Also folded in that pass: switching to `box-sizing: border-box` and a
   fixed `100dvh` body height so the page fits one viewport without
   scrolling, which the earlier `min-height: 100vh` didn't guarantee.
   [`211c158`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/211c158)

8. **A working interaction can still be an invisible one.** The drag has
   worked since the first commit, but nothing on the page told a first-time
   visitor to drag the bead itself --- the intro paragraph said "move the
   slider" while the actual `<input type="range">` is deliberately hidden,
   and the bead's own affordance (an `ew-resize` cursor) only shows up once
   the pointer is already over it. I reworded the paragraph to name the bead
   directly, then added a purely decorative pulsing-ring and "Drag" label as
   a first-look hint: `aria-hidden` and `pointer-events: none` so it never
   reaches assistive tech or intercepts the drag it's advertising, dismissed
   permanently on the first pointer or keyboard interaction, and inert under
   `prefers-reduced-motion`. Verified with `pnpm check` (21/21 tests, build,
   and lint all green) --- I haven't yet driven this in an actual browser
   this session, so the ring sizing and timing at the 390×844 viewport are
   still worth a manual look before shipping.
   [`6143f12`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/6143f12)

9. **Correcting the harness before writing code prevented shipping a
   contradiction.** Asked to replace the bead's CSS/SVG visuals with eight
   hand-drawn stage images, I re-read `CLAUDE.md` before touching any code and
   found it actively contradicted the request: "Object continuity" said to
   avoid a sequence of separate images, and `STAGES` was pinned at seven
   entries against the eight now agreed. Rather than write integration code
   that would immediately violate the file directing it, I fixed the harness
   first — `STAGES` in `main.ts` became the documented source of truth for
   names, thresholds, *and* per-stage image references, and cross-fading
   between stage artwork became the required form of continuity instead of a
   hard swap. I checked this was a real conflict and not an imagined one by
   grepping `CLAUDE.md` for stage-count language before proposing the fix.
   [`ff8dcbe`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/ff8dcbe)

10. **A rendering strategy can change completely without breaking the DOM
    contract that tests depend on.** Replacing the procedural SVG with eight
    images meant the bead was no longer one element with CSS-driven
    properties — it became a stack of `<img>` layers. `spec/bead-initial-state.test.ts`
    only ever asserted *one* `data-testid="bead"` element exists, not that
    it's an `<svg>`, so I kept that contract by making the images children of
    a single wrapping `data-testid="bead"` div and adding a `layerOpacities()`
    function that cross-fades exactly the current and next stage's images as
    progress crosses their threshold — never a hard cut. Stage ids also moved
    from placeholder terms (`raw`, `finished`) to the current vocabulary
    (`selecting-the-blank`, `final-polishing`), which meant deliberately
    updating the two spec assertions that hardcoded the old ids, rather than
    quietly preserving stale terminology the tests would no longer describe
    accurately. Verified with `pnpm check` (21/21 tests, build and lint clean)
    and Playwright driving the live dev server at both 1920×1080 and 390×844:
    exactly one bead element, and cross-fade opacities that interpolate
    correctly through every one of the eight stage boundaries.
    [`a61f207`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/a61f207)

11. **The cross-fade architecture paid for itself on the next four unrelated
    requests.** A run of small, separately-requested fixes — two stage images
    that had been copied in swapped, the bead's fixed size becoming a
    continuous `clamp()`/`vw` formula instead of a breakpoint jump, the
    one-time "Drag" hint becoming a recurring ring-only affordance between
    drags, and its label's font matching the page's display typeface — each
    touched only content or presentation, never `stageForProgress` or
    `layerOpacities`. That's the direct payoff of moment 9's decision to make
    `STAGES` the single source of truth: swapping which file backs an id is a
    data fix, not a logic fix, and reshaping the hint's own state machine
    couldn't touch the progress model because the two were never coupled. I
    checked each change the same way — `pnpm check` green at 21/21, then
    Playwright screenshots of the rendered page at both required viewports —
    and used the same Playwright pass to catch a case the code alone couldn't
    show: an apparently-wrong bead colour in one screenshot turned out to be a
    `.bead-layer` opacity transition still mid-flight at capture time, not a
    real opacity bug, which I only ruled out by reading the actual computed
    inline styles rather than trusting the logic that set them.
    [`dc1fda3...1f6fee0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/compare/dc1fda3...1f6fee0)

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there --- before a marker ever opens the file. It checks that your map is
traceable, not that it is good: the marker judges whether your small,
deliberately chosen set of moments shows real judgement and reflection. A green
check is not a substitute for that curation.

Images are deliberately not checked, because whether one renders is visible the
moment you look. Open this file on GitHub and look at it before you ship.
