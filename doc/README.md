# Architectural Documentation

This directory consolidates all relevant documentation for the project, organized to facilitate understanding and tracking of architectural decisions, as well as the structure and main components. Each section addresses a specific aspect of the project, from critical design decisions to visual representations that support the architecture.

## Architecture Haiku

The `architecture-haiku` folder provides a concise overview of the project's architectural aspects, encapsulating the essence of the architecture in a brief and reflective manner.

## Architectural Decision Records (ADRs)

The `architectural-decision-records` folder documents the key architectural decisions made throughout the project, detailing the context, motivations, and consequences of each choice. The decisions are organized as follows:

| ADR Id      | Description                                                      | Status    |
|-------------|------------------------------------------------------------------|-----------|
| [`adr-001`](architectural-decision-records/adr-001-use-of-python-dash-and-plotly.md) | Details the initial decision to adopt Python, Dash, and Plotly in the project. | Obsolete  |
| [`adr-002`](architectural-decision-records/adr-002-use-of-pydantic-for-validation.md) | Justifies the use of Pydantic for API contract validation.          | Approved  |
| [`adr-003`](architectural-decision-records/adr-003-use-of-bootstrap-for-frontend-development.md) | Explains the initial selection of Bootstrap for frontend development. | Obsolete  |
| [`adr-004`](architectural-decision-records/adr-004-use-of-google-authentication.md) | Describes the decision to implement Google authentication.        | Approved  |
| [`adr-005`](architectural-decision-records/adr-005-use-of-graphql-and-react.md) | Details the migration to GraphQL and React for improved scalability. | Approved  |
| [`adr-006`](architectural-decision-records/adr-006-use-of-pydantic-for-data-validation.md) | Explains the adoption of Pydantic for data validation in the backend. | Approved  |
| [`adr-007`](architectural-decision-records/adr-007-use-of-next-js-for-frontend.md) | Describes the decision to use Next.js for frontend development.   | Approved  |
| [`adr-008`](architectural-decision-records/adr-008-analytics-component-structure.md) | Details the structure for analytics components in React.          | Approved  |
| [`adr-009`](architectural-decision-records/adr-009-ui-component-library.md) | Explains the approach to building UI components with custom components, Tailwind CSS, and Framer Motion. | Obsolete  |
| [`adr-010`](architectural-decision-records/adr-010-state-management-strategy.md) | Describes the state management strategy using React hooks and Apollo Client. | Approved  |
| [`adr-011`](architectural-decision-records/adr-011-adoption-of-typescript.md) | Details the decision to adopt TypeScript for frontend development. | Approved  |
| [`adr-012`](architectural-decision-records/adr-012-adoption-of-catalyst-framework.md) | Describes the adoption of Catalyst as the main UI development framework. | Approved  |
| [`adr-013`](architectural-decision-records/adr-013-removal-of-dash-frontend-support.md) | Details the decision to remove support for the Dash-based frontend. | Approved  |

## Diagrams

The `diagrams` folder contains various visual representations, such as flowcharts and UML diagrams, which help to illustrate and understand the project's structure and the interactions between its components.

---

Keeping this document updated is essential to ensure that all project stakeholders can track major decisions and the evolution of the architecture. It serves as a central reference for clear and efficient communication within the team.
