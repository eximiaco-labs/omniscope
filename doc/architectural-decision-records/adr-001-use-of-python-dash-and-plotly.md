# ADR 001: Use of Python + Dash + Plotly in Omniscope

**Status:** Obsolete

## Context
Omniscope is a data analysis and dashboard composition tool used to facilitate visual business management at EximiaCo. For the development of this tool, we needed a technological stack that would allow the creation of rich data visualization interfaces, with efficient processing capabilities and easy integration with other parts of the system.

## Decision
Initially, we chose to use the combination of **Python + Dash + Plotly** for the development of Omniscope. This stack was selected for its advanced data visualization capabilities and ease of use, which would streamline the development process and be suitable for Omniscope's objectives.

## Alternatives Considered
Before deciding on Python + Dash + Plotly, we considered using **.NET**. Although .NET offers some data analysis features, these are less widespread and seemed less practical for Omniscope's specific use cases. The active community and wide range of libraries available for Python also influenced the decision.

## Consequences
### Positive:
- **Efficiency and Productivity**: The chosen stack would facilitate the creation of complex interfaces and visualizations, improving team productivity.
- **Advanced Features**: Python, Dash, and Plotly are widely used in the data science community, ensuring access to a large pool of resources and support.
  
### Negative:
- **Stack Maintenance**: It would be necessary to maintain a team specialized in this stack, which could present challenges in terms of hiring and training.
- **Learning Curve**: Team members unfamiliar with Python or Dash might face an initial learning curve.

## Update
This decision has been superseded by ADR 005, which details the change to a GraphQL-based architecture with a React frontend.
