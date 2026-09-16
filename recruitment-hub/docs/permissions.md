# Permissions Model

## Roles

| Role | Description |
|---|---|
| admin | Full system access, configuration, audit logs |
| rec_admin | All recruitment data, analytics, recruiter management |
| recruiter | Assigned requisitions, candidates, applications, pipeline management |
| hiring_manager | Own requisitions, submitted candidates, interview feedback |
| interviewer | Assigned interviews, candidate info for those interviews, feedback submission |
| hr_reward | Offer information, compensation details, approvals |

## RLS Policy Summary

### Requisitions
- **admin, rec_admin**: All requisitions
- **recruiter**: Where lead_recruiter_id = current user
- **hiring_manager**: Where hiring_manager_id = current user

### Candidates
- **admin, rec_admin, recruiter**: All candidates
- **hiring_manager**: Candidates with applications on their requisitions

### Applications
- **admin, rec_admin**: All applications
- **recruiter**: Where assigned_recruiter_id = current user
- **hiring_manager**: Where requisition's hiring_manager_id = current user

### Recruiter Notes
- **admin, rec_admin, recruiter**: Visible
- **hiring_manager**: NOT visible (by design)

### Interviews
- **Participants**: Interviewers, creator, assigned recruiter, hiring manager of the requisition

### Offers
- **admin, rec_admin**: All offers
- **recruiter**: Assigned application's recruiter
- **hr_reward**: All offers (for compensation review)

### Audit Logs
- **admin only**: Select and insert, no update/delete (immutable)

### Notifications
- **All users**: Own notifications only
