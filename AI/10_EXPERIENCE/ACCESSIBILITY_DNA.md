# MeterVerse Accessibility DNA

**Defines accessibility standards for all MeterVerse UI. Target: WCAG 2.2 Level AA minimum, AAA where practical.**

---

## 1. Standards Compliance

| Standard | Target | Status |
|----------|--------|--------|
| WCAG 2.1 | Level AA | ✅ Required |
| WCAG 2.2 | Level AA | ✅ Required |
| WCAG 2.2 | Level AAA | ⭐ Stretch goal |
| EN 301 549 | European accessibility | 📋 Planned |
| ADA | US accessibility | 📋 Planned |

## 2. Color and Contrast

- All text: minimum 4.5:1 contrast ratio against background
- Large text (18px+): minimum 3:1 contrast ratio
- UI components and graphical objects: minimum 3:1
- Focus indicators: minimum 3:1 contrast against background, 2px minimum
- Never use color alone to convey information — use icons, labels, and patterns
- Status indicators use color + icon + text label (e.g., red + X icon + "Failed")

## 3. Keyboard Accessibility

| Requirement | Implementation |
|-------------|---------------|
| All interactive elements reachable | Tab order follows visual layout |
| Visible focus indicator | 2px solid ring in brand color |
| Skip to content link | First tabbable element on page |
| No keyboard traps | ESC closes all overlays |
| Shortcut keys | Documented, opt-in, no conflicts |
| Command palette | Ctrl+K for all keyboard navigation |

## 4. Screen Reader Support

- All images have descriptive alt text
- All icons have aria-label or aria-labelledby
- Forms have associated labels (not placeholders as labels)
- Error messages are announced via aria-live
- Dynamic content changes are announced via aria-live="polite"
- Tables have proper scope, headers, and caption
- Landmarks: header, nav, main, complementary, contentinfo

## 5. Focus Management

- Dialog opens: focus moves to first focusable element or close button
- Dialog closes: focus returns to trigger element
- Drawer opens: focus moves to drawer heading
- Drawer closes: focus returns to trigger
- Tab panel: focus stays in tab panel, arrow keys navigate tabs
- Table: focusable rows for action menus

## 6. Touch and Motion

- Touch targets minimum 44x44px (WCAG 2.2)
- Sufficient spacing between touch targets
- Swipe gestures have button alternatives
- `prefers-reduced-motion` respected — disable all non-essential motion

## 7. Forms

- Every input has a visible label
- Required fields marked with both asterisk and "required" text
- Error messages linked to inputs via aria-describedby
- Validation on blur, not on keypress
- Success announced via aria-live
- Autocomplete attributes for common fields

## 8. Responsive Accessibility

- Mobile: touch-friendly targets, readable font sizes, no horizontal scroll
- Tablet: hybrid touch + keyboard
- Desktop: full keyboard + mouse support
- Zoom: page works at 400% zoom without loss of content
- Orientation: supports both portrait and landscape

## 9. Testing Requirements

| Test | Tool | Frequency |
|------|------|-----------|
| Automated a11y | axe-core | Every CI run |
| Color contrast | Manual check | Every theme change |
| Keyboard navigation | Manual walkthrough | Every feature |
| Screen reader | VoiceOver/NVDA | Per release |
| Reduced motion | Browser DevTools | Per release |
| Zoom to 400% | Browser zoom | Per release |
| Focus order | Tab through pages | Per release |
