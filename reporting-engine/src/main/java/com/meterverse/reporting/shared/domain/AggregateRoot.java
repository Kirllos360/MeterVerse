package com.meterverse.reporting.shared.domain;

import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@SuperBuilder
public abstract class AggregateRoot {

    private UUID id;
    private int version;
    private Instant createdAt;
    private Instant updatedAt;

    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected AggregateRoot() {
        this.id = UUID.randomUUID();
        this.version = 1;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    public void clearEvents() {
        domainEvents.clear();
    }
}
