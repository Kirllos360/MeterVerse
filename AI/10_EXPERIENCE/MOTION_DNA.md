# MeterVerse Motion DNA

**Defines animation philosophy, timing, easing, and usage rules.**

---

## 1. Motion Philosophy

Motion in MeterVerse is purposeful, not decorative. Every animation must serve one of these purposes:
- Guide attention (where to look next)
- Provide feedback (something happened)
- Show relationships (this is connected to that)
- Maintain context (where was I, where am I going)

## 2. Motion Principles

| Principle | Description |
|-----------|-------------|
| **Subtle** | Animations are 150-300ms, never flashy |
| **Fast** | Users never wait for an animation to complete before interacting |
| **Consistent** | Same motion for same purpose everywhere |
| **Accessible** | Respects `prefers-reduced-motion` — all motion disabled |
| **Natural** | Easing curves mimic physical movement |

## 3. Duration Tokens

| Token | Duration | Usage |
|-------|----------|-------|
| instant | 0ms | State changes |
| fast | 150ms | Hover, focus, micro-interactions |
| normal | 200ms | Transitions, toasts, tooltips |
| slow | 300ms | Page transitions, drawer open/close |
| slower | 500ms | Loading states, progress animations |
| slowest | 700ms | Celebratory, confirmation animations |

## 4. Easing Tokens

| Token | Curve | Usage |
|-------|-------|-------|
| default | ease-in-out | Standard transitions |
| in | ease-in | Elements entering viewport |
| out | ease-out | Elements leaving viewport |
| emphasized | cubic-bezier(0.4, 0, 0.2, 1) | Page transitions, drawer |
| spring | spring-based | Natural feel for interactive elements |

## 5. Animation Categories

| Category | Examples | Duration |
|----------|----------|----------|
| Micro-interactions | Button press, toggle switch, checkbox | 150ms |
| Transitions | Sidebar collapse, tab switch, accordion | 200ms |
| Surface transitions | Drawer, dialog, sheet, popover | 300ms |
| Page transitions | Route changes, wizard steps | 300ms |
| Feedback | Toast, alert, badge count change | 200ms |
| Loading | Skeleton pulse, spinner, progress bar | 500ms+ |
| Attention | Pulse on new notification, shake on error | 500ms |

## 6. Reduced Motion

When `prefers-reduced-motion: reduce` is detected:
- All animations set to `duration: 0ms`
- Transitions become instant
- No parallax, no parallax scrolling
- No auto-playing animations
- Page transitions become instant swaps

## 7. Transition Guidelines

| Element | Enter | Exit | State Change |
|---------|-------|------|-------------|
| Dialog | Fade in + scale up | Fade out + scale down | — |
| Drawer | Slide from right | Slide to right | — |
| Sidebar | Slide from left | Slide to left | — |
| Dropdown | Fade in + slide down | Fade out + slide up | — |
| Toast | Slide from top | Fade out | — |
| Tooltip | Fade in | Fade out | — |
| Tab content | Fade in | Fade out | — |
| Table row | — | — | Highlight on change |
| Badge | — | — | Pulse on status change |
| Skeleton | Pulse animation | Fade out to content | — |
