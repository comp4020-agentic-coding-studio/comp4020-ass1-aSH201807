# Assignment 1 reflection

**What was the breakthrough that moved the work forward?**

The first breakthrough was realising the seven named stages weren't things to
draw, but labels on continuous functions of one progress number — that's what
kept "object continuity" from being a constraint I had to keep checking and
turned it into something the architecture guaranteed. The harder, later
breakthrough was seeing that this discipline had to survive a representation
change, not just an initial design. When hand-drawn artwork replaced the
procedural SVG (and seven stages became eight), continuity couldn't mean "one
set of CSS custom properties" any more — it had to mean "the current stage and
the next one always cross-fade, never hard-cut," with `STAGES` as the single
place thresholds, labels, and images all lived. That reframing paid for itself
repeatedly afterwards: swapping two mislabelled stage images back was a content
fix with zero logic changes; making the bead scale continuously with viewport
width instead of jumping at a breakpoint, and turning a one-time "Drag" hint
into a recurring affordance, were both possible without touching the progress
model at all, because the mechanic had stayed cleanly separated from its
presentation.

**What did this work change about who I want to be as a developer?**

Two habits I want to keep. First, check the instructions you're being held to
before satisfying the immediate request — re-reading `CLAUDE.md` caught that
"eight hand-drawn images" directly contradicted its existing "no slideshow"
rule before I wrote a line of integration code, so I fixed the rule and the
code together instead of shipping a contradiction. Second, "logically correct"
isn't "verified" — an apparently wrong-coloured bead in a screenshot turned out
to be a CSS transition mid-flight, not a real bug, and I only knew that because
I read the actual computed opacities in the rendered page instead of trusting
what the code should do.
