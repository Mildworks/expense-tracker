# Expense Tracker

A personal expense tracker built with the PERN stack (PostgreSQL, Express, React, Node.js). Users can register, log income and expenses, group them by category, set monthly budgets, and see their finances on a dashboard.

Note: the app interface is written in Indonesian (Bahasa Indonesia). The code and this README are in English.

## Features

- Register and login with JWT authentication
- Categories for income and expenses (add, edit, delete)
- Transactions with month filter (add, edit, delete)
- Monthly budget per expense category, with a progress bar that shows spent, remaining, or over budget
- Dashboard with yearly totals, a monthly income vs expense bar chart, and a per-category breakdown
- Responsive layout (sidebar on desktop, bottom navigation on mobile)

## Tech Stack

- Frontend: React (Vite), Tailwind CSS v4, React Router, Axios, Recharts
- Backend: Node.js, Express 5, pg (plain SQL, no ORM), bcrypt, JSON Web Token
- Database: PostgreSQL
- Language: JavaScript (no TypeScript)

## Project Structure

```
Expense Tracker App
├── backend
│   ├── db
│   │   └── schema.sql
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   └── routes
│   └── server.js
└── frontend
    └── src
        ├── api
        ├── components
        ├── context
        ├── hooks
        └── pages
```

## Getting Started

### Requirements

- Node.js
- PostgreSQL

### 1. Set up the database

Create a database named `expense_tracker`, then load the schema.

```bash
psql -U postgres -c "CREATE DATABASE expense_tracker;"
psql -U postgres -d expense_tracker -f backend/db/schema.sql
```

### 2. Run the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder.

```dotenv
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/expense_tracker
JWT_SECRET=your_secret_key
```

Start the server.

```bash
npm run dev
```

### 3. Run the frontend

Open a second terminal.

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown in the terminal.

## API Overview

All routes except register and login need a JWT in the `Authorization` header.

| Area | Endpoints |
| --- | --- |
| Auth | register, login, me |
| Categories | list, create, update, delete |
| Transactions | `GET /transactions?month=YYYY-MM&type=`, create, update, delete |
| Budgets | `GET /budgets?month=YYYY-MM`, create, update, delete |
| Reports | `GET /reports/monthly?year=YYYY`, `GET /reports/categories?month=YYYY-MM&type=` |

## Author

Gema Maghribi