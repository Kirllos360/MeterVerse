# Architecture Rules

1. Shared components are ALWAYS preferred over duplication
2. System A and System B share the same auth, DB, runtime
3. System A configures what System B executes
4. No product-specific fork of shared services
5. Every new endpoint needs a permission key
6. Graphiti must be updated before phase completion
7. SpecKit must pass before step completion
8. ADR must be created for significant decisions
9. Rollback plan must exist before migration
10. Evidence must be committed for every step
