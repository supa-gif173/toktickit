# TokTickIT

TokTickIT is an IT service desk application developed for CPE334 Lab 1.

## Technology Stack
* Frontend: React, TypeScript, Vite, Bootstrap
* Backend: Node.js, Express, TypeScript
* Database: PostgreSQL
* ORM: Prisma
* Testing: Vitest and Supertest

## Prerequisites
Install:
* Node.js and npm
* PostgreSQL

## Environment Setup
Create your local PostgreSQL database and configure the connection in:
`server/.env`
Use `server/.env.example` as the template. Do not commit the real `.env` file.

## Backend Setup
bash
cd server
npm install
npm run dev

The backend runs at: `http://localhost:3000`

## Frontend Setup
Open another terminal:
bash
cd client
npm install
npm run dev

The frontend runs at: `http://localhost:5173`

## Important
Do not commit:
* `.env`
* `node_modules`