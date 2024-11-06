# ADR 018: Date Handling Patterns

**Status:** Approved

## Context
Our application deals with various date-related operations, including formatting, calculations, and timezone handling. We needed to standardize our approach to date manipulation across the application.

## Decision
We have decided to use **date-fns** as our primary date manipulation library, with standardized patterns for common date operations.

### Standards
1. **Formatting**:
   - Use date-fns format strings for consistency
   - Locale-aware formatting through date-fns/locale
   - ISO strings for API communication

2. **Display Patterns**:
   - Long format: "September 15, 2023"
   - Short format: "Sep 15"
   - Time format: "13:45"
   - Relative format: "2 days ago"

3. **Timezone Handling**:
   - Store dates in UTC
   - Display in user's local timezone
   - Explicit timezone conversion when needed

## Alternatives Considered
- Moment.js (too heavy, maintenance mode)
- Luxon (good alternative but less community adoption)
- Native Date API only (insufficient features)

## Consequences
### Positive:
- **Consistency**: Standardized date handling across the application
- **Localization**: Better support for different locales
- **Bundle Size**: date-fns allows tree-shaking
- **Maintainability**: Clear patterns for date operations

### Negative:
- **Learning Curve**: Team needs to learn date-fns API
- **Migration**: Existing date handling code needs updating
- **Complexity**: Some timezone operations remain complex

## Implementation
- date-fns is the primary date manipulation library
- Custom hooks abstract common date operations
- Consistent format strings across the application
- Timezone handling is explicit and documented 