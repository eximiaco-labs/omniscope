# Architectural Documentation

This directory consolidates all relevant documentation for the project, organized to facilitate understanding and tracking of architectural decisions, as well as the structure and main components. Each section addresses a specific aspect of the project, from critical design decisions to visual representations that support the architecture.

## Architecture Haiku

The `architecture-haiku` folder provides a concise overview of the project's architectural aspects, encapsulating the essence of the architecture in a brief and reflective manner.

## Architectural Decision Records (ADRs)

The `architectural-decision-records` folder documents the key architectural decisions made throughout the project, detailing the context, motivations, and consequences of each choice. The decisions are organized as follows:

| ADR Id      | Description                                                      | Status    |
|-------------|------------------------------------------------------------------|-----------|
| [`adr-001`](architectural-decision-records/adr-001-use-of-python-dash-and-plotly.md) | Details the decision to adopt Python, Dash, and Plotly in the project. | Approved  |
| [`adr-002`](architectural-decision-records/adr-002-use-of-pydantic-for-validation.md) | Justifies the use of Pydantic for data validation.                 | Approved  |
| [`adr-003`](architectural-decision-records/adr-003-use-of-bootstrap-for-frontend-development.md) | Explains the selection of Bootstrap for frontend development.      | Approved  |
| [`adr-004`](architectural-decision-records/adr-004-use-of-google-authentication.md) | Describes the decision to implement Google authentication.        | Approved  |

## Diagrams

The `diagrams` folder contains various visual representations, such as flowcharts and UML diagrams, which help to illustrate and understand the project’s structure and the interactions between its components.

---

Keeping this document updated is essential to ensure that all project stakeholders can track major decisions and the evolution of the architecture. It serves as a central reference for clear and efficient communication within the team.