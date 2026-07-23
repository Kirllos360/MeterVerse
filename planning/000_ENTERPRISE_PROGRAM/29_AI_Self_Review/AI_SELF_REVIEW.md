# AI Self-Review Checklist

**Purpose:** AI agents must review their own work before presenting it.

## Self-Review Questions

### Completeness
- [ ] Did I implement what was requested?
- [ ] Did I miss any edge cases?
- [ ] Did I handle errors properly?
- [ ] Did I add validation?
- [ ] Did I handle authentication and authorization?
- [ ] Did I add audit logging?

### Quality
- [ ] Does the code follow existing patterns?
- [ ] Is the code consistent with the rest of the codebase?
- [ ] Are there any obvious performance issues?
- [ ] Are there any security concerns?
- [ ] Are error messages helpful?
- [ ] Is the code readable?

### Architecture
- [ ] Does this change affect System A or System B?
- [ ] Does this change break any shared component?
- [ ] Does this change require a new permission key?
- [ ] Does this change require Graphiti update?
- [ ] Does this change require SpecKit update?
- [ ] Does this change require documentation update?

### Evidence
- [ ] Did I update STATUS.yaml correctly?
- [ ] Did I commit evidence files?
- [ ] Did I update the Master Knowledge Checklist?
- [ ] Did I log tool usage?
- [ ] Did I run GATE_CHECK?
- [ ] Did I run SpecKit validation?

### Honesty
- [ ] Am I marking work complete that is actually incomplete?
- [ ] Did I skip any verification step?
- [ ] Did I test the change?
- [ ] Is there any risk I'm not reporting?
- [ ] Would I be comfortable if a colleague reviewed this?
