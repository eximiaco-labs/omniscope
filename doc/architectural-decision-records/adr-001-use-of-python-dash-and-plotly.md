# ADR 001: Use of Python + Dash + Plotly in Omniscope

**Status:** Approved

## Context
Omniscope is a data analysis and dashboard composition tool used to facilitate visual business management at EximiaCo. For the development of this tool, we need a technology stack that allows the creation of rich data visualization interfaces, with efficient processing capabilities and easy integration with other parts of the system.

## Decision
We have chosen to use the combination of **Python + Dash + Plotly** for the development of Omniscope. This stack was selected for its advanced data visualization capabilities and ease of use, which streamline the development process and are well-suited to the objectives of Omniscope.

## Alternatives Considered
Before deciding on Python + Dash + Plotly, we considered using **.NET**. Although .NET offers some data analysis features, these are less widespread and seem less practical for Omniscope's specific use cases. The active community and the wide range of libraries available for Python also influenced the decision.

## Consequences
### Positive:
- **Efficiency and Productivity**: The chosen stack facilitates the creation of complex interfaces and visualizations, improving the team's productivity.
- **Advanced Resources**: Python, Dash, and Plotly are widely used in the data science community, ensuring access to a large pool of resources and support.
  
### Negative:
- **Stack Maintenance**: Maintaining a team specialized in this stack will be necessary, which may present challenges in terms of hiring and training.
- **Learning Curve**: Team members unfamiliar with Python or Dash may face an initial learning curve.
