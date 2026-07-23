import { describe, it, expect } from 'vitest';

describe('API Integration Tests', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await fetch('http://localhost:3001/api/customers');
    expect(res.status).toBe(401);
  });

  it('should have health endpoint', async () => {
    const res = await fetch('http://localhost:3001/api/health');
    const data = await res.json();
    expect(data.status).toBe('ok');
  });
});
