# IP MatchMaking

This repository contains the source code for the IP MatchMaking application, featuring a React frontend and a Node.js/Express backend.

## Folder Structure
- `/frontend`: React application built with Vite, TypeScript, and TailwindCSS.
- `/backend`: Node.js API server using Express and raw PostgreSQL (no Prisma).
- `docker-compose.yml`: Docker configuration to run the entire stack together.

---

## 🐳 How to Run using Docker (Recommended)

The easiest way to run the entire application (Frontend + Backend + PostgreSQL Database) is using Docker Desktop.

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and ensure it is running.

### Steps
1. Open a terminal in this root directory.
2. Build and start the containers in the background:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   - **Frontend:** http://localhost
   - **Backend API:** http://localhost:5000
   - **Database:** Runs internally on port `5432` (Auto-initialized with `backend/schema.sql`).
4. To stop the application:
   ```bash
   docker-compose down
   ```

*(Note: If you want to use a **Neon** or Cloud database with Docker, edit `docker-compose.yml` to remove the `db` service and update the `DATABASE_URL` environment variable under `backend` to match your Neon URL).*

---

## 💻 How to Run Separately (Without Docker)

If you prefer to run the application locally without Docker, you can run the frontend and backend separately in your terminal. 

### 1. Database Setup
You can use either a local database or a cloud database like **Neon**:

- **Option A: Using Neon (Cloud PostgreSQL)**
  1. Create a project on [Neon.tech](https://neon.tech) and copy your Connection String (e.g., `postgresql://user:password@ep-withered-leaf.region.aws.neon.tech/dbname?sslmode=require`).
  2. Run the `backend/schema.sql` file against your Neon database to initialize the tables. You can do this by pasting the schema into Neon's built-in SQL Editor, or by using `psql`:
     ```bash
     psql "your_neon_connection_string" -f backend/schema.sql
     ```

- **Option B: Using Local PostgreSQL**
  1. Install PostgreSQL and create a local database named `ipcos`.
  2. Run the `backend/schema.sql` file against your local database:
     ```bash
     psql -U postgres -d ipcos -f backend/schema.sql
     ```

### 3. Database Seeding (Optional)
To populate the database with mock records (1,000+ patents, reports, match results, messages, royalties, and audit logs) for testing:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the seeding command:
   ```bash
   npm run seed
   ```

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and update your `DATABASE_URL`.
   - **For Neon:** `DATABASE_URL=postgresql://user:password@...neon.tech/dbname?sslmode=require`
   - **For Local:** `DATABASE_URL=postgresql://postgres:password@localhost:5432/ipcos`
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` URL in your browser (usually http://localhost:5173).
