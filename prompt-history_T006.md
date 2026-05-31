# T006 Implementation Prompt

**Date**: 2026-05-26
**Task**: T006 — Implement standard error envelope + global exception filter

## Spec

- ErrorEnvelope: `{ code: string; message: string; details?: unknown; correlationId: string }`
- Global NestJS exception filter for HttpException, unknown errors, validation failures
- correlationId from x-correlation-id header or auto-generated
- Unit tests for envelope shape and contract drift prevention

## Files

- `backend/src/common/http/error-envelope.ts`
- `backend/src/common/http/all-exceptions.filter.ts`
- `backend/test/error-envelope.spec.ts`
