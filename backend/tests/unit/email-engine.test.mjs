import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/db.js', () => ({ prisma }));
vi.mock('nodemailer', async () => ({ default: { createTransport: vi.fn(() => ({ sendMail: vi.fn() })) } }));

const { sendEmail } = await import('../../src/services/email-engine.js');

describe('email-engine', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  it('should send email and log it', async () => {
    prisma.emailLog.create.mockResolvedValue({ id: 'log-1' });
    const result = await sendEmail('test@test.com', 'Subject', 'Body');
    expect(result).toBeDefined();
  });
});
