campus-rental/
│
├── database/
│   └── schema.sql              ← Run this FIRST in MySQL before anything else
│
├── README.md
│
├── frontend/                   ← Everything React lives here
│   ├── index.html              ← HTML shell with <div id="root"> — Vite's entry point
│   ├── vite.config.js          ← Proxies /api/* to localhost:8080
│   ├── tailwind.config.js      ← Registers custom fonts, scans src/**/*.jsx
│   ├── package.json            ← npm dependencies
│   │
│   └── src/
│       ├── main.jsx            ← BOOTSTRAP — ReactDOM.createRoot().render(<App />)
│       ├── App.jsx             ← Root component — all <Route> definitions go here
│       ├── index.css           ← @tailwind directives + Google Fonts + global helpers
│       │
│       ├── pages/              ← One file per full-screen view
│       │   ├── Home.jsx        ← Browse grid with filters + pagination
│       │   ├── ItemDetail.jsx  ← Item view + rental request form
│       │   ├── MapView.jsx     ← React Leaflet map + marker pins
│       │   ├── Dashboard.jsx   ← Student hub: borrowing / lending / listings tabs
│       │   ├── CreateListing.jsx  ← 4-step wizard: details, price, map pin, photos
│       │   ├── AdminPortal.jsx ← Moderation: stats, users, transactions, disputes
│       │   ├── Login.jsx       ← Login form (also exports Register component)
│       │   └── VerifyEmail.jsx ← Reads ?token= and calls /auth/verify-email
│       │
│       ├── components/         ← Shared UI pieces used by multiple pages
│       │   ├── Navbar.jsx      ← Sticky nav bar, role-aware links
│       │   └── ItemCard.jsx    ← Grid card for one rental item
│       │
│       ├── hooks/              ← Custom React hooks
│       │   └── useAuth.jsx     ← AuthContext — JWT state, login(), logout()
│       │
│       └── utils/              ← Non-React helpers
│           └── api.js          ← Shared Axios instance with base URL + interceptor
│
└── backend/                    ← Everything Java lives here
    ├── pom.xml                 ← Maven: Spring Boot 3.2, JPA, Security, JWT, Mail
    │
    └── src/main/
        ├── resources/
        │   └── application.properties  ← DB URL, JWT secret, SMTP, CORS origin
        │
        └── java/com/campusrental/
            │
            ├── entity/                 ← JPA classes mapped to database tables
            │   ├── User.java           ← → Users table
            │   ├── Item.java           ← → Items table (JSON cols for images/tags)
            │   ├── RentalTransaction.java ← → Rental_Transactions table
            │   ├── Review.java         ← → Reviews table
            │   └── Category.java       ← → Categories table
            │
            ├── repository/             ← Spring Data JPA interfaces
            │   └── Repositories.java   ← ItemRepo (overlap query), UserRepo, TxRepo
            │
            ├── service/                ← Business logic (no HTTP knowledge)
            │   └── Services.java       ← AuthService (email verify), ItemService (images)
            │
            ├── controller/             ← HTTP endpoints (@RestController)
            │   ├── AuthController.java ← POST /auth/register, /login, /verify-email
            │   └── Controllers.java    ← ItemController, TransactionController, AdminController
            │
            ├── security/               ← Spring Security wiring
            │   └── SecurityConfig.java ← JwtUtils + JwtAuthFilter + filter chain config
            │
            ├── dto/                    ← Request/Response data shapes (in AuthController.java)
            │   └── (RegisterRequest, LoginRequest, UserDTO, ApiResponse, etc.)
            │
            └── config/                 ← Extra beans (CORS source lives in SecurityConfig)