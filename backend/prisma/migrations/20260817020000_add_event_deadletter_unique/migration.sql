-- P12.2-D: enforce one dead-letter row per (event, consumer)
CREATE UNIQUE INDEX IF NOT EXISTS "EventDeadLetter_eventId_consumerKey_key" ON "EventDeadLetter"("eventId", "consumerKey");
