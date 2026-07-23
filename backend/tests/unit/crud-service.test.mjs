import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma, resetPrismaMocks } from '../helpers/mock-prisma.js';

vi.mock('../../src/server.js', () => ({ prisma }));

const { softDelete, bulkUpdate, bulkDelete, importData, exportData, undoAction, toggleArchive, submitForApproval, approve, reject, getVersionHistory } = await import('../../src/services/crud-service.js');

describe('crud-service', () => {
  beforeEach(() => { resetPrismaMocks(); vi.clearAllMocks(); });

  describe('softDelete', () => {
    it('should archive an entity and create audit entry', async () => {
      prisma.customer.update.mockResolvedValue({ id: 'c1', name: 'Test', archivedAt: new Date(), status: 'archived' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await softDelete('customer', 'c1', 'user-1');
      expect(result.status).toBe('archived');
      expect(prisma.customer.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'c1' }, data: expect.objectContaining({ status: 'archived' })
      }));
      expect(prisma.auditEntry.create).toHaveBeenCalled();
    });

    it('should throw for unknown model', async () => {
      await expect(softDelete('nonexistent', 'id', 'u')).rejects.toThrow('not found');
    });
  });

  describe('bulkUpdate', () => {
    it('should update multiple entities and return summary', async () => {
      prisma.customer.update.mockResolvedValueOnce({ id: 'c1' }).mockResolvedValueOnce({ id: 'c2' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await bulkUpdate('customer', ['c1', 'c2'], { status: 'active' }, 'user-1');
      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(2);
    });
  });

  describe('bulkDelete', () => {
    it('should soft-delete multiple entities', async () => {
      prisma.customer.update.mockResolvedValue({ id: 'c1', status: 'archived' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await bulkDelete('customer', ['c1'], 'user-1');
      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(1);
    });
  });

  describe('importData', () => {
    it('should import records and return summary', async () => {
      prisma.customer.create.mockResolvedValueOnce({ id: 'c1' }).mockResolvedValueOnce({ id: 'c2' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await importData('customer', [{ name: 'A' }, { name: 'B' }], 'user-1');
      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
    });

    it('should handle import failures gracefully', async () => {
      prisma.customer.create.mockRejectedValueOnce(new Error('duplicate key'));
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await importData('customer', [{ name: 'A' }], 'user-1');
      expect(result.total).toBe(1);
      expect(result.failed).toBe(1);
    });
  });

  describe('exportData', () => {
    it('should export JSON format', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: 'c1', name: 'Test' }]);

      const result = await exportData('customer', {}, 'json');
      expect(result.format).toBe('json');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('c1');
    });

    it('should export CSV format', async () => {
      prisma.customer.findMany.mockResolvedValue([{ id: 'c1', name: 'Test' }]);

      const result = await exportData('customer', {}, 'csv');
      expect(result.format).toBe('csv');
      expect(result.data).toContain('id,name');
    });

    it('should handle empty export', async () => {
      prisma.customer.findMany.mockResolvedValue([]);

      const result = await exportData('customer', {}, 'csv');
      expect(result.data).toBe('No data');
    });
  });

  describe('undoAction', () => {
    it('should create an undo audit entry', async () => {
      prisma.auditEntry.findUnique.mockResolvedValue({ id: 'a1', action: 'customer.delete', resource: 'customer', resourceId: 'c1' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a2' });

      const result = await undoAction('a1', 'user-1');
      expect(result.undone).toBe(true);
    });

    it('should throw for missing audit entry', async () => {
      prisma.auditEntry.findUnique.mockResolvedValue(null);
      await expect(undoAction('bad-id', 'u')).rejects.toThrow('not found');
    });
  });

  describe('toggleArchive', () => {
    it('should archive an active entity', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c1', archivedAt: null });
      prisma.customer.update.mockResolvedValue({ id: 'c1', archivedAt: new Date(), status: 'archived' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await toggleArchive('customer', 'c1', 'user-1');
      expect(result.status).toBe('archived');
    });

    it('should unarchive an archived entity', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 'c1', archivedAt: new Date() });
      prisma.customer.update.mockResolvedValue({ id: 'c1', archivedAt: null, status: 'active' });
      prisma.auditEntry.create.mockResolvedValue({ id: 'a1' });

      const result = await toggleArchive('customer', 'c1', 'user-1');
      expect(result.status).toBe('active');
    });
  });

  describe('approval workflow', () => {
    it('should submit for approval', async () => {
      prisma.invoice.update.mockResolvedValue({ id: 'i1', status: 'pending_approval' });
      prisma.workflowState.create.mockResolvedValue({ id: 'w1' });

      const result = await submitForApproval('invoice', 'i1', 'user-1', 'Please review');
      expect(result.status).toBe('pending_approval');
    });

    it('should approve', async () => {
      prisma.invoice.update.mockResolvedValue({ id: 'i1', status: 'approved' });
      prisma.workflowState.create.mockResolvedValue({ id: 'w1' });

      const result = await approve('invoice', 'i1', 'user-1', 'Approved');
      expect(result.status).toBe('approved');
    });

    it('should reject', async () => {
      prisma.invoice.update.mockResolvedValue({ id: 'i1', status: 'rejected' });
      prisma.workflowState.create.mockResolvedValue({ id: 'w1' });

      const result = await reject('invoice', 'i1', 'user-1', 'Invalid');
      expect(result.status).toBe('rejected');
    });
  });

  describe('getVersionHistory', () => {
    it('should return mapped audit entries', async () => {
      prisma.auditEntry.findMany.mockResolvedValue([
        { id: 'a1', action: 'invoice.update', actor: 'admin@test.com', timestamp: new Date(), details: '{"field":"amount"}' },
      ]);

      const result = await getVersionHistory('invoice', 'i1');
      expect(result).toHaveLength(1);
      expect(result[0].details.field).toBe('amount');
    });
  });
});
