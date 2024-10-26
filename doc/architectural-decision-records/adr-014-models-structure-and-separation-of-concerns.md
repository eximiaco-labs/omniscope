# ADR 014: Models Structure and Separation of Concerns

**Status:** Approved

## Context
As our application grew in complexity, we needed a clear structure for our models and a well-defined separation of concerns between the data processing and API layers. This was necessary to improve maintainability, scalability, and testability of our codebase.

## Decision
We have decided to implement a layered architecture for our models and enforce a strict separation of concerns between the models and API layers.

### Models Structure
We have organized our models into the following layers:

1. **Syntactic Layer**: Handles raw data structures and basic data manipulation.
2. **Semantic Layer**: Provides meaning and context to the syntactic data, implementing business logic.
3. **Domain Layer**: Represents core business entities and their relationships.
4. **Datasets Layer**: Manages collections of data and provides methods for data access and manipulation.
5. **Analytics Layer**: Implements complex calculations and data analysis.

### Separation of Concerns
We have decided to move all data processing and computations from the API layer to the appropriate model layers. The API layer should only be responsible for:

1. Receiving requests
2. Calling appropriate methods in the model layers
3. Formatting and returning responses

## Alternatives Considered
We considered keeping computations in the API layer for faster development, but this approach would lead to less maintainable and harder to test code in the long run.

## Consequences
### Positive:
- **Improved Maintainability**: Clear separation of concerns makes the codebase easier to understand and maintain.
- **Better Testability**: Business logic in model layers is easier to unit test.
- **Enhanced Scalability**: The layered approach allows for easier refactoring and extension of functionality.
- **Cleaner API Layer**: The API layer becomes more focused on its core responsibilities.

### Negative:
- **Initial Development Overhead**: Implementing this structure requires more upfront planning and development time.
- **Potential for Over-engineering**: Care must be taken not to create unnecessary abstractions.

## Implementation
- Refactor existing code to fit into the new layered model structure.
- Move all computations and data processing from API resolvers to appropriate model layers.
- Update API resolvers to only call methods from model layers and format responses.
- Create clear interfaces between layers to ensure proper separation of concerns.
- Document the purpose and responsibilities of each layer for future development reference.
