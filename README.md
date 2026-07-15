# Badminton Court Management System - Frontend

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

A modern, real-time Badminton Court Booking and Management System built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Real-Time Schedule Syncing**: Powered by Socket.io, the court schedule updates instantly across all active clients when a booking is made or canceled.
- **Drag-to-Select Booking**: Intuitive UX allowing customers to click and drag to select multiple consecutive hours easily.
- **Automated Conflict Prevention**: Prevents double-booking on the UI level and reflects real-time status.
- **Role-based Dashboards**:
  - **Customer Portal**: Search availability, book courts, and generate VietQR for easy payment.
  - **Staff/Admin Dashboard**: Manage courts, handle maintenance slots, manually confirm payments, and view daily grid schedules.
- **Responsive Design**: fully optimized for Desktop and Tablet using Tailwind CSS.

## 📸 Screenshots

*(Add screenshots or GIFs of your Drag-to-Select and Real-time syncing here)*

## 🛠 Tech Stack

- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, Headless UI / Lucide React (Icons)
- **State Management & Data Fetching**: Axios, React Hooks
- **Real-time Communication**: Socket.io-client
- **Date Handling**: Day.js

## 💻 Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Badminton_Court_Management_FE.git
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

## 🌐 Deployment (Vercel)

This frontend can be easily deployed to [Vercel](https://vercel.com/):
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Set the Build Command to `npm run build` and Output Directory to `dist`.
4. Add the `VITE_API_URL` and `VITE_SOCKET_URL` environment variables pointing to your deployed backend.
5. Deploy!
