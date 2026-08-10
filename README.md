# 🎬 CineMax Cinema Booking System

A complete, production-ready MERN stack cinema booking platform with:
- Dummy payment gateway (no real card charges)
- Real-time seat locking via Socket.io
- PDF ticket download
- Working Contact Us form (stored in MongoDB)
- Admin panel (movies CRUD, bookings, users, messages)
- JWT authentication with role-based access
- Framer Motion animations + dark cinema UI

For production setup, follow [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 📁 Project Structure

```
cinemax/
├── backend/
│   ├── controllers/      # booking, movie, theater, screen, showtime, concession, auth, contact, user
│   ├── middleware/        # authMiddleware (JWT + admin guard)
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routers (+ contact.routes.js)
│   ├── services/          # email.service.js (optional Nodemailer)
│   ├── utils/             # generateToken, verifyRefreshToken, validationSchema, seed
│   ├── server.js          # Entry point (Socket.io + dummy payment API)
│   ├── package.json
│   └── .env
│
└── client/
    ├── src/
    │   ├── api/           # Axios instance + all endpoint helpers + socket singleton
    │   ├── components/    # layout, homepage, booking, contact, admin, ui
    │   ├── pages/         # All pages (18 total)
    │   ├── store/slices/  # Redux slices
    │   ├── App.jsx        # Full router with ProtectedRoute
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

Edit `backend/.env` (already created with defaults):

```env
MONGO_URL=mongodb://localhost:27017/cinemax
PORT=8080
ACCESS_TOKEN=replace_with_a_long_random_secret
REFRESH_TOKEN=replace_with_a_different_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional - leave blank to skip email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

Output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
🎬 Created 6 movies
🍿 Created 8 concession items
🏛️  Created theater: CineMax Grand
🎭 Created 4 screens
📅 Created 48 showtimes
👤 Admin: admin@cinemax.ph / Admin@123
👤 User:  user@cinemax.ph  / User@1234
✅ Database seeded successfully!
```

### 4. Start the servers

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd client && npm run dev
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:8080       |
| Health   | http://localhost:8080/health|

---

## 💳 Dummy Payment System

No real payment processor is used. On checkout:
1. Enter any cardholder name
2. Use card number: `4242 4242 4242 4242`
3. Any future expiry date (e.g. `12/28`)
4. Any 3-digit CVV (e.g. `123`)

A fake Transaction ID is generated (format: `TXN-XXXXXXXX`) and stored with the booking.

---

## 🔑 Default Credentials

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@cinemax.ph    | Admin@123  |
| User  | user@cinemax.ph     | User@1234  |

---

## ✅ Feature Checklist

| Feature                     | Status |
|-----------------------------|--------|
| Movie listing + search      | ✅     |
| Genre filter + sort         | ✅     |
| Movie details page          | ✅     |
| Theater listing             | ✅     |
| Showtime selection          | ✅     |
| Seat selection (interactive)| ✅     |
| Real-time seat locking      | ✅     |
| Add-ons / Snacks            | ✅     |
| Dummy payment gateway       | ✅     |
| Booking saved to DB         | ✅     |
| Duplicate booking prevention| ✅     |
| PDF ticket download         | ✅     |
| Digital ticket page         | ✅     |
| Refund / Cancel booking     | ✅     |
| Contact Us form             | ✅     |
| Contact messages in DB      | ✅     |
| Email confirmation          | ✅ (optional) |
| JWT Auth (Login/Signup)     | ✅     |
| Protected routes            | ✅     |
| Admin: Movies CRUD          | ✅     |
| Admin: View bookings        | ✅     |
| Admin: Manage users         | ✅     |
| Admin: Read contact msgs    | ✅     |
| Favorite movies             | ✅     |
| Booking history             | ✅     |
| Skeleton loaders            | ✅     |
| Toast notifications         | ✅     |
| Framer Motion animations    | ✅     |
| Responsive / mobile-first   | ✅     |
| Hamburger menu              | ✅     |
| 404 page                    | ✅     |

---

## 🔧 API Endpoints

### Auth
| Method | Endpoint                | Description        |
|--------|-------------------------|--------------------|
| POST   | /api/auth/login         | Login              |
| POST   | /api/auth/signup        | Register           |
| POST   | /api/refreshToken       | Refresh JWT        |

### Movies
| Method | Endpoint                | Description        |
|--------|-------------------------|--------------------|
| GET    | /api/movie              | Get all movies     |
| POST   | /api/movie              | Create movie       |
| PUT    | /api/movie/:id          | Update movie       |
| DELETE | /api/movie/:id          | Delete movie       |

### Bookings
| Method | Endpoint                     | Auth | Description         |
|--------|------------------------------|------|---------------------|
| GET    | /api/booking                 | —    | All bookings        |
| GET    | /api/booking/user/:id        | ✅   | User bookings       |
| POST   | /api/booking/:userId         | ✅   | Create booking      |
| POST   | /api/booking-refund/:userId  | ✅   | Refund booking      |
| PUT    | /api/booking/:userId         | ✅   | Rate booking        |

### Payment (Dummy)
| Method | Endpoint                | Description              |
|--------|-------------------------|--------------------------|
| POST   | /api/payment/process    | Fake payment processing  |

### Contact
| Method | Endpoint                | Auth  | Description         |
|--------|-------------------------|-------|---------------------|
| POST   | /api/contact            | —     | Submit message      |
| GET    | /api/contact            | Admin | View all messages   |
| PUT    | /api/contact/:id/read   | Admin | Mark as read        |
| DELETE | /api/contact/:id        | Admin | Delete message      |

---

## 🐛 Known Bugs Fixed in This Version

1. `verifyRefreshToken.js` — wrong env var (`REFRESH_TOKEN_SECRET` → `REFRESH_TOKEN`)
2. `refreshToken.controller.js` — wrong JWT payload field (`_id` → `userId`)
3. `auth.routes.js` — route case mismatch (`/signUp` vs `/signup`)
4. `validationSchema.js` — all missing named exports added
5. `CheckoutForm.jsx` — `toEditShowtime` imported from wrong slice
6. `AdminPage.jsx` — `toFetchMovies` → `fetchAllMovies`
7. `seed.js` — mismatched model fields (endTime, screenType, cast structure)
8. Contact Us — fully wired (route + controller + model + admin view)
9. Stripe removed — replaced with dummy payment (no API key required)
