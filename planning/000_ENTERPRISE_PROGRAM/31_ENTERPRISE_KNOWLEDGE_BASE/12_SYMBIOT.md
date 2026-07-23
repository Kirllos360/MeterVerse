# SYMBIOT Integration

## Current Knowledge
**What we know:**
- SYMBIOT is an external central service that connects to physical meters
- SYMBIOT receives and stores meter reading data
- MeterVerse connects to SYMBIOT as an "admin user" to access the data
- SYMBIOT provides daily readings and various other data
- The connection is made via API (MeterVerse acts as a client)

## Unknown
- Authentication method (API key? OAuth? Username/password?)
- API endpoints and data format
- One central SYMBIOT or one per area
- Push (SYMBIOT sends) or Pull (MeterVerse fetches)
- Data frequency (real-time, hourly, daily)
- What data beyond readings does SYMBIOT provide? (Alerts, status, events?)

## Assumptions
- MeterVerse will pull data from SYMBIOT on a scheduled basis
- SYMBIOT has a REST API
- SYMBIOT meters are identified by serial number (matching MeterVerse)

## Confidence
- SYMBIOT purpose: 90% (user explained clearly)
- Integration method: 30% (need API details)
- Data model: Unknown

## Need User Confirmation
- [ ] Provide SYMBIOT API documentation
- [ ] Confirm authentication method
- [ ] Confirm data frequency and format
