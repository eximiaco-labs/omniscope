# Contributing to Omniscope

Thank you for considering contributing to Omniscope! This document provides guidelines and instructions to help you get started with your contributions.

## Project Overview

Omniscope is a visual management tool developed by EximiaCo that integrates data from various tools used within the company, such as PipeDrive, Everhour, Ontology, and more. The user interface and codebase are both in English.

## Project Structure

The project is divided into two main parts:

1. Backend: A Python-based GraphQL API
2. Frontend: A Next.js application

## Prerequisites

To contribute to Omniscope, you will need:

- Python 3.12.2
- Node.js (latest LTS version)
- npm or yarn

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

3. **Backend Setup:**
   - Create a Python virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows use `venv\Scripts\activate`
     ```
   - Install the required dependencies:
     ```bash
     pip install -r backend/requirements.txt
     ```
   - Set up environment variables:
     - Copy `backend/.env.template` to `backend/.env`
     - Fill in the necessary values in `backend/.env`

4. **Frontend Setup:**
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     # or
     yarn install
     ```
   - Set up environment variables:
     - Copy `.env.local.example` to `.env.local`
     - Fill in the necessary values in `.env.local`

## Running the Application

1. **Backend:**
   - From the root directory:
     ```bash
     python backend/app.py
     ```

2. **Frontend:**
   - From the frontend directory:
     ```bash
     npm run dev
     # or
     yarn dev
     ```

## Contributing with Code

We use a **Feature Branch** workflow. Here's the recommended process:

1. **Ensure an Issue Exists:**
   - Before starting any implementation, make sure there is an Issue that clearly describes what needs to be done.

2. **Sync Your Fork:**
   - Before starting on a new feature or fix, sync your fork with the upstream repository.

3. **Create a Feature Branch:**
   - Create a new branch for your feature or bugfix.

4. **Make Changes:**
   - Implement your changes in the codebase.

5. **Commit Your Changes:**
   - Commit your changes with a clear and concise message in English.

6. **Push Your Feature Branch:**
   - Push your feature branch to your forked repository on GitHub.

7. **Create a Pull Request:**
   - Create a pull request (PR) from your feature branch to the main branch of the upstream repository.

8. **Code Review:**
   - One of the maintainers will review your PR.

## Code Standards

- **Backend:** Follow PEP8 style guide for Python code.
- **Frontend:** Follow the existing code style and structure in the Next.js application.

## Testing

- Backend: Currently, the project does not have unit tests in place, but they will be added soon.
- Frontend: Run tests using `npm test` or `yarn test`.

## Documentation

- Keep the README.md and other documentation files up to date.
- Document any significant changes or new features in the relevant architectural decision records (ADRs) in the `doc/architectural-decision-records` directory.

## Code of Conduct

Please treat all contributors with respect. We aim to maintain a positive and collaborative environment.

## Communication

- **GitHub Issues:** For project-related discussions, please use GitHub Issues.
- **Email:** Maintainers can also be contacted via email for more specific inquiries.
