# IP MatchMaking Backend

This is the backend server for the IP MatchMaking application. 

## Important Architecture Note
This project has recently been fully migrated away from Prisma. It now uses the raw `pg` library to connect to PostgreSQL. **Do not run any `npx prisma` commands or expect a `prisma` folder/client to be present.**

---

## 🐳 Running with Docker
The easiest way to run this backend along with the database and frontend is from the **root directory** using Docker Compose:
```bash
cd ..
docker-compose up --build -d
```
The backend will be available at `http://localhost:5000`.

*(Note: If using Docker but connecting to a Neon/Cloud DB, ensure you edit `docker-compose.yml` to remove the `db` service and update the `DATABASE_URL` before running).*

---

## 💻 Running Locally (Separate from Frontend)

### 1. Environment Variables
Ensure you have a `.env` file (you can copy `.env.example`) and configure your database connection string.
```bash
cp .env.example .env
```
Update the `DATABASE_URL` in `.env` based on your setup:
- **Neon / Cloud DB:** `DATABASE_URL=postgresql://user:password@ep-xxx...neon.tech/dbname?sslmode=require`
- **Local DB:** `DATABASE_URL=postgresql://postgres:password@localhost:5432/ip_matchmaking`

### 2. Database Initialization
Because Prisma is removed, you must initialize the database schema manually using the provided `schema.sql` file. 

- **If using Neon:** Paste the contents of `schema.sql` into the Neon SQL Editor online, OR run this command in your terminal:
  ```bash
  psql "your_neon_connection_string" -f schema.sql
  ```
- **If using a Local DB:** Run this command in your terminal:
  ```bash
  psql -U postgres -d ip_matchmaking -f schema.sql
  ```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
To start the server in development mode (with auto-restart):
```bash
npm run dev
```

To build and start the server in production mode:
```bash
npm run build
npm start
```
