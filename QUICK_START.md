# ONETN15 App - Quick Start Guide

## 📍 Root Directory
```
/var/www/projects/new/onetn15-app
```

## ⚡ Quick Commands

### Start the App (Production Mode)
```bash
cd /var/www/projects/new/onetn15-app

# Build frontend
npm run build

# Start backend (serves both API and frontend)
npm run server
```
✅ **Access at:** http://localhost:3001

---

### Build Commands

| Command | What it does | Output |
|---------|------------|--------|
| `npm run build` | Build React app for production | `/build` folder |
| `npm start` | Start dev server (port 3000) | Hot-reload enabled |
| `npm run server` | Start backend (port 3001) | Serves API + frontend |
| `npm run dev` | Start both (needs concurrently) | Ports 3000 & 3001 |
| `npm test` | Run tests | Watch mode |

---

### Database Commands

| Command | What it does |
|---------|------------|
| `npm run db:setup` | Create database schema |
| `cd server && node setup.js` | Create admin user |

---

## 📂 Key Directories

| Directory | Purpose |
|-----------|---------|
| `/src` | React frontend code |
| `/server` | Node.js/Express backend |
| `/build` | Production build (generated) |
| `/public` | Static assets (HTML, icons) |

---

## 🔐 Login Credentials

- **Username:** admin
- **Password:** admin123
- **CMS URL:** http://localhost:3001/cms/login

---

## 🌐 API Base URL

```
http://localhost:3001/api
```

### Common Endpoints
- `GET /api/health` - Check if API is running
- `GET /api/news` - Get news articles
- `GET /api/categories` - Get categories
- `GET /api/navigation` - Get full navigation

---

## 🔧 Environment Variables (`.env`)

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/cms_db
JWT_SECRET=onetn15-cms-secret-key-2024
PORT=3001
NODE_ENV=development
```

---

## ✅ Current Status

- ✅ Frontend: Built and ready
- ✅ Backend: Running on port 3001
- ✅ Database: Set up with sample data
- ✅ App: Live at http://localhost:3001

---

## 📝 Useful Links

- Frontend Code: `/src`
- Backend Code: `/server`
- Database Schema: `/server/schema.sql`
- Setup Guide: `./SETUP_GUIDE.md`
