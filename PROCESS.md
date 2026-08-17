# Process overview

A reading-guide to how the work came together, not an essay about it.

## What I built

**The Shine Is Made of Time**: a single Chinese lacquer bead whose surface
morphs continuously as the visitor drags anywhere on the page --- one bead,
one progress axis, eight labelled but non-exclusive stages riding on a single
continuous `progress` value.

## The moments that mattered

1. **Correcting the harness before writing code prevented shipping a
   contradiction.** Asked to replace the bead's CSS/SVG visuals with eight
   hand-drawn stage images, I re-read `CLAUDE.md` first and found it actively
   contradicted the request: "object continuity" said to avoid a sequence of
   separate images, and `STAGES` was pinned at seven entries against the eight
   now agreed. Instead of writing integration code that would immediately
   violate the file directing it, I fixed the harness first --- `STAGES` in
   `main.ts` became the source of truth for names, thresholds, *and*
   per-stage images, and cross-fading became the required form of continuity,
   never a hard swap. I confirmed the conflict was real, not imagined, by
   grepping `CLAUDE.md` for stage-count language before proposing the fix.
   [`ff8dcbe`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/ff8dcbe)

2. **Rights need establishing before a third-party image enters a soon-public
   repo, not verified after the fact.** Asked to use a specific lacquer/lotus
   photo carrying a visible "非遗" watermark as the page background, I declined
   twice and asked directly whether the requester held rights to it, shipping
   an original CSS/SVG crackle-texture alternative first. Only after an
   explicit "我有权使用" (I have the right to use it) did the real photo enter
   `src/assets/`, since a repo going public at the deadline is the wrong place
   to find out later that it shouldn't have.
   [`211c158`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/211c158)

3. **Working pointer code isn't the same as working touch code.** Re-testing
   the 390×844 viewport specifically for touch, since the drag had only ever
   been driven with a mouse, I didn't take "Pointer Events covers touch for
   free" on faith: I drove real CDP touch events across the same 200px swipe
   with and without `touch-action: pan-y` and measured the result --- progress
   4 without the fix, 40 (matching desktop) with it. One CSS line, verified by
   measurement, not by reading the handler and assuming.
   [`77c4b36`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/commit/77c4b36)

4. **The cross-fade architecture from moment 1 paid for itself on four later,
   unrelated fixes.** Two stage images copied in swapped, the bead's fixed
   size becoming a continuous viewport-based formula, a one-time "Drag" hint
   becoming a recurring affordance between drags, its font matching the
   page's display typeface --- each touched only content or presentation,
   never the progress logic. The same verification pass also caught something
   code alone couldn't: an apparently wrong-coloured bead in one screenshot
   was a CSS opacity transition still mid-flight at capture, ruled out only by
   reading the actual computed styles rather than trusting the logic that set
   them.
   [`dc1fda3...1f6fee0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-aSH201807/compare/dc1fda3...1f6fee0)

## Before you ship

`pnpm check:evidence` verifies these citations resolve to real commits, that
the current reflection is in `reflections/`, and that `CLAUDE.md` is present.
Images aren't checked --- open this file on GitHub and look before you ship.
