# MeterVerse Navigation DNA

**Defines how users navigate the platform — sidebar, top navigation, breadcrumbs, and command palette.**

---

## 1. Navigation Architecture

```
AppShell
├── Sidebar (primary navigation, 280px / 64px)
├── TopNav (64px fixed)
│   ├── Hamburger (toggle sidebar)
│   ├── Logo + Project name
│   ├── Workspace/Area Switcher
│   ├── Global Search
│   ├── Notifications
│   └── User Menu (profile, settings, logout, theme toggle, language)
└── Content Area
    ├── Breadcrumb
    ├── Page Content
    └── Context Panel (optional)
```

## 2. Sidebar

- **Expanded:** 280px, shows icons + labels, section headers
- **Collapsed:** 64px, shows icons only + tooltips
- **Sections:** Dashboard, Business, Operations, Settings, System
- **Items:** Role-filtered via NavigationRegistry
- **Active item:** Brand-500 background with icon
- **Collapse toggle:** Button at bottom of sidebar
- **Mobile:** Automatically collapsed, overlay mode with backdrop

## 3. Top Navigation

- **Location:** Fixed at top of page, z-index above sidebar
- **Height:** 64px
- **Workspace Switcher:** Dropdown showing available workspaces
- **Area Switcher:** Dropdown showing available areas (for multi-area users)
- **Global Search:** Ctrl+K to focus, searches across all entities
- **Notifications:** Bell icon with unread count badge, dropdown panel
- **User Menu:** Avatar, name, role, settings link, theme toggle, language toggle, logout

## 4. Breadcrumb

- **Location:** Below TopNav, above page content
- **Format:** Home > Section > Page
- **Clickable:** Each segment navigates to that level
- **Dynamic:** Updates based on page context
- **Hidden on:** Mobile (reduce clutter)

## 5. Command Palette

- **Trigger:** Ctrl+K (Cmd+K on Mac)
- **Scope:** Global search, navigation, actions
- **Content:** Recent pages, favorites, actions, entity search
- **Keyboard:** Arrow keys to navigate, Enter to select, Esc to close

## 6. Workspace Switcher

- **Purpose:** Switch between MeterVerse workspaces (Operations, Billing, Administration, etc.)
- **Display:** Dropdown in TopNav
- **Content:** Workspace name, optional description
- **Filtering:** Only shows workspaces user has access to

## 7. Navigation Responsive Behavior

| Breakpoint | Sidebar | TopNav | Content |
|-----------|---------|--------|---------|
| Desktop >=1024px | Expanded (toggleable) | Full | Normal |
| Tablet 768-1023px | Collapsed (overlay on toggle) | Condensed | Normal |
| Mobile <768px | Hidden (overlay on toggle) | Condensed + hamburger | Full width |
