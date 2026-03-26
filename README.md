# CampusRent 🎓

> Peer-to-peer campus rental marketplace — students lend and borrow everyday items with verified campus email accounts.

---

## Architecture Overview

```
campus-rental/
├── database/
│   └── schema.sql              ← MySQL DDL (tables, indexes, triggers)
├── backend/                    ← Spring Boot 3.2 / Java 21
│   ├── pom.xml
│   └── src/main/java/com/campusrental/
│       ├── entity/             ← JPA Entities (User, Item, RentalTransaction, Review, Category)
│       ├── repository/         ← Spring Data JPA repositories
│       ├── service/            ← Business logic (Auth, Item, Rental, Admin)
│       ├── controller/         ← REST controllers (Auth, Item, Transaction, Admin)
│       ├── dto/                ← Request / Response DTOs
│       ├── security/           ← JWT filter, SecurityConfig, JwtUtils
│       └── config/             ← CORS, Security configuration
└── frontend/                   ← React 18 + Vite + Tailwind
    └── src/
        ├── pages/
        │   ├── Home.jsx        ← E-commerce grid with filters + pagination
        │   ├── ItemDetail.jsx  ← Item page + rental request form
        │   ├── MapView.jsx     ← React Leaflet interactive campus map
        │   ├── Dashboard.jsx   ← Student rental management hub
        │   ├── CreateListing.jsx ← 4-step listing wizard with map picker
        │   ├── AdminPortal.jsx ← Moderation dashboard
        │   ├── Login.jsx       ← Authentication
        │   └── Register.jsx    ← Campus email registration
        ├── components/
        │   ├── Navbar.jsx      ← Sticky nav with role-aware links
        │   └── ItemCard.jsx    ← Reusable grid card component
        ├── hooks/
        │   └── useAuth.jsx     ← Auth context (JWT persistence)
        └── utils/
            └── api.js          ← Axios instance with interceptors
```

---

## Database Schema

### Tables
| Table | Key Columns | Notes |
|-------|------------|-------|
| `Users` | `user_id`, `email_id` (UNIQUE), `role`, `is_verified` | Campus email required |
| `Categories` | `category_id`, `name` | 8 seeded categories |
| `Items` | `item_id`, `owner_id`, `daily_price`, `latitude`, `longitude`, `status` | JSON columns for `image_urls`, `tags` |
| `Rental_Transactions` | `transaction_id`, `borrower_id`, `owner_id`, `status`, `security_deposit` | Full lifecycle PENDING → COMPLETED |
| `Reviews` | `review_id`, `rating` (1-5), `review_type` | Unique per transaction + reviewer + type |

### Trigger
A MySQL trigger automatically updates `Users.rating_avg` and `Users.rating_count` on every new review insert.

---

## Backend API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register with `.edu` email (validates domain) |
| POST | `/login` | Returns JWT + user object |
| GET | `/verify-email?token=` | Confirm campus email |
| POST | `/forgot-password` | Request reset email |
| POST | `/reset-password` | Set new password |

### Items (`/api/items`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Paginated grid with filters (category, price, search, sort) |
| GET | `/map` | Public | All available items with coordinates for Leaflet |
| GET | `/{id}` | Public | Item detail + increments view count |
| POST | `/` | Student | Create listing (multipart with images) |
| PUT | `/{id}` | Owner | Update listing details |
| PATCH | `/{id}/status` | Owner | Toggle AVAILABLE / PAUSED |
| DELETE | `/{id}` | Owner | Soft-delete (sets REMOVED) |
| GET | `/my` | Student | Owner's own listings |

### Transactions (`/api/transactions`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Submit rental request |
| PATCH | `/{id}/respond` | Owner approves/rejects |
| PATCH | `/{id}/activate` | Mark item as picked up |
| PATCH | `/{id}/complete` | Mark rental as returned |
| PATCH | `/{id}/dispute` | Raise a dispute |
| GET | `/as-borrower` | Borrower's transaction history |
| GET | `/as-owner` | Owner's incoming requests |

### Admin (`/api/admin`) — Role: ADMIN only
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Platform stats |
| GET | `/users` | All students (filter by verified) |
| PATCH | `/users/{id}/verify` | Manually verify a student |
| GET | `/transactions` | All transactions (filter by status) |
| GET | `/disputes` | Open dispute queue |
| PATCH | `/disputes/{id}/resolve` | Resolve a dispute |
| GET | `/reviews/flagged` | Flagged reviews |
| DELETE | `/reviews/{id}` | Remove a review |

---

## Setup Instructions

### Prerequisites
- Java 21, Maven 3.9+
- Node 20+, npm
- MySQL 8.0+

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend

# Set environment variables (or create .env file)
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=your-256-bit-secret-key-here
export MAIL_USERNAME=your@gmail.com
export MAIL_PASSWORD=your-app-password

mvn spring-boot:run
# API available at http://localhost:8080/api
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

---

## Key Design Decisions

### Campus Email Enforcement
- **Backend (primary):** `@Pattern` annotation on `RegisterRequest.emailId` validates `.edu`, `.ac.in`, `.ac.uk` domains. Configurable via `app.campus.email-domains` property.
- **Frontend (UX):** Register form shows inline error for non-campus emails before submission.
- **Verification:** JWT login is blocked until email is verified via the token sent to inbox.

### Double-booking Prevention
The `ItemRepository` has a JPQL query that counts overlapping `APPROVED` or `ACTIVE` transactions for a given item + date range. The `RentalService` calls this before creating any new transaction.

### Security Architecture
- Stateless JWT (no sessions) via Spring Security filter chain
- `BCryptPasswordEncoder` with cost factor 12
- Method-level security (`@PreAuthorize("hasRole('ADMIN')")`) on all admin endpoints
- CORS restricted to configured frontend origin

### Map View
React Leaflet renders all `AVAILABLE` items as custom pin markers. Clicking a marker shows a popup with a direct link to the item. A side-panel list syncs with the selected marker via shared state. The `/items/map` endpoint returns a lightweight projection (no heavy fields) for performance.

### No Swipe Mechanics
The UI strictly uses a traditional **e-commerce grid** (Home page) and **map view** (MapView page). No card-swipe or Tinder-style interaction patterns are used anywhere in the codebase.

---

## Production Considerations

| Area | Recommendation |
|------|---------------|
| Email verification tokens | Replace `ConcurrentHashMap` with Redis (TTL = 24h) |
| Image storage | Replace local filesystem with AWS S3 / Cloudflare R2 |
| Password reset | Same Redis migration as email tokens |
| Database | Enable `spring.jpa.hibernate.ddl-auto=validate` in prod |
| JWT | Use asymmetric RS256 keys in production |
| Search | Add Elasticsearch for full-text search at scale |
| Payments | Integrate Stripe for security deposit escrow |
| Notifications | WebSocket or Firebase for real-time rental status updates |
