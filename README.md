# 🏸 BCMS — Badminton Court Management System (Frontend)

> Modern React-based frontend for the Badminton Court Management System.

[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4)](https://tailwindcss.com/)

---

## ✨ Features

- **Responsive Dashboard** — Key metrics, revenue, and court occupancy.
- **Visual Court Schedule** — Grid-based timeline view for daily court bookings.
- **JWT Authentication** — Secure login and context-based protected routes.
- **Modern Tech Stack** — Vite + React 19 + Tailwind CSS 4.

---

## 🛠 Tech Stack

| Technology            | Description                               |
|-----------------------|-------------------------------------------|
| **React 19**          | UI Library                                |
| **Vite 6**            | Lightning fast build tool                 |
| **Tailwind CSS 4**    | Utility-first CSS framework               |
| **React Router v7**   | Client-side routing                       |
| **Axios**             | HTTP Client with JWT interceptors         |
| **Lucide React**      | Beautiful SVG icons                       |
| **Day.js**            | Date/time manipulation                    |
| **React Hot Toast**   | Notifications                             |

---

## 📁 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── api/                # Axios instance and API services
│   ├── components/
│   │   ├── common/         # ProtectedRoute, Reusable UI
│   │   └── layout/         # Sidebar, Header, MainLayout
│   ├── context/            # AuthContext
│   ├── hooks/              # useAuth custom hook
│   ├── pages/
│   │   ├── Auth/           # Login screen
│   │   ├── Bookings/       # Court Schedule Dashboard grid
│   │   ├── Dashboard/      # Analytics overview
│   │   └── NotFound/       # 404 page
│   ├── App.jsx             # Main router configuration
│   ├── index.css           # Tailwind base styles
│   └── main.jsx            # React entry point
├── .env.example            # Environment variables template
└── vite.config.js          # Vite + Tailwind plugin config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Backend API running locally (defaults to `http://localhost:5000/api/v1`)

### 1. Clone the repository
```bash
git clone https://github.com/nhatthaiuit/Badminton_Court_Management_FE.git
cd Badminton_Court_Management_FE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Ensure VITE_API_BASE_URL points to your backend
```

### 4. Start development server
```bash
npm run dev
```

Server starts at: `http://localhost:5173`

---

## 🔐 Default Credentials

To test the application locally, use the default admin account provided in the backend seed data:
- **Email**: `nhatthaiuit@gmail.com`
- **Password**: `Admin@123`
