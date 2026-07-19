# Component Consistency Report — Phase 32

**Goal:** All components use same typography, spacing, elevation, radius, icon sizing, animation, hover, focus.

---

## 1. Radius Inconsistencies

| Component | Current | Token Scale | Should Be |
|-----------|---------|-------------|-----------|
| Button | `rounded-md` (6px) | `sm=4, md=8, lg=12` | `rounded-md` (shadcn default — keep) |
| Input | `rounded-md` (6px) | same | Keep (shadcn convention) |
| Select trigger | `rounded-md` (6px) | same | Keep |
| Card (shadcn) | `rounded-xl` (12px) | same | Keep |
| **Login page inputs** | `rounded-xl` (12px) | same | `rounded-lg` (8px) to match shadcn |
| Inspect tab buttons | `rounded` (4px) | sm=4px | Keep (matches scale) |
| KPIWidget | `rounded-xl` (12px) | lg=12px | Keep (matches scale) |
| Dialog | `rounded-xl` (12px) | lg=12px | Keep |

**Issue:** Login page inputs use `rounded-xl` (12px) while shadcn inputs use `rounded-md` (6px). These should match.

## 2. Shadow/Elevation Inconsistencies

| Component | Current | Token | Should Be |
|-----------|---------|-------|-----------|
| Button | `shadow-xs` | `shadow-sm/md/lg` | Remove shadow (buttons don't need elevation) |
| Input | `shadow-xs` | same | Remove |
| Select trigger | `shadow-xs` | same | Remove |
| Card (shadcn) | `shadow-sm` | `shadow-sm` | Keep |
| KPIWidget | `shadow-sm` | `shadow-sm` | Keep |
| CommandPalette | `shadow-2xl` | `shadow-lg` | `shadow-lg` |
| Dialog | `shadow-lg` | `shadow-lg` | Keep |
| ContextMenu | `shadow-xl` | `shadow-lg` | `shadow-lg` |
| NotificationCenter | `shadow-md` | `shadow-md` | Keep |

**Issue:** `shadow-xs` is used by shadcn but doesn't exist in our elevation system. Buttons/inputs shouldn't have shadows.

## 3. Height Inconsistencies

| Component | Height | Spacing Scale | Issue |
|-----------|--------|---------------|-------|
| Button default | `h-9` (36px) | 32/48 | Between scale values |
| Button sm | `h-8` (32px) | 32 | OK |
| Button lg | `h-10` (40px) | 32/48 | Between scale values |
| Input | `h-9` (36px) | 32/48 | Between scale values |
| **Login page inputs** | `h-11` (44px) | 32/48 | Should be `h-10` (40px) |
| Sidebar items | `h-8` (32px) | 32 | OK |

## 4. Focus Consistency

| Component | Focus Style |
|-----------|-------------|
| Button | `focus-visible:ring-[3px] ring-ring/50` |
| Input | Same as button ✅ |
| Select | Same as button ✅ |
| Login inputs | `focus:ring-2` — ring not ring |

**Issue:** Login inputs use `focus:ring-2` instead of `focus-visible:ring-[3px]` like shadcn.

## 5. Summary of Fixes Needed

| Component | Change | Reason |
|-----------|--------|--------|
| Login inputs | `rounded-xl` → `rounded-lg` | Match shadcn convention |
| Login inputs | `h-11` → `h-10` | Match spacing scale |
| Login inputs | `focus:ring-2` → `focus-visible:ring-[3px]` | Match shadcn focus |
| Login inputs | Remove `--tw-ring-color` → use `ring-ring/50` | Match shadcn |

## 6. Already Consistent ✅

| Property | Status | Notes |
|----------|--------|-------|
| Typography | ✅ | All use `text-sm` (14px) for controls, `text-xs` (12px) for labels |
| Gap | ✅ | `gap-2` (8px) between icon and text in buttons |
| Icon sizing | ✅ | SVG icons use `size-4` (16px) consistently |
| Transition | ✅ | `transition-all` or `transition-[color,box-shadow]` on all interactive |
| Disabled state | ✅ | `disabled:opacity-50` on all controls |
| Cursor | ✅ | `disabled:cursor-not-allowed` on all controls |
