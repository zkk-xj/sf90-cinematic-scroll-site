# SF90 Visual Shell V2 — Design QA

Date: 2026-08-22

## Scope

- Desktop hero at 1440 × 1024
- Desktop Connection scene at 1440 × 900
- Mobile hero and Connection scene at 390 × 844
- Existing wheel, mouse-drag, touch-scrub, chapter navigation, sound toggle, loading, and replay behavior

## Comparison passes

- Hero reference vs implementation: `../../inspection/visual-shell-v2/hero-reference-vs-v2.jpg`
- Connection before vs implementation: `../../inspection/visual-shell-v2/connection-before-vs-v2.jpg`
- Mobile before vs implementation: `../../inspection/visual-shell-v2/mobile-before-vs-v2.jpg`

## Findings resolved

- Replaced the duplicate right-side scene indicator with one centered four-step progress rail while retaining the live status region for assistive technology.
- Reduced the hero display scale and tightened the copy block so the title reads as editorial framing instead of competing with the car.
- Changed content-scene headings to the technical sans-serif face; Connection now leaves the cockpit and steering-wheel focal point unobstructed.
- Removed the heavy burgundy wash and kept a neutral black text-safety gradient without filters, blur, or Canvas compositing changes.
- Rebalanced the 390 px layout: smaller hero copy, higher chapter rail, intact 44 px tap targets, and no title or bilingual-copy clipping.
- Aligned the progress line to settled chapter steps so its fill and active dot no longer disagree.

## Functional and accessibility checks

- Desktop and mobile layouts have no horizontal overflow.
- All four chapter controls are reachable and functional; the sound toggle preserves `aria-pressed`.
- The visually hidden status remains an `aria-live` region.
- Reduced-motion behavior and existing focus treatments remain intact.
- Desktop mouse and mobile touch input both reached their expected frame with no reverse commits.
- Frame 208 rendered as one opaque Canvas draw with no blended ghost frame.
- Three mobile release-jank runs reported no post-release Canvas resize or quality switch; worst rAF gap was 17.5 ms.
- No console or page errors were observed in desktop or mobile visual QA.

final result: passed
