# DeepSeek Enterprise Review — MeterVerse PR

You are reviewing a Pull Request for MeterVerse Enterprise.

## Review Requirements

Generate 8 reports in the following order. Use the review date and PR number.

### 1. Architecture Report
- Review component structure, module boundaries, data flow
- Check BFF pattern compliance (types.ts → service.ts → queries.ts)
- Flag any circular dependencies or coupling issues
- Score /100

### 2. UX Report
- Review visual hierarchy, spacing, typography consistency
- Check design token usage (no hardcoded colors)
- Flag any layout or alignment issues
- Score /100

### 3. Accessibility Report (WCAG 2.1 AA)
- Check keyboard navigation, focus management
- Check ARIA attributes, labels, semantic HTML
- Flag any violations with file:line references
- Score /100

### 4. Performance Report
- Check bundle impact, lazy loading, memo usage
- Flag expensive re-renders or animation performance
- Score /100

### 5. Security Report
- Hardcoded secrets, SQL injection, XSS vectors
- Authentication/authorization gaps
- Input validation
- Score /100

### 6. Design Token Compliance
- Check all colors use var(--xxx) not hardcoded hex
- Check spacing uses token scale (4/8/12/16/24/32/48)
- Check typography uses token scale (display/heading/title/body/caption/label)
- Score /100

### 7. Code Quality Report
- TypeScript strictness, unused imports, complexity
- Error handling completeness
- Naming conventions
- Score /100

### 8. Technical Debt Report
- TODO/FIXME comments
- Missing error boundaries
- Missing loading/empty states
- Score /100

## Response Format

Return each report as a markdown section with:
- Score
- Issues found (file:line references)
- Recommendations
- Priority (critical/high/medium/low)

## Rules

- NEVER suggest modifying production code
- ONLY generate reports and recommendations
- Be specific - include file paths and line numbers
- Be constructive - every criticism should include a fix recommendation
