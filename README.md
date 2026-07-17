# Badminton Court Management System - Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

A modern, real-time Badminton Court Booking and Management System built with React, Vite, and Tailwind CSS.

## 📖 Comprehensive Documentation
For detailed system architecture, diagrams, flowcharts, and full project descriptions, please visit our **[Notion Workspace](https://app.notion.com/p/Badminton-Court-Management-System-3849f49bca6d8032a1b6d16c2a71ce08?source=copy_link)**.

## 🌐 Live Demo
**[https://badminton-court-management.vercel.app](https://badminton-court-management.vercel.app)**

### 🔐 Test Accounts (For Recruiters/Testers)
- **Admin**: `0388874855` / `123456`
- **Customer**: Feel free to register a new account via the `/auth/register` API or the Sign Up page.

## 🚀 Features

- **Real-Time Schedule Syncing**: Powered by Socket.io, the court schedule updates instantly across all active clients when a booking is made or canceled.
- **Drag-to-Select Booking**: Intuitive UX allowing customers to click and drag to select multiple consecutive hours easily.
- **Automated Conflict Prevention**: Prevents double-booking on the UI level and reflects real-time status.
- **Role-based Dashboards**:
  - **Customer Portal**: Search availability, book courts, and generate VietQR for easy payment.
  - **Staff/Admin Dashboard**: Manage courts, handle maintenance slots, manually confirm payments, and view daily grid schedules.
- **Responsive Design**: fully optimized for Desktop and Tablet using Tailwind CSS.

## 📸 Screenshots

<img width="800" height="500" alt="Real-time Booking Sync" src="https://github.com/user-attachments/assets/b0c995be-e931-4628-a209-773a7ef71b95" />

## 🛠 Tech Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Headless UI / Lucide React (Icons)
- **State Management & Data Fetching**: Axios, React Hooks
- **Real-time Communication**: Socket.io-client
- **Date Handling**: Day.js

## 💻 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nhatthaiuit/Badminton_Court_Management_FE.git
   cd Badminton_Court_Management_FE
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   VITE_SOCKET_URL=http://localhost:5001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── api/             # Axios instance and API call functions
├── assets/          # Static files (images, icons)
├── components/      # Reusable UI components (Modals, Grids, Layouts)
├── context/         # React Context (e.g., AuthContext)
├── hooks/           # Custom React hooks
├── pages/           # Page components (Auth, Bookings, Dashboard, etc.)
└── utils/           # Helper functions
```
