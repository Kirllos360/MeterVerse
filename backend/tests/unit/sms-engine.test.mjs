import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));

const { sendSms } = await import('../../src/services/sms-engine.js');

describe('sms-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('should log SMS and return success', async () => {
    prisma.smsLog.create.mockResolvedValue({ id: 'sms-1' });
    const result = await sendSms('+20123456789', 'Test message');
    expect(result.success).toBe(true);
    expect(prisma.smsLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ to: '+20123456789' }) })
    );
  });
});
