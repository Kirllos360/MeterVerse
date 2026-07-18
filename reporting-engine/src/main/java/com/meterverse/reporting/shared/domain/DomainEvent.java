package com.meterverse.reporting.shared.domain;

import java.time.Instant;
import java.util.UUID;

public interface DomainEvent {

    UUID getEventId();

    default Instant occurredAt() {
        return Instant.now();
    }
}
