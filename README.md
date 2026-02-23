# Jurnal Application

A production-ready, full-stack journal application built with **Next.js 14** (App Router), **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 14 (App Router)             |
| Language       | TypeScript                          |
| Styling        | Tailwind CSS + shadcn/ui            |
| Database       | PostgreSQL                          |
| ORM            | Prisma                              |
| Authentication | JWT (jose) + bcryptjs               |
| UI Components  | Radix UI + Lucide Icons             |

## Project Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts
│   │   ├── signup/route.ts
│   │   ├── logout/route.ts
│   │   └── me/route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── providers/
│   │   └── auth-provider.tsx
│   ├── ui/ (shadcn components)
│   └── navbar.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   └── utils.ts
├── services/
│   └── auth.service.ts
└── middleware.ts
prisma/
└── schema.prisma
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or a remote PostgreSQL instance
- npm

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example env file and update values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jurnal_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars!!"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup Database

Generate the Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

1. **Signup** — User registers with name, email, and password → password is hashed with bcrypt → user is stored in PostgreSQL → JWT is signed and set as HTTP-only cookie
2. **Login** — User provides email/password → password is verified → JWT is issued via cookie
3. **Protected Routes** — Next.js middleware validates the JWT on every request to `/dashboard/*` → redirects to `/login` if invalid
4. **Logout** — Auth cookie is cleared

## API Routes

| Method | Endpoint            | Description                |
|--------|---------------------|----------------------------|
| POST   | `/api/auth/signup`  | Register a new user        |
| POST   | `/api/auth/login`   | Authenticate a user        |
| POST   | `/api/auth/logout`  | Clear auth cookie          |
| GET    | `/api/auth/me`      | Get current user (protected)|

## License

MIT
