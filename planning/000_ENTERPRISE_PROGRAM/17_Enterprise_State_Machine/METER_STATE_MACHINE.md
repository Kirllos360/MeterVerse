# Meter State Machine

```
Stock → Assigned → Installed → Reading → Disconnected → Maintenance → Retired
```

| State | Allowed Transitions | Requires |
|-------|-------------------|----------|
| Stock | Assigned | Customer assignment |
| Assigned | Installed | Installation confirmation |
| Installed | Reading, Maintenance | Active status |
| Reading | Disconnected, Maintenance | Reading schedule |
| Disconnected | Maintenance, Retired | Deactivation order |
| Maintenance | Installed, Retired | Repair completion |
| Retired | — | Final reading recorded |
