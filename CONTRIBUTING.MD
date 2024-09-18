
# Contributing to Omniscope

Thank you for considering contributing to Omniscope! This document provides guidelines and instructions to help you get started with your contributions.

## Project Overview

Omniscope is a visual management tool developed by EximiaCo that integrates data from various tools used within the company, such as PipeDrive, Everhour, Ontology, and more. The user interface and codebase are both in English.

## Prerequisites

To contribute to Omniscope, you will need:

- Python 3.12.2
- Dash

Docker is not required for development but is used in the deployment process.

## Installation and Setup

1. **Fork the Repository:**
- Navigate to the [Omniscope GitHub repository](https://github.com/your-repo/omniscope).
- Click the "Fork" button at the top right to create your own copy of the repository.

2. **Clone Your Forked Repository:**
- Clone your forked repository to your local machine.

```bash
git clone https://github.com/your-username/omniscope.git
cd omniscope
```

3. **Create a Python Environment:**
It’s recommended to create a virtual environment using Conda to manage your dependencies.

```bash
conda create --name omniscope-env python=3.12.2
conda activate omniscope-env
```

4. **Install Dependencies:**
Install the required dependencies from the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

5. **Environment Variables:**

The project uses various keys and tokens that are loaded from environment variables. These variables should be initialized in a `.env` file. If you are a part of EximiaCo, request a copy of this file from a maintainer.

For external contributors, please note that currently, we do not provide access to the necessary keys. You would need to obtain your own access to a testing and development environment.

**Note:** Most of the ontology data does not require special keys.

## Contributing with Code

We use a **Feature Branch** workflow to keep development organized and to minimize conflicts. Here’s the recommended process:

1. **Ensure an Issue Exists:**
- Before starting any implementation, make sure there is an Issue that clearly describes what needs to be done. If no Issue exists, create one and align with the project maintainers to ensure it is assigned to you. This prevents duplicate efforts and ensures everyone is on the same page.


2. **Sync Your Fork:**
- Before starting on a new feature or fix, sync your fork with the upstream repository to get the latest changes.

```bash
git checkout main
git pull upstream main
```

2. **Create a Feature Branch:**
- Create a new branch for your feature or bugfix. Use a descriptive name for your branch.

```bash
git checkout -b feature/your-feature-name
```

4. **Make Changes:**
- Implement your changes in the codebase. Ensure that your code follows the [Code Standards](#code-standards) described below.

5. **Commit Your Changes:**
- Commit your changes with a clear and concise message in English.

```bash
git add .
git commit -m "Add feature: description of feature"
```

6. **Push Your Feature Branch:**
- Push your feature branch to your forked repository on GitHub.

```bash
git push origin feature/your-feature-name
```

7. **Create a Pull Request:**
- Go to your forked repository on GitHub and create a pull request (PR) from your feature branch to the main branch of the upstream repository.
- Ensure that your PR is linked to an existing Issue, or create a new Issue if necessary.

8. **Code Review:**
- One of the maintainers will review your PR. You may be asked to make additional changes before your PR is merged.

9. **Merge and Cleanup:**
- Once your PR is approved and merged, you can delete your feature branch locally and remotely.

```bash
git checkout main
git pull upstream main
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Code Standards

- **Code Style:** We follow the PEP8 style guide for Python code. Please ensure your contributions adhere to this standard.
- **Project Structure:** The codebase is organized with models in the `model` directory and UI components in the `UI` directory. Follow the existing structure as a reference.

## Commit Messages

Commit messages should be clear, concise, and always written in English. This ensures that the history of changes is understandable for all contributors.

## Submitting Pull Requests

1. **Issue First:** All Pull Requests (PRs) should be related to an existing Issue. If there isn’t an Issue for your contribution, please create one.
2. **PR Review:** All PRs will be reviewed by one of the project maintainers before being merged. You may be asked to make adjustments before final approval.

## Testing

Currently, the project does not have unit tests in place, but they will be added soon. Stay tuned for updates.

## Documentation

Documentation is primarily maintained by the project maintainers. However, you should document any significant changes in the relevant Issue.

## Code of Conduct

Please treat all contributors with respect. We aim to maintain a positive and collaborative environment.

## Communication

- **GitHub Issues:** For project-related discussions, please use GitHub Issues.
- **Email:** Maintainers can also be contacted via email for more specific inquiries.
