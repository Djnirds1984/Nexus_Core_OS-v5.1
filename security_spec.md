# Security Specification - Titan Nexus Dashboard

## Data Invariants
1. Packet captures must have a valid timestamp and numeric sizes.
2. Firewall rules require a valid priority and action.
3. Multi-WAN policies must have at least one interface.
4. Hotspot instances must specify an authentication method.

## The "Dirty Dozen" Payloads (Malicious Attempts)
1. **Shadow Field injection**: Adding `isAdmin: true` to a system user profile.
2. **Identity Spoofing**: Creating a packet capture with a fake source IP belonging to another segment.
3. **Resource Exhaustion**: Sending a packet capture with a 1MB `flags` string.
4. **Logic Bypass**: Deleting a firewall rule as a viewer.
5. **ID Poisoning**: Creating an interface with a 2KB junk character ID.
6. **Relation Orphanage**: Creating a multi-WAN policy referencing a non-existent interface.
7. **Type Mismatch**: Sending a string for a numeric port.
8. **Immutability Breach**: Attempting to change `createdAt` on an existing firewall rule.
9. **Zero-Trust Fail**: Listing system users without being authenticated.
10. **Admin Escalation**: Modifying self-role in `system_users` collection.
11. **Negative Balance**: Setting `rx_speed` to a negative value.
12. **Status Loop**: Moving a hotspot from 'active' to a non-existent status.

## Test Runner
I will verify these in the rules logic.
