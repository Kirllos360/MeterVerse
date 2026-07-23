# Repeated Failures

**Purpose:** Track failures that recur. If a failure type appears 3+ times, it triggers a systematic fix.
**Updates:** Every session end.

| Failure Pattern | Count | First Seen | Last Seen | Root Cause | Systematic Fix | Status |
|-----------------|:-----:|:----------:|:---------:|------------|----------------|:------:|
| _(pattern)_ | _(n)_ | _(date)_ | _(date)_ | _(cause)_ | _(fix)_ | OPEN/CLOSED |

## Current Alert Threshold
- **3 occurrences** → Investigate root cause
- **5 occurrences** → Automatic process change required
