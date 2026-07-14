# IP Commercialization OS (IP-COS)

IP Commercialization OS is a full-stack platform designed to match patents and intellectual property (IP) from inventors and universities with startup or enterprise buyers using intelligent analysis and matchmaking.

This repository is fully containerized using **Docker** and **Docker Compose**, allowing developers to spin up the entire application—including the React/Vite frontend, Node.js/Express backend, and PostgreSQL database—with a single command.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **Backend:** Node.js, Express, TypeScript, Prisma (ORM)
*   **Database:** PostgreSQL
*   **Containerization:** Docker, Docker Compose, Nginx (for production)

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed on your machine:

1.  **Docker Desktop**: Install Docker Desktop for your OS:
    *   [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) (ensure WSL2 is enabled)
    *   [Docker Desktop for Mac / Linux](https://www.docker.com/products/docker-desktop/)
2.  **Git**: For cloning the repository and making pull requests.

*Note: You do not need Node.js, npm, or PostgreSQL installed locally on your host machine to run this app, as all of these run inside Docker containers!*

---

## 🚀 Setup & Installation

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd IP_MatchMaking
```

### 2. Configure Environment Variables
Copy the template environment configuration file to create your local `.env` file:
*   **On Windows (PowerShell):**
    ```powershell
    Copy-Item .env.example .env
    ```
*   **On macOS / Linux (Terminal):**
    ```bash
    cp .env.example .env
    ```

Open the newly created `.env` file in your editor and configure the variables (or keep the defaults for local testing).

---

## 🔑 Environment Variables

The application is configured using variables in the root `.env` file. Important variables include:

| Environment Variable | Description | Default Value |
| :--- | :--- | :--- |
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL database password | `password` |
| `POSTGRES_DB` | Initial PostgreSQL database name | `ipcos` |
| `POSTGRES_PORT` | Local host port mapped to PostgreSQL | `5432` |
| `BACKEND_PORT` | Port the Express API runs on | `4000` |
| `DATABASE_URL` | Prisma database connection URL | `postgresql://postgres:password@db:5432/ipcos?schema=public` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | *A generic development key* |
| `FRONTEND_PORT` | Port the Vite frontend runs on | `5173` |
| `VITE_API_URL` | API endpoint the frontend requests | `http://localhost:4000` |
| `GEMINI_API_KEY` | (Optional) Gemini API Key for AI report generation | *Empty (falls back to mock data)* |

---

## 🐳 Docker Commands

Here are the essential commands for running, stopping, and managing the application:

### 1. Run the Entire Stack
Builds the images (if running for the first time) and starts all services in the foreground:
```bash
docker compose up --build
```
Once started, the backend container will automatically:
1.  Verify the database is healthy.
2.  Push the Prisma schema to synchronize tables (`npx prisma db push`).
3.  Seed the database with pre-configured demo users and patents (`npm run db:seed`).

### 2. Run in Detached Mode (Background)
To run the containers in the background so you can keep using your terminal:
```bash
docker compose up -d --build
```

### 3. Stop the Application
To stop the running containers without deleting any data:
```bash
docker compose down
```

### 4. Stop and Delete Volumes
To stop the containers and completely wipe the PostgreSQL database (data volumes):
```bash
docker compose down -v
```

### 5. View Logs
View logs for all services, or filter by a specific service:
```bash
# View all logs
docker compose logs -f

# View only backend logs
docker compose logs -f backend

# View only frontend logs
docker compose logs -f frontend
```

### 6. Manually Re-Seed the Database
If you want to clear out modifications and reset the database back to its initial mock state:
```bash
docker compose exec backend npm run db:seed
```

---

## 🌍 Accessing the Application

Once the containers are running, you can access the application through the following URLs:

*   **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
*   **Backend REST API:** [http://localhost:4000/api](http://localhost:4000/api)
*   **PostgreSQL DB Connection:** `localhost:5432` (Connect using any GUI client like pgAdmin, DBeaver, or TablePlus using the credentials in your `.env` file)

### 👥 Test Accounts (Seeded)
Use the following credentials to sign in and test different user workflows (Password: `password123` for all accounts):
*   **Admin:** `admin@ipcos.in`
*   **Inventor:** `inventor@demo.com`
*   **University Transfer:** `university@demo.com`
*   **Startup CEO:** `startup@demo.com`
*   **Enterprise Rep:** `enterprise@demo.com`
*   **IP Broker:** `broker@demo.com`

---

## 🔍 Troubleshooting

### 1. Error: `failed to connect to the docker API`
*   **Cause:** Docker Desktop is not running or not installed.
*   **Solution:** Open Docker Desktop from your Start menu / Applications folder and wait for the status in the bottom-left corner to turn green ("Engine running").

### 2. Error: `Port 4000 or 5173 is already in use`
*   **Cause:** You have another process (like a local node server) running on that port.
*   **Solution:** Either kill the process on the host machine, or change `BACKEND_PORT` or `FRONTEND_PORT` inside your root `.env` file, then run `docker compose up --build` again.

### 3. Database is out of sync or seed data is missing
*   **Solution:** Run the sync and seed command directly inside the running container:
    ```bash
    docker compose exec backend sh -c "npx prisma db push && npm run db:seed"
    ```
