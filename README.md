# 🎬 ViewBookCinemas (VBC)

<p align="center">
  <strong>Chạm vé – Chạm cảm xúc</strong>
  <br/>
  Online Movie Ticket Booking Platform
</p>

<p align="center">
  <!-- Project Logo -->
  <img src="docs/Images/logo.png" alt="ViewBookCinemas Logo" width="220"/>
</p>

<p align="center">
  <!-- Technology Badges -->
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/Backend-ASP.NET_Core-512BD4?logo=dotnet&logoColor=white" alt="ASP.NET Core"/>
  <img src="https://img.shields.io/badge/Database-SQL_Server-CC2927?logo=microsoftsqlserver&logoColor=white" alt="SQL Server"/>
  <img src="https://img.shields.io/badge/Version_Control-Git-F05032?logo=git&logoColor=white" alt="Git"/>
</p>

---

## 📑 Table of Contents

1. [🎬 Introduction](#-introduction)
2. [🛠️ Technology Stack](#️-technology-stack)
3. [📌 Project Features](#-project-features)
4. [🏗️ System Architecture](#️-system-architecture)
5. [📂 Project Structure](#-project-structure)
6. [🚀 Installation & Setup](#-installation--setup)
7. [🖥️ Screenshots](#️-screenshots)
8. [📡 API Documentation](#-api-documentation)
9. [📝 Git Commit Convention](#-git-commit-convention)
10. [📊 Project Status](#-project-status)

---

## 🎬 Introduction

**ViewBookCinemas (VBC)** is an online movie ticket booking platform designed to provide users with a convenient and seamless cinema experience.

The platform allows users to explore movies, check showtimes, select seats, book tickets, and manage their bookings through a modern and user-friendly interface.

### Project Objectives

- Build an online movie ticket booking platform.
- Provide a convenient movie discovery and booking experience.
- Develop a seat selection and ticket management system.
- Support online payment integration.
- Provide an administration system for managing cinema operations.

### Brand Identity

| Information | Description |
|---|---|
| Project Name | ViewBookCinemas |
| Abbreviation | VBC |
| Slogan | Chạm vé – Chạm cảm xúc |
| Project Type | Online Movie Ticket Booking Platform |
| Main Color | Red & White |

---

## 🛠️ Technology Stack

Technologies and tools used to develop the project.

### Frontend

- ReactJS
- JavaScript
- HTML5
- CSS3
- Bootstrap

### Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- RESTful API

### Database

- Microsoft SQL Server

### Authentication & Security

- JWT Authentication
- Role-Based Authorization

### Development Tools

- Visual Studio
- Visual Studio Code
- SQL Server Management Studio
- Postman
- Git & GitHub

### Deployment & Infrastructure

- Docker
- Render

---

## 📌 Project Features

The system provides separate functionalities for customers and administrators.

### Customer Features

| No. | Feature | Description |
|---|---|---|
| 01 | Home | Display featured, now showing and upcoming movies. |
| 02 | Movies | Browse movies and view detailed information. |
| 03 | Showtimes | View movie schedules, cinemas and screening times. |
| 04 | Booking | Select seats, choose combos and book tickets. |
| 05 | Payment | Process and manage ticket payments. |
| 06 | Account | Register, log in and manage personal information. |
| 07 | Booking History | View previous bookings and electronic tickets. |
| 08 | Promotions | Apply discount codes and promotional offers. |
| 09 | Reviews | Rate and review movies. |
| 10 | Favorites | Save and manage favorite movies. |

### Admin Features

| No. | Feature | Description |
|---|---|---|
| 01 | Dashboard | Display system statistics and reports. |
| 02 | Movie Management | Manage movie information and categories. |
| 03 | Cinema Management | Manage cinemas and branches. |
| 04 | Room Management | Manage screening rooms and seats. |
| 05 | Showtime Management | Manage movie schedules. |
| 06 | Booking Management | Manage customer bookings. |
| 07 | User Management | Manage customer accounts and roles. |
| 08 | Payment Management | Monitor payment transactions. |
| 09 | Promotion Management | Manage discount codes and promotions. |
| 10 | Reports | Generate booking and revenue reports. |

---

## 🏗️ System Architecture

The system follows a client-server architecture, separating the frontend, backend and database layers.

### Architecture Overview

```text
+--------------------------------------+
|             CLIENT LAYER             |
|                                      |
|       ReactJS + Bootstrap            |
|                                      |
|   Customer Website / Admin Dashboard |
+--------------------------------------+
                  |
                  | HTTP / REST API
                  | JSON
                  v
+--------------------------------------+
|          APPLICATION LAYER           |
|                                      |
|         ASP.NET Core Web API         |
|                                      |
|   Controllers                        |
|   Services                           |
|   Repositories                       |
|   DTOs                               |
|   Authentication & Authorization     |
+--------------------------------------+
                  |
                  | Entity Framework Core
                  v
+--------------------------------------+
|             DATA LAYER               |
|                                      |
|          SQL Server                  |
|                                      |
|   Users / Movies / Cinemas            |
|   Showtimes / Seats / Bookings        |
|   Payments / Promotions              |
+--------------------------------------+
```

### Main System Components

- **Frontend:** Provides the user interface and communicates with backend APIs.
- **Backend:** Handles business logic, authentication, authorization and booking operations.
- **Database:** Stores and manages system information.
- **API:** Connects the frontend with backend services.

---

## 📂 Project Structure

The project is organized into separate directories to improve maintainability and scalability.

```text
ViewBookCinemas/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/
│   ├── Middleware/
│   └── Program.cs
│
├── database/
│   ├── Scripts/
│   └── Documents/
│
├── docs/
│   ├── Images/
│   ├── Diagrams/
│   └── Documents/
│
├── .gitignore
└── README.md
```

*Note: The directory structure may be updated during development.*

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites

Install the following tools:

- Node.js and npm
- .NET SDK
- Microsoft SQL Server
- SQL Server Management Studio
- Git

### 2. Clone Repository

```bash
git clone <repository-url>
cd ViewBookCinemas
```

### 3. Database Configuration

1. Open SQL Server Management Studio.
2. Create the project database.
3. Execute the database scripts in `database/Scripts/`.
4. Configure the connection string in the backend configuration.

### 4. Backend Setup

```bash
cd backend

dotnet restore
dotnet build
dotnet run
```

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

### 6. Environment Configuration

Configure the required environment variables before running the application.

Example:

```env
# Backend
ConnectionStrings__DefaultConnection=

# Frontend
VITE_API_BASE_URL=
```

*Note: Do not commit sensitive information, passwords or production credentials to the repository.*

---

## 🖥️ Screenshots

This section presents screenshots of the main interfaces of ViewBookCinemas.

### Homepage

<!-- Add homepage screenshot here -->

### Movie Listing

<!-- Add movie listing screenshot here -->

### Movie Details

<!-- Add movie details screenshot here -->

### Showtime Selection

<!-- Add showtime screenshot here -->

### Seat Selection

<!-- Add seat selection screenshot here -->

### Booking & Payment

<!-- Add booking and payment screenshot here -->

### User Profile

<!-- Add user profile screenshot here -->

### Admin Dashboard

<!-- Add admin dashboard screenshot here -->

---

## 📡 API Documentation

The backend provides RESTful APIs for communication between the frontend and backend.

### API Groups

| No. | API Group | Description |
|---|---|---|
| 01 | Authentication | User registration and login. |
| 02 | Movies | Movie information and management. |
| 03 | Cinemas | Cinema and branch management. |
| 04 | Showtimes | Movie schedule management. |
| 05 | Seats | Seat information and availability. |
| 06 | Bookings | Ticket booking management. |
| 07 | Payments | Payment processing and transactions. |
| 08 | Users | User profile management. |
| 09 | Promotions | Discount and promotion management. |
| 10 | Reviews | Movie reviews and ratings. |

### API Testing

API endpoints can be tested using Postman or Swagger UI.

**Swagger URL:**

```text
https://localhost:<port>/swagger
```

---

## 📝 Git Commit Convention

This project follows a consistent Git commit convention to maintain a clear and organized development history.

### Commit Message Structure

```text
<type>(<scope>): <short description>
```

### Commit Types

| Type | Description |
|---|---|
| feat | Add a new feature. |
| fix | Fix a bug. |
| docs | Update documentation. |
| style | Modify code formatting or styling. |
| refactor | Refactor existing code. |
| perf | Improve application performance. |
| test | Add or update tests. |
| chore | Update configuration or maintenance tasks. |

### Commit Examples

```bash
feat(auth): implement user authentication
feat(booking): add seat selection
feat(movies): add movie filtering
fix(booking): prevent duplicate seat booking
docs(readme): update project documentation
style(home): improve homepage layout
refactor(api): reorganize movie services
test(booking): add booking validation tests
chore(assets): add VBC brand logo
```

---

## 📊 Project Status

The following checklist tracks the development progress of ViewBookCinemas.

### Development Progress

- [ ] **UI/UX Design**
- [ ] **Frontend Development**
- [ ] **Backend Development**
- [ ] **Database Design**
- [ ] **Authentication & Authorization**
- [ ] **Movie Management**
- [ ] **Showtime Management**
- [ ] **Booking System**
- [ ] **Payment Integration**
- [ ] **Testing**
- [ ] **Deployment**

### Status Legend

- [ ] Not Started
- [x] Completed



<p align="center">
  <strong>ViewBookCinemas (VBC)</strong>
  <br/>
  Chạm vé – Chạm cảm xúc
  <br/>
  <sub>© 2026 ViewBookCinemas. All Rights Reserved.</sub>
</p>
