# IP MatchMaking Frontend

This is the frontend for the IP MatchMaking application, built using React, TypeScript, Vite, and TailwindCSS.

---

## 🐳 Running with Docker
The easiest way to run this frontend along with the backend and database is from the **root directory** using Docker Compose:
```bash
cd ..
docker-compose up --build -d
```
The frontend will be served by Nginx and accessible at `http://localhost`.

---

## 💻 Running Locally (Separate from Backend)

If you are running the backend separately on your local machine, you can run the frontend in development mode using Vite.

### 1. Environment Variables
If your backend is running on a different port than the default, make sure to configure it in a `.env` file. By default, Vite proxies requests or expects the backend on `localhost:5000`.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Vite will start a local development server and output a local URL (e.g., `http://localhost:5173`). Open this URL in your browser to view the app.

### 4. Build for Production
To build the application into static files (which can be served via Nginx, Apache, or other hosting platforms):
```bash
npm run build
```
The output will be generated in the `dist/` directory. You can preview the production build using:
```bash
npm run preview
```
