# Workday Integration Design

## Current State (V1)
- Mock HRIS provider implementation
- Database schema includes workday_id fields on all reference entities
- Integration event log table ready for tracking
- Workday mapping table for ID correlation

## Data Ownership

### Workday Owns (Inbound)
- Legal entities / Companies
- Supervisory organisations
- Cost centres
- Workers
- Managers
- Positions
- Job profiles
- Grades

### Recruitment Hub Owns
- Candidate CV / profile
- Applications
- Recruitment pipeline
- Recruiter notes
- Interviews / feedback
- Talent pool
- Recruitment activity

### Shared
- Requisitions (created in either, synced)
- Offers (managed in Hub, data sent to Workday)
- Pre-hires / successful candidate handoff

## Integration Architecture (Future)

```
Recruitment Hub
    ↓
Recruitment API
    ↓
Workday Integration Service
    ↓
Workday REST / SOAP APIs
```

### HRISProvider Interface

```typescript
interface HRISProvider {
  getLocations(): Promise<Location[]>
  getCostCentres(): Promise<CostCentre[]>
  getJobProfiles(): Promise<JobProfile[]>
  getPositions(): Promise<Position[]>
  getWorkers(): Promise<Worker[]>
  getManagers(): Promise<Manager[]>
  getRequisition(id: string): Promise<Requisition | null>
  createRequisition(data): Promise<string>
  updateRequisition(id: string, data): Promise<void>
  createPreHire(data): Promise<string>
  submitHire(data): Promise<string>
}
```

## Workday Mapping Table

| Column | Purpose |
|---|---|
| object_type | Entity type (department, location, etc.) |
| internal_id | Recruitment Hub UUID |
| workday_id | Workday WID / Reference ID |
| workday_descriptor | Workday display name |
| last_synced_at | Last sync timestamp |

## Integration Events

All integration calls are logged with:
- Direction (inbound/outbound)
- Object type and ID
- Status (queued → processing → success/failed)
- Request/response payloads
- Error messages
- Timestamps
