# ADR 004: Adoption of Google Authentication for Users
**Status:** Approved

## Context
EximiaCo uses Google Suite as its primary platform for various business operations. To streamline the management of user authentication, the decision was made to leverage Google’s authentication services. This approach reduces the overhead associated with user management by delegating authentication responsibilities to the Google platform.

## Decision
We have decided to adopt **Google Authentication** for managing user access to our systems. This decision was driven by the integration of Google Suite within EximiaCo, allowing for a more efficient and centralized management of user credentials.

## Alternatives Considered
Before moving to Google Authentication, we used **Cognito** for a more simplified user management experience. However, we encountered difficulties in efficiently integrating Cognito with our Dash/Flask workflow, which led us to consider Google Authentication as a better fit for our needs.

## Consequences
### Positive:
- **Efficient Authentication Control**: By using Google Authentication, we benefit from robust and well-supported authentication mechanisms, reducing the administrative burden and enhancing security.
- **Seamless Integration with Google Suite**: The adoption aligns with our existing use of Google Suite, creating a more cohesive environment for both users and administrators.

### Negative:
- **Lack of Authorization Mechanisms**: While Google Authentication provides strong authentication capabilities, we currently lack mechanisms for managing user authorization within our system, which will need to be addressed separately.