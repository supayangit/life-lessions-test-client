# 🌱 Digital Life Lessons

A modern full-stack web application where people can preserve, organize, and share meaningful life lessons, personal experiences, and wisdom with the community.

Users can create private or public lessons, interact with other users through likes, comments, and favorites, while Premium members unlock exclusive content and additional publishing capabilities.

---

## 🌐 Live Website

**Live Site:**  
https://digital-lifelessons-sup.vercel.app/

---

# 📖 Overview

Digital Life Lessons helps users document valuable experiences so they are never forgotten. Instead of letting important life lessons disappear over time, the platform creates a personal knowledge archive while also allowing users to learn from others.

The application includes authentication, premium memberships, lesson management, user dashboards, admin moderation, social interactions, reporting system, payment integration, analytics, and responsive modern UI.

---

# ✨ Features

### 🔐 Authentication

- Email & Password authentication
- Google Sign In
- Secure authentication using Better Auth
- Protected routes
- Session management

---

### 📚 Lesson Management

- Create life lessons
- Update existing lessons
- Delete lessons
- Public / Private visibility
- Free / Premium access levels
- Optional lesson images
- Categories
- Emotional tone selection

---

### 👥 Community Features

- Browse public lessons
- Like lessons
- Save to favorites
- Comment system
- Report inappropriate lessons
- Featured lessons
- Top contributors
- Most saved lessons

---

### 💎 Premium Membership

- Stripe payment integration
- Lifetime premium upgrade
- Access premium lessons
- Create premium-only lessons
- Premium badge

---

### 👤 User Dashboard

- Dashboard overview
- Analytics
- My Lessons
- Favorites
- Profile management
- Lesson statistics

---

### 🛠️ Admin Dashboard

- User management
- Lesson moderation
- Featured lesson management
- Report handling
- Platform analytics
- Role management

---

### 🎨 UI & UX

- Fully responsive
- Modern dashboard
- Interactive animations
- Clean typography
- Professional card layouts
- Loading states
- Custom 404 page

---

# 🛠 Tech Stack

## Frontend

- React
- React Router
- Tailwind CSS
- DaisyUI
- Framer Motion
- Axios
- React Hook Form
- React Hot Toast
- React Share
- Recharts

---

## Backend

- Node.js
- Express.js
- MongoDB
- Better Auth
- Stripe
- JWT
- Multer
- Cloudinary (if configured)

---

## Database

- MongoDB Atlas

---

## Authentication

- Better Auth
- Google OAuth

---

## Payment

- Stripe Checkout
- Stripe Webhooks

---

# 📂 Main Functionalities

- User Registration
- Login
- Google Authentication
- Create Lessons
- Update Lessons
- Delete Lessons
- Public Lesson Feed
- Search
- Filtering
- Sorting
- Pagination
- Favorites
- Likes
- Comments
- Reports
- Premium Membership
- Dashboard Analytics
- Admin Panel

---

# 📸 Application Screenshots

Replace these images with actual screenshots after deployment.

## Home Page

```
/screenshots/home.png
```

<img width="1920" height="1080" alt="Screenshot (290)" src="https://github.com/user-attachments/assets/86bcdfd6-466e-4539-bcab-919d24b605f7" />


---

## Public Lessons

```
/screenshots/public-lessons.png
```

<img width="1920" height="1080" alt="Screenshot (291)" src="https://github.com/user-attachments/assets/1943a8c7-d6c3-4678-a313-f7e6215ccda5" />

---

## User Dashboard

```
/screenshots/dashboard.png
```

<img width="1920" height="1080" alt="Screenshot (289)" src="https://github.com/user-attachments/assets/bc56006d-fa5b-44c5-a7cd-8ff437e2839c" />


---

## Admin Dashboard

```
/screenshots/admin-dashboard.png
```

<img width="1920" height="1080" alt="Screenshot (285)" src="https://github.com/user-attachments/assets/e12b77f0-d629-4f76-9c1e-3213acdf203b" />

---

# 🔑 Demo Credentials

## Admin

**Email**

```
admin@gmail.com
```

**Password**

```
Admin123
```

---

# 📁 Project Structure

```
client/
│
├── src/
├── components/
├── pages/
├── layouts/
├── hooks/
├── providers/
├── routes/
├── services/
└── assets/

server/
│
├── controllers/
├── routes/
├── middleware/
├── config/
├── auth/
├── utils/
└── uploads/
```

---

# 🔒 Environment Variables

Create a `.env` file in both the client and server.

## Client

```env
VITE_API_URL=
VITE_BETTER_AUTH_URL=
VITE_GOOGLE_CLIENT_ID=
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Server

```env
PORT=

MONGODB_URI=

BETTER_AUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

CLIENT_URL=
```

---

# 🚀 Running the Project Locally

## 1. Clone the repositories

```bash
git clone <client-repository-url>
git clone <server-repository-url>
```

---

## 2. Install dependencies

### Client

```bash
cd client
npm install
```

### Server

```bash
cd server
npm install
```

---

## 3. Configure environment variables

Create `.env` files for both the client and server using the required environment variables shown above.

---

## 4. Start the backend

```bash
npm run dev
```

---

## 5. Start the frontend

```bash
npm run dev
```

---

## 6. Open the application

Visit:

```
http://localhost:3000
```

(Or the port shown by Vite.)

---

# 📌 Future Improvements

- Email notifications
- Lesson bookmarking collections
- AI-powered lesson recommendations
- Rich text editor
- User following system
- Lesson drafts
- Mobile application
- Offline support
- Real-time notifications

---

# 👨‍💻 Developed by

**Supayan Chakma**

If you find this project useful, consider giving it a ⭐ on GitHub.
