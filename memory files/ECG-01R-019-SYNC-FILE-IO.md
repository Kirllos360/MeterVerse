# ECG-01R-019 — Fix Sync File I/O and Blocking Operations

**Platform:** Performance  
**Priority:** P2  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Replace synchronous file I/O with async alternatives in invoice rendering and upload paths.

## Scope

### `src/invoices/invoice-template.service.ts`

**Lines 138-144** — Per-invoice synchronous file reads (logo + signature):
- Replace `fs.existsSync()` with `fs.promises.access()` or `fs.promises.stat()`
- Replace `fs.readFileSync()` with `fs.promises.readFile()`
- Cache logo and signature files in memory after first read (they rarely change)

```typescript
private logoCache: Buffer | null = null;
private sigCache: Buffer | null = null;

async getLogo(): Promise<Buffer | null> {
  if (this.logoCache) return this.logoCache;
  try {
    const data = await fs.promises.readFile(this.logoPath);
    this.logoCache = data;
    return data;
  } catch { return null; }
}
```

### `src/common/engineering/scaffold.service.ts`
- Replace `fs.writeFileSync()` → `fs.promises.writeFile()`
- Replace `fs.mkdirSync()` → `fs.promises.mkdir({ recursive: true })`

### `src/common/engineering/release.service.ts`
- Replace `fs.readFileSync()` → `fs.promises.readFile()`
- Replace `fs.writeFileSync()` → `fs.promises.writeFile()`

### `src/upload/upload.controller.ts`
- Replace `fs.existsSync()` → `fs.promises.access()`

## Verification

- `npx tsc --noEmit` — 0 errors
- Invoice generation for 100 invoices completes without blocking the event loop
- Template rendering performance improves (cached files)
- All file operations use async methods
