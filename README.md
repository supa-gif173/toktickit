# TokTickIT IT Service Desk

Welcome to the **TokTickIT IT Service Desk** repository! This project is developed as part of the **CPE334 Lab 1** assignment. 

TokTickIT is a comprehensive, full-stack IT service management solution designed to streamline the process of submitting, tracking, and resolving IT support tickets. The system features a robust frontend for user interactions, a secure backend API for data processing, and a relational database for reliable storage. It provides a seamless experience for both regular users needing support and IT staff managing the queue.

---

## Lab 1 Constraints & Technology Stack

The project adheres to the specific constraints and requirements defined in the Lab 1 assignment.

| Component      | Technology / Framework                          |
| -------------- | ----------------------------------------------- |
| **Frontend**   | React, TypeScript, Vite, Bootstrap              |
| **Backend**    | Node.js, Express, TypeScript                    |
| **Database**   | PostgreSQL, Prisma (ORM)                        |
| **Architecture**| REST-style APIs                                 |
| **Tests**      | Vitest (Frontend UI), Supertest (Backend API)   |

---

## Git Workflow

We follow a structured Git workflow to ensure code quality and seamless integration:

1. **`main` Branch**: Contains the stable, production-ready code. Commits are not made directly to `main`.
2. **`lab1-staging` Branch**: The primary integration branch for the Lab 1 release. All features are merged here for final testing before merging to `main`.
3. **Feature Branches**: Developers create individual branches (e.g., `feature/login-ui`, `fix/api-validation`) branching off from `lab1-staging`.
4. **Pull Requests (PRs)**: Once a feature is complete, a PR is opened against `lab1-staging`. Code must be peer-reviewed before it can be merged.

---

## Prerequisites

Ensure you have the following installed on your local development machine before proceeding:

- **Node.js** (v18.0.0 or higher recommended)
- **PostgreSQL** (v14.0 or higher recommended)
- **Git**

---

## Step-by-Step Environment Setup

Before running the application, you must configure your local environment variables.

1. Navigate to the `server` directory.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Open the newly created `.env` file and configure your database connection string and any other required secrets:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/toktickit_db?schema=public"
   PORT=5000
   ```

---

## Backend Setup

Follow these commands to initialize and run the Node.js/Express backend API:

```bash
cd server
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

The backend server will start (typically on `http://localhost:5000`).

---

## Frontend Setup

Follow these commands to initialize and run the React/Vite frontend application:

```bash
cd client
npm install
npm run dev
```

The frontend development server will start (typically on `http://localhost:5173`).

---

## Running Tests

Automated testing is a crucial part of this project, ensuring reliability across both the frontend and backend.

### Frontend UI Tests (Vitest)
Navigate to the `client` directory and execute:
```bash
cd client
npm run test
```

### Backend API Tests (Supertest)
Navigate to the `server` directory and execute:
```bash
cd server
npm run test
```

---

## Repository Directory Structure

```text
toktickit/
|-- client/                 # Frontend React Application
|   |-- src/                # UI Source Code (Components, Pages, Assets)
|   |-- tests/              # Vitest UI Test Specs
|   |-- index.html          # Vite HTML Entry Point
|   |-- package.json        # Frontend Dependencies
|   |-- vite.config.ts      # Vite Configuration
|-- server/                 # Backend Express Application
|   |-- src/                # API Source Code (Controllers, Routes, Services)
|   |-- prisma/             # Prisma Schema and Migrations
|   |   |-- schema.prisma   # Database Schema
|   |   |-- seed.ts         # Database Seeding Script
|   |-- tests/              # Supertest API Test Specs
|   |-- .env.example        # Example Environment Variables
|   |-- package.json        # Backend Dependencies
|   |-- tsconfig.json       # TypeScript Configuration
|-- docs/                   # Project Documentation
|   |-- lab-01/             # Lab Documentation (AI Use, Tests, Reviewer)
|-- .gitignore              # Ignored Files and Directories
|-- README.md               # Project Entry Documentation
```

---

## Important Security Notes

> [!CAUTION]
> **Never commit sensitive information to the repository.**
> 
> - **`.env` files**: Do NOT commit `.env` files. They contain sensitive credentials (like database passwords and API keys). Ensure `.env` is listed in your `.gitignore`.
> - **`node_modules`**: Do NOT commit the `node_modules` directory. This folder is excessively large and dependencies should be installed locally via `npm install`.

---
*TokTickIT - Streamlining IT Support for the Modern Enterprise.*