# 💰 MoneyTracker — MERN Stack Finance App

> **Track. Plan. Grow.** — A full-featured personal finance dashboard built with MongoDB, Express, React, and Node.js.

---

## 📸 Features

- 🔐 **Authentication** — Secure JWT-based login & registration
- 📊 **Dashboard** — Real-time overview with charts, stats, and insights
- 💳 **Transactions** — Full CRUD: add, edit, delete, filter income & expenses
- 📋 **Budgets** — Set monthly spending limits per category with progress tracking
- 🎯 **Goals** — Create savings goals and track progress with fund contributions
- 📈 **Reports** — Visual analytics: bar charts, pie charts, line graphs
- ⚙️ **Settings** — Profile management and preferences

---

## 🛠️ Tech Stack

| Layer      | Technology                  |
|------------|-----------------------------|
| Frontend   | React 18, React Router v6, Recharts |
| Backend    | Node.js, Express.js         |
| Database   | MongoDB Atlas (Cloud)       |
| Auth       | JWT + bcryptjs              |
| Styling    | Custom CSS with CSS Variables |
| HTTP       | Axios                       |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- A **MongoDB Atlas** account (free tier works great)
- npm or yarn

---

### Step 1 — Set Up MongoDB Atlas

1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up for free
2. Create a new **Cluster** (choose the free M0 tier)
3. Create a **Database User** (username + password) — save these!
4. Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Connect** → **Connect your application** → copy the connection string

Your connection string looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### Step 2 — Configure Environment Variables

1. Go into the `backend/` folder
2. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Open `backend/.env` and fill in your values:
   ```
   MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/moneytracker?retryWrites=true&w=majority
   JWT_SECRET=pick_any_long_random_string_here_make_it_secure
   PORT=5000
   NODE_ENV=development
   ```
   > ⚠️ Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your MongoDB Atlas credentials.
   > Replace the cluster URL with your actual cluster URL.

---

### Step 3 — Install Dependencies

From the root `moneytracker/` folder, run:

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

---

### Step 4 — Run the App

From the root `moneytracker/` folder:

```bash
npm run dev
```

This starts both servers simultaneously:
- **Backend API** → [http://localhost:5000](http://localhost:5000)
- **Frontend App** → [http://localhost:3000](http://localhost:3000)

Open your browser at **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
moneytracker/
├── package.json              ← Root scripts (runs both servers)
│
├── backend/
│   ├── server.js             ← Express app entry point
│   ├── .env.example          ← Environment variable template
│   ├── package.json
│   ├── models/
│   │   ├── User.js           ← User schema
│   │   ├── Transaction.js    ← Transaction schema
│   │   ├── Budget.js         ← Budget schema
│   │   └── Goal.js           ← Goal schema
│   ├── routes/
│   │   ├── auth.js           ← /api/auth (register, login, me)
│   │   ├── transactions.js   ← /api/transactions (CRUD)
│   │   ├── budgets.js        ← /api/budgets (CRUD)
│   │   ├── goals.js          ← /api/goals (CRUD)
│   │   └── summary.js        ← /api/summary (dashboard data)
│   └── middleware/
│       └── auth.js           ← JWT verification middleware
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── package.json
    └── src/
        ├── index.js           ← React entry point
        ├── index.css          ← Global styles & CSS variables
        ├── App.js             ← Router + layout
        ├── context/
        │   └── AuthContext.js ← Auth state management
        ├── utils/
        │   └── api.js         ← Axios API helpers
        ├── components/
        │   ├── Sidebar.js / .css
        │   └── TopBar.js / .css
        └── pages/
            ├── Login.js / .css
            ├── Register.js
            ├── Dashboard.js / .css
            ├── Transactions.js / .css
            ├── Budgets.js / .css
            ├── Goals.js / .css
            ├── Reports.js / .css
            └── Settings.js / .css
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint             | Description         |
|--------|----------------------|---------------------|
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login user          |
| GET    | `/api/auth/me`       | Get current user    |
| PUT    | `/api/auth/profile`  | Update profile      |

### Transactions
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/transactions`         | List transactions        |
| POST   | `/api/transactions`         | Create transaction       |
| PUT    | `/api/transactions/:id`     | Update transaction       |
| DELETE | `/api/transactions/:id`     | Delete transaction       |

### Budgets
| Method | Endpoint            | Description       |
|--------|---------------------|-------------------|
| GET    | `/api/budgets`      | Get budgets       |
| POST   | `/api/budgets`      | Create/update     |
| DELETE | `/api/budgets/:id`  | Delete budget     |

### Goals
| Method | Endpoint          | Description    |
|--------|-------------------|----------------|
| GET    | `/api/goals`      | List goals     |
| POST   | `/api/goals`      | Create goal    |
| PUT    | `/api/goals/:id`  | Update goal    |
| DELETE | `/api/goals/:id`  | Delete goal    |

### Summary
| Method | Endpoint       | Description           |
|--------|----------------|-----------------------|
| GET    | `/api/summary` | Dashboard summary     |

---

## 🌐 Deploying to Production

### Backend (Render / Railway / Heroku)
1. Set environment variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Deploy the `backend/` folder as a Node.js service
4. Note your backend URL (e.g., `https://moneytracker-api.onrender.com`)

### Frontend (Vercel / Netlify)
1. Update `frontend/package.json` proxy or use an `.env` file:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```
2. Update axios `baseURL` in `frontend/src/utils/api.js`
3. Deploy the `frontend/` folder

---

## 🆓 Free Hosting Options

| Service  | What to host | Free tier |
|----------|-------------|-----------|
| MongoDB Atlas | Database | 512MB |
| Render | Backend API | 750 hrs/month |
| Vercel | Frontend | Unlimited |

---

## 📝 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ using the MERN stack.
