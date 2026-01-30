# 🚀 Quick Start Guide - 5 Minutes to Running App

## Prerequisites
- ✅ Node.js (v16+) installed
- ✅ PostgreSQL (v12+) installed
- ✅ Git installed

---

## Step 1: Database Setup (2 minutes)

### Option A: Using pgAdmin
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `nagarsewa`
4. Right-click `nagarsewa` → Query Tool
5. Open file: `Backend/docs/database-migration.sql`
6. Click Execute (▶)

### Option B: Using Command Line
```bash
# Open psql
psql -U postgres

# Create database
CREATE DATABASE nagarsewa;
\c nagarsewa

# Run migration
\i C:/NagarSewa/Backend/docs/database-migration.sql

# Exit
\q
```

---

## Step 2: Backend Configuration (1 minute)

```bash
# Navigate to backend
cd Backend

# Copy environment template
copy .env.example .env

# Edit .env with your credentials:
# - PG_PASSWORD=your_postgres_password
# - JWT_SECRET=make_this_at_least_32_characters_long_and_random

# Install dependencies
npm install
```

---

## Step 3: Start Backend (30 seconds)

```bash
# Development mode (auto-reload)
npm run dev

# OR Production mode
npm start
```

**Backend should now be running at:** http://localhost:5000

---

## Step 4: Frontend Configuration (30 seconds)

```bash
# Open new terminal
cd Frontend

# Create environment file
echo VITE_API_URL=http://localhost:5000/api > .env

# Install dependencies (if not done)
npm install
```

---

## Step 5: Start Frontend (30 seconds)

```bash
# Start development server
npm run dev
```

**Frontend should now be running at:** http://localhost:5173

---

## ✅ Verification

### Test Backend Health
```bash
curl http://localhost:5000/health
```
Should return: `{"status":"healthy",...}`

### Test Frontend
1. Open browser: http://localhost:5173
2. Navigate to Login/Register page
3. Create a new account
4. Login successfully

---

## 🎊 Success!

Your NagarSewa app is now running!

- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:5173
- **Super Admin:** superadmin@nagarsewa.gov.np / NagarSewa@2026 ⚠️ Change immediately!

---

## 📖 Next Steps

1. **Read Documentation:**
   - [Backend Complete Guide](Backend/COMPLETE_BACKEND_GUIDE.md)
   - [API Integration Guide](Backend/docs/integration.md)
   - [Implementation Status](Backend/docs/IMPLEMENTATION_STATUS.md)

2. **Test Features:**
   - User registration and login
   - Issue reporting (after implementing Issue model)
   - Campaign requests (after implementing Campaign controller)

3. **Customize:**
   - Change super admin password
   - Configure email service
   - Add file upload functionality
   - Implement remaining features

---

## 🆘 Troubleshooting

### Backend won't start
- Check `.env` file exists and has correct values
- Verify PostgreSQL is running
- Ensure database `nagarsewa` exists
- Check port 5000 is not in use

### Frontend can't connect
- Verify backend is running at http://localhost:5000
- Check `.env` file in Frontend folder has `VITE_API_URL`
- Check browser console for CORS errors

### Database connection fails
- Verify PostgreSQL credentials in `.env`
- Check PostgreSQL is running on port 5432
- Ensure database exists: `psql -U postgres -c "\l" | grep nagarsewa`

---

## 💡 Helpful Commands

```bash
# Check if backend is running
curl http://localhost:5000/health

# Check if PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Restart backend
# Press Ctrl+C in backend terminal, then:
npm run dev

# View backend logs
# They appear in the terminal where you ran npm run dev

# Reset database (WARNING: Deletes all data)
psql -U postgres -c "DROP DATABASE IF EXISTS nagarsewa;"
psql -U postgres -c "CREATE DATABASE nagarsewa;"
psql -U postgres -d nagarsewa -f Backend/docs/database-migration.sql
```

---

**Need more help?** Check [BACKEND_COMPLETION_SUMMARY.md](BACKEND_COMPLETION_SUMMARY.md) for comprehensive guidance!