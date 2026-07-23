import express from 'express';
import cors from 'cors';
import { vi } from 'vitest';

// Mock JWT_SECRET for testing
process.env.JWT_SECRET = 'test-secret-key';

import { authRouter } from '../../src/routes/auth.js';
import { customersRouter } from '../../src/routes/customers.js';
import { metersRouter } from '../../src/routes/meters.js';
import { readingsRouter } from '../../src/routes/readings.js';
import { invoicesRouter } from '../../src/routes/invoices.js';
import { paymentsRouter } from '../../src/routes/payments.js';
import { adminRouter } from '../../src/routes/admin.js';
import { servicesRouter } from '../../src/routes/services.js';
import { reportsRouter } from '../../src/routes/reports.js';
import { securityRouter } from '../../src/routes/security.js';
import { domainRouter } from '../../src/routes/domain.js';
import { businessRouter } from '../../src/routes/business.js';
import { crudRouter } from '../../src/routes/crud.js';
import { monitorRouter } from '../../src/routes/monitor.js';
import { aiRouter } from '../../src/routes/ai.js';
import { meterAssignmentRouter } from '../../src/routes/meter-assignments.js';
import { preferencesRouter } from '../../src/routes/preferences.js';
import { searchRouter } from '../../src/routes/search.js';
import { tasksRouter } from '../../src/routes/tasks.js';
import { alertsRouter } from '../../src/routes/alerts.js';
import { notificationsRouter } from '../../src/routes/notifications.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/customers', customersRouter);
app.use('/api/meters', metersRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/domain', domainRouter);
app.use('/api/business', businessRouter);
app.use('/api/crud', crudRouter);
app.use('/api/monitor', monitorRouter);
app.use('/api/ai', aiRouter);
app.use('/api/security', securityRouter);
app.use('/api/meter-assignments', meterAssignmentRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/search', searchRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/alerts', alertsRouter);
app.use(errorHandler);

export default app;
