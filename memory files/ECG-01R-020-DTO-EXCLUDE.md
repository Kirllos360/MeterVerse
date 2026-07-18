# ECG-01R-020 — Add @Exclude to Sensitive DTO Fields

**Platform:** Security (OWASP A05:2021)  
**Priority:** P2  
**Estimated Effort:** 1 day  
**Depends on:** None  

## Objective

Prevent sensitive fields from leaking in API responses by adding `@Exclude()` decorators.

## Scope

### Audit all response DTOs

Search across `src/**/dto/*response*.ts` and `src/**/dto/*.dto.ts` for fields that should never be returned to clients:

1. **User/Identity DTOs**: `passwordHash`, `refreshToken`, `mfaSecret`
2. **Payment DTOs**: `cardNumber`, `cvv`, `bankAccount`
3. **Customer DTOs**: sensitive personal data if any
4. **Configuration DTOs**: `secretKey`, `apiKey`, `connectionString`

### Apply `@Exclude()` where needed

```typescript
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;
  
  @Exclude()   // Never send password hash in responses
  passwordHash: string;
}
```

### Verify serialization interceptor

Ensure that responses are serialized through `class-transformer`:
- Check if there's a global `ClassSerializerInterceptor` registered
- If not, add it: `app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))`
- Or ensure every controller method returns DTO instances (not raw Prisma objects)

### Enable `ClassSerializerInterceptor` in `main.ts`

```typescript
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
```

## Verification

- `npx tsc --noEmit` — 0 errors
- `passwordHash` never appears in any API response
- Sensitive fields are stripped from output
- All responses still include necessary non-sensitive fields
