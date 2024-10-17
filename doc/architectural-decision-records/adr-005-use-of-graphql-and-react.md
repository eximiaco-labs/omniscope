# ADR 005: Adoption of GraphQL and React for Omniscope

**Status:** Approved

## Context
After the initial implementation of Omniscope using Python + Dash + Plotly, we identified the need for a more flexible and scalable architecture that could better handle the growing demands for data and interactivity in the application.

## Decision
We decided to migrate Omniscope's architecture to use **GraphQL** on the backend and **React** on the frontend. This decision was made to improve efficiency in data retrieval, provide a richer user experience, and facilitate the development of new features.

## Alternatives Considered
We considered maintaining the original architecture with Python + Dash + Plotly, but concluded that it would limit our ability to scale and add new functionalities efficiently.

## Consequences
### Positive:
- **Data Flexibility**: GraphQL allows the client to request exactly the data needed, reducing over-fetching and under-fetching.
- **Better User Experience**: React provides a solid foundation for creating interactive and responsive user interfaces.
- **Scalability**: The new architecture facilitates the addition of new features and maintenance of existing code.
- **Component Reusability**: React's component-based architecture allows for better code organization and reuse.

### Negative:
- **Learning Curve**: The team will need to familiarize themselves with GraphQL and React, which may take some time.
- **Initial Complexity**: The initial setup of a GraphQL + React architecture can be more complex than the previous solution.

## Implementation
- The backend was implemented using Python with a GraphQL server (using Ariadne, as seen in the code).
- The frontend was migrated to React, specifically using Next.js as the React framework.
- GraphQL resolvers were created to handle various domain entities, such as accountManagers, clients, sponsors, etc.
- The frontend uses Apollo Client to interact with the GraphQL API, providing efficient data fetching and caching capabilities.
