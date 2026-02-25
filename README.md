# News-API

### Overview

This repository contains a simple News API backend that supports:

- **Secure signup and login** with JWT-based authentication.
- **Role-based access control** for authors and readers.
- **Article lifecycle management** with soft deletion.
- **Public news feed** with filtering and pagination.
- **Read tracking and daily analytics** aggregated per article.
- **Author dashboard** showing view counts per article.

All backend code lives under the `backend/` directory so automated build scripts can discover it easily.

### Directory Structure

```text
.
├── README.md
├── .env.example
└── backend
    ├── index.ts
    ├── server.js
    ├── package.json
    ├── src
    │   ├── config
    │   ├── controllers
    │   ├── jobs
    │   ├── middleware
    │   ├── routes
    │   ├── install
    │   └── utils
    └── 
```

### Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/nuhajoy/News-API
   cd News-API
   ```

2. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and set your own MySQL credentials and `JWT_SECRET`.

3. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

4. **Create database tables**

   Make sure the database defined in `DB_NAME` exists, then run:

   ```bash
   npm run db:install
   ```

5. **Start the server**

   ```bash
   npm start
   ```

   By default the API will be available at `http://localhost:4000`.

### Key Endpoints (for Postman)

- **Auth**
  - `POST /api/auth/signup` – create user (author or reader).
  - `POST /api/auth/login` – returns JWT (`sub`, `role`) and user info.

- **Articles**
  - `GET /api/articles` – public news feed with filters and pagination.
  - `GET /api/articles/:id` – view full article; records a read log.
  - `POST /api/articles` – create article (author only).
  - `GET /api/articles/me` – list own articles (author only, paginated, optional `includeDeleted=true`).
  - `PUT /api/articles/:id` – update own article (author only).
  - `DELETE /api/articles/:id` – soft delete own article (author only).

- **Author**
  - `GET /api/author/dashboard` – author performance dashboard (paginated, based on aggregated analytics).

For protected endpoints, send an `Authorization: Bearer <token>` header using the JWT returned from the login endpoint.
