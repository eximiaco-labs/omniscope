# ADR 013: Removal of Dash Frontend Support

**Status:** Approved

## Context
Initially, Omniscope was developed using Python + Dash + Plotly for the frontend (as described in ADR-001). However, with the migration to a React-based frontend (ADR-005) and subsequent adoption of Next.js (ADR-007), maintaining support for the Dash frontend became increasingly challenging and less beneficial.

## Decision
We have decided to completely remove support for the Dash-based frontend in Omniscope.

## Alternatives Considered
We considered maintaining both frontends in parallel or keeping the Dash frontend for specific features. However, the maintenance overhead and potential for inconsistencies outweighed the benefits.

## Consequences
### Positive:
- **Simplified Codebase**: Removing Dash support will streamline our codebase and reduce complexity.
- **Focused Development**: Our team can focus entirely on improving the React-based frontend.
- **Consistent User Experience**: All users will interact with the same, modern React-based interface.
- **Reduced Maintenance**: We no longer need to maintain two separate frontend codebases.

### Negative:
- **Migration Required**: Any remaining Dash-specific features will need to be reimplemented in React.
- **Learning Curve**: Users familiar with the old Dash interface may need time to adapt to the new React interface.

## Implementation
- Remove all Dash-related code from the codebase.
- Ensure all features previously available in the Dash frontend are implemented in the React frontend.
- Update documentation to reflect the removal of Dash support.
- Communicate the change to users and provide any necessary guidance for transitioning to the new interface.
