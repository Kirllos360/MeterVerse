# P12-02-06 — SERVICE-TO-SERVICE SECURITY

## 1. Gap (verified)
Symbiot TCP/HTTP bridge accepts connections with **no credentials** (P12-01 G-017). Financial services publish events without service identity.

## 2. Design (§10) — safest architecture for current environment
**Service API keys + signed service tokens (HMAC), no mTLS (overkill for single-process).**

### ServiceIdentity + ServiceCredential models
```
model ServiceIdentity {
  id        String  @id @default(uuid())
  name      String  @unique                    // "symbiot-bridge", "dispatcher", "ledger"
  scopes    Json                               // ["ingestion:write", "events:read", ...]
  areaScope String?                            // optional area binding
  active    Boolean @default(true)
  createdAt DateTime @default(now())
  credentials ServiceCredential[]
}
model ServiceCredential {
  id           String   @id @default(uuid())
  serviceId    String
  keyHash      String                          // HMAC secret hash (never plaintext)
  keyPrefix    String                          // "svc_live_ab12..." (rotation-friendly)
  issuedAt     DateTime @default(now())
  expiresAt    DateTime?                       // rotation
  revokedAt    DateTime?
  lastUsedAt   DateTime?
  @@unique([keyPrefix])
}
```

### Authentication flow (Service A → Service B / bridge)
```
Service A presents:  X-Service-Key: svc_live_<prefix>
                      X-Service-Signature: HMAC-SHA256(nonce+ts+body, secret)
                      X-Service-Nonce: <uuid>            (replay protection)
                      X-Correlation-ID: <uuid>
Verify:
  1) find credential by prefix → keyHash match (constant-time)
  2) nonce not used before (short-lived cache) → replay protection
  3) timestamp within 60s skew window
  4) signature over canonical body
  5) service active + scope permits the operation
  6) tenancy: service areaScope (if set) must contain the target area; payload areaId CANNOT expand scope
```

### Service A → operation → audit → correlation
```
authenticateService (middleware)
  → authorizeService (scope check)
  → tenancy validation (target area within service areaScope; payload cannot override)
  → operation
  → auditLog("service.operation", { serviceId, operation, correlationId })
  → correlation propagated (X-Correlation-ID)
```

## 3. Rules (§10)
- **A service can NEVER impersonate a user** — service identity is distinct from user JWT; user endpoints still require user auth.
- **A service can NEVER override tenant/area/project via payload** — tenancy derived from service credential scope + target resource (P58/P59/P60 preserved).
- Rotation: issue new credential (new prefix), keep old until expiry, revoke old.
- Revocation: set revokedAt → verify rejects.
- Replay protection: nonce cache (30s TTL) + timestamp window.

## 4. Rejected options (§10)
- mTLS: overkill for single-process monolith (no cross-host transport yet).
- JWT client-credentials: adds issuer/audience complexity; HMAC keys sufficient internally.
- OAuth2: future (external partners); designed as an adapter later.

## 5. Migration (backward-compatible)
- Bridge: accept new `X-Service-Key` while existing (insecure) mode disabled by env flag `SYMBIOT_REQUIRE_AUTH=true` — dual-mode during rollout (see 15_MIGRATION).
