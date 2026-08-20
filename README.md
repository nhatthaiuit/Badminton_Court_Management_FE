# 🏸 Badminton Court Management System - Frontend SPA

![React](https://img.shields.io/badge/React-19.x-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/Vite-8.x-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.x-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-black?style=for-the-badge&logo=socket.io&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565.svg?style=for-the-badge&logo=lucide&logoColor=white)

A high-performance, real-time Badminton Court Booking and Facility Management Single Page Application (SPA). Built with React 19, Vite, Tailwind CSS, and Socket.io, featuring interactive drag-to-select scheduling grids, instant concurrency sync, and VietQR payment integration.

---

## 🌐 Live Application & Documentation

- **Live Web Application**: [https://badminton-court-management.vercel.app](https://badminton-court-management.vercel.app)
- **Backend API Docs (Swagger UI)**: [https://badminton-court-management-be.onrender.com/api-docs](https://badminton-court-management-be.onrender.com/api-docs)
- **Architecture & System Design**: [Notion Workspace](https://app.notion.com/p/Badminton-Court-Management-System-3849f49bca6d8032a1b6d16c2a71ce08?source=copy_link)

### 🔐 Demo Credentials (For Testing & Recruitment)

| Role | Phone Number / Account | Password |
| :--- | :--- | :--- |
| **Admin Portal** | `0388874855` | `123456` |
| **Customer** | Register via the Sign Up page | Custom |

---

## 🚀 Key Features & Highlights

- **Interactive Drag-to-Select Scheduling Grid**: Intuitive court timeline interface enabling users to select consecutive hourly time slots smoothly.
- **Real-Time Schedule Sync**: Powered by `socket.io-client`, any booking creation, status change, or cancellation instantly reflects across all connected user interfaces without page refreshes.
- **Automated Conflict & Overlap Prevention**: Client-side slot validation combined with real-time server locking prevents accidental double-bookings.
- **Integrated VietQR Dynamic Payment**: Generates dynamic VietQR codes with pre-filled transfer content and payment amounts for seamless bank transfers.
- **Role-Based Portals**:
  - **Customer Portal**: Court search, time slot reservation, booking history, and profile management.
  - **Staff / Admin Dashboard**: Court facility status controls, manual payment confirmations, maintenance scheduling, and daily revenue metrics.
- **Modern Responsive Design**: Fully responsive layout tailored for Desktop, Tablet, and Mobile views using Tailwind CSS.

---

## 🛠 Tech Stack & Dependencies

- **Framework**: React.js (v19)
- **Build Tool**: Vite (v8)
- **Styling**: Tailwind CSS (v4), PostCSS, Autoprefixer
- **Routing**: React Router DOM (v7)
- **Real-Time Communication**: `socket.io-client`
- **HTTP Client**: Axios with automatic JWT interceptors
- **Date & Time Formatting**: `dayjs`
- **UI Notifications**: `react-hot-toast`
- **Iconography**: `lucide-react`

---

## 💻 Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nhatthaiuit/Badminton_Court_Management_FE.git
   cd Badminton_Court_Management_FE
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Set your backend API and WebSocket endpoints:
   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   VITE_SOCKET_URL=http://localhost:5001
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📁 Project Structure

```
Badminton_Court_Management_FE/
├── src/
│   ├── api/             # Axios instance and centralized API requests
│   ├── assets/          # Static media and branding assets
│   ├── components/      # Reusable UI components (ScheduleGrid, Modals, Navbar, Layouts)
│   ├── context/         # React Context providers (AuthContext, SocketContext)
│   ├── hooks/           # Custom React hooks (useSocket, useAuth)
│   ├── pages/           # Application views (Auth, Booking, AdminDashboard, Profile)
│   ├── utils/           # Time slot helpers, currency formatters, VietQR generators
│   ├── App.jsx          # Route definitions & protected route wrappers
│   └── main.jsx         # App bootstrap & root DOM rendering
├── public/              # Static assets
├── .env.example         # Template environment variables
└── package.json
```

---

## 📄 License & Author

Developed by **Nhat Thai** for academic and recruitment portfolio showcase.  
Licensed under the [MIT License](LICENSE).
