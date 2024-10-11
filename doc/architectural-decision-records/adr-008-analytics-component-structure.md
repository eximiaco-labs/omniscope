# ADR 008: Analytics Component Structure

**Status:** Approved

## Context
With the migration to React and the implementation of various analytics features, we needed a consistent and scalable approach to structuring our analytics components.

## Decision
We decided to implement a modular component structure for analytics, with reusable base components and specific implementations for different types of analytics views.

## Alternatives Considered
We considered having a single, large analytics component or implementing each analytics view as a completely separate component. However, these approaches would have led to code duplication and reduced maintainability.

## Consequences
### Positive:
- **Reusability**: The base `By` component can be reused across different types of analytics views.
- **Consistency**: Using a common structure ensures consistency across different analytics components.
- **Maintainability**: The modular structure makes it easier to update and maintain the analytics components.

### Negative:
- **Initial Complexity**: The abstraction level might make it slightly harder for new developers to understand the component structure.
- **Potential Over-engineering**: For simpler analytics views, this structure might be more complex than necessary.

## Implementation
- A base `By` component was created to handle common functionality across different analytics views.
- Specific components like `ByAccountManager`, `ByClient`, `BySponsor`, etc., were created extending the base `By` component.
- Each specific component can customize its behavior and appearance while leveraging the common structure.
- Additional components like `TotalWorkingHours` and `ByWorkingDay` were created for specific analytics needs.