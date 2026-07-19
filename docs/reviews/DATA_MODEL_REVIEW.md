# Phase G: Data Model Review

## Entity Relationships

`
Customer 1--* Meter 1--* Reading
Customer 1--* Invoice 1--* Payment
`

## Issues Found

| Issue | Location | Severity |
|-------|----------|----------|
| No Contract entity | Missing link between Customer and Meter | HIGH |
| No Tariff entity | Prices hardcoded or missing | HIGH |
| No Address table | Address in Customer as flat fields | LOW |
| No Zone/Area table | Area as string field | LOW |
| No soft delete anywhere | Data permanently lost on delete | HIGH |
| No audit columns | createdBy/updatedBy missing | HIGH |
| No status enum types | Status as string — risk of typos | MEDIUM |