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
- **Reusability**: Common functionality can be shared across different types of analytics views.
- **Consistency**: Using a common structure ensures consistency across different analytics components.
- **Maintainability**: The modular structure makes it easier to update and maintain the analytics components.
- **Flexibility**: The structure allows for easy addition of new analytics features and views.

### Negative:
- **Initial Complexity**: The abstraction level might make it slightly harder for new developers to understand the component structure.
- **Potential Over-engineering**: For simpler analytics views, this structure might be more complex than necessary.

## Implementation
- A set of reusable components was created for common analytics functionalities.
- Specific components like `MonthComparisonPanel`, `WeekComparisonPanel`, `WeekDayCards`, etc., were created for different aspects of analytics.
- Additional components like `TimelinessPanel` and `AllocationAnalysisTables` were created for specific analytics needs.
- The main analytics page (`week-review/page.tsx`) composes these components to create a comprehensive analytics view.
- State management for analytics is handled using React hooks and Apollo Client for GraphQL queries.
