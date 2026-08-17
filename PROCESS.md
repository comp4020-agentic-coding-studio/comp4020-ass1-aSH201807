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

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there --- before a marker ever opens the file. It checks that your map is
traceable, not that it is good: the marker judges whether your small,
deliberately chosen set of moments shows real judgement and reflection. A green
check is not a substitute for that curation.

Images are deliberately not checked, because whether one renders is visible the
moment you look. Open this file on GitHub and look at it before you ship.
