<div align="center">

# ✦ Patchwork Dizayn

*Design premium custom patchwork rugs. Track orders in real-time. Manage production workflows.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Integrated-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Enabled-009639?style=flat-square&logo=nginx)](https://nginx.org/)
[![License](https://img.shields.io/badge/License-MIT-F7EED2?style=flat-square)](LICENSE)

**[Features](#-features) • [Installation](#-getting-started) • [Docker](#-docker-deployment) • [Admin Portal](#-admin-dashboard) • [Tech Stack](#-tech-stack)**

</div>

---

## 📖 About Patchwork Dizayn

**Patchwork Dizayn** is a high-end web application tailored for the interior design and rug manufacturing industry. It allows users to create **custom patchwork rug specifications** using a precision-based CAD-like interface, calculate costs instantly, and manage the entire order lifecycle from design to delivery.

### Core Concept:
- **Precision Grid**: Fixed 5 cm (0.05 m) grid system ensuring manufacturing feasibility.
- **Order Lifecycle**: Dynamic status tracking from "Price Requested" to "Delivered".
- **Real-time Admin Sync**: Transparent communication between the workshop and the customer.

---

## ✨ Features

### 🎨 Design Engine
- **Intelligent Templates**: Automatic patchwork generation based on dimensions.
- **Admin-Managed Textures**: Rug pieces assigned directly from a cloud-managed texture library.
- **Instant BOM**: Real-time calculation of area, price, and material waste.
- **Precision Export**: Manufacturing-ready PDF technical specifications with client details.

### 👤 Premium User Profile
- **Modern UI/UX**: Glassmorphic design with smooth animations (`framer-motion`).
- **Order Tracking**: Real-time progress monitoring (Pending, In Progress, Ready, Shipped).
- **Kargo Integration**: View tracking numbers directly in the profile.
- **Notification Center**: View admin notes and updates regarding specific designs.

### 🛡️ Admin Dashboard
- **CRM & Orders**: View client names, valid phone numbers, and design specifications.
- **Workflow Management**: Update order statuses and add customer notes.
- **Logistics**: Enter kargo tracking numbers for user orders.
- **Settings Control**: Global price per sqm, grid settings, and hero image management.

---

## 🚀 Getting Started

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/mo1112020/patchwork-dizayn.git
cd rug-weaver-pro

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env .env.local
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Run development server
npm run dev
```

---

## 🐳 Docker Deployment

The project is fully containerized for production environments using **Nginx** and **Docker Compose**.

### Run with Docker Compose

```bash
docker compose up --build
```
> Access the production build at **http://localhost:3000**

### Manual Docker Build
```bash
docker build -t rug-weaver-pro .
docker run -p 8080:80 rug-weaver-pro
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript 5, Vite, Framer Motion, Konva.js |
| **Styling** | Tailwind CSS (Custom Design System), Lucide Icons |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| **CI/CD** | Docker, Docker Compose, Nginx (Linux Alpine) |
| **Integrations** | Resend API (Emails), Deno (Edge Functions) |
| **Documents** | jsPDF, jsPDF-AutoTable |

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── admin/      # Order management & control panel
│   ├── designer/   # Canvas, OrderStatusBadge, PricePanel
│   └── ui/         # Glassmorphic shadcn components
├── hooks/          # useOrders, useDesigns, useDesigner Settings
├── lib/            # PDF Generator, Admin API bridge
├── pages/          # Profile (Redesigned), Admin, Auth, Designer
└── locales/        # Advanced i18n (TR/EN)
supabase/
└── functions/      # Edge Functions (Email, Admin API)
```

---

## 📄 Database Setup

Run the SQL provided in `supabase/new-project-setup.sql` in your Supabase SQL Editor. 
*Note: To enable Tracking Numbers, ensure you run:*
```sql
ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
```

---

<div align="center">

**[Docs](docs/) • [Issues](https://github.com/mo1112020/patchwork-dizayn/issues)**

</div>
 
