# IP MatchMaking Backend

This is the backend server for the IP MatchMaking application. 

## Important Architecture Note
This project has recently been fully migrated away from Prisma. It now uses the raw `pg` library to connect to PostgreSQL. **Do not run any `npx prisma` commands or expect `prisma` folder/client to be present.**

## Setup Instructions

1. **Environment Variables**:
   Ensure you have a `.env` file (you can copy `.env.example`) and configure your database connection string.
   ```bash
   cp .env.example .env
   ```
   Make sure `DATABASE_URL` is set correctly in `.env` (e.g., `postgresql://postgres:password@localhost:5432/ip_matchmaking`).

2. **Database Initialization**:
   Because Prisma is removed, you must initialize the database schema manually using the provided `schema.sql` file.
   You can run this directly in your database client (e.g. pgAdmin, DBeaver) or via the `psql` command-line tool:
   ```bash
   psql -U postgres -d ip_matchmaking -f schema.sql
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Running Locally**:
   To start the server in development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   To build and start the server in production mode:
   ```bash
   npm run build
   npm start
   ```
