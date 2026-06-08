# TradeFlow (Jurnal Application)

TradeFlow is a comprehensive, production-ready full-stack trading journal application designed to help traders track, analyze, and improve their trading performance. Built with **Next.js 14** (App Router), **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

## 🌟 Features

- **Dashboard**: High-level overview of trading performance, win rates, profit/loss, and recent activity.
- **Trade Journaling**: Log trades with deep details including entry/exit points, take profit/stop loss, RR ratio, screenshots, psychology during trades, and behavior tags.
- **Account Management**: Support for multiple accounts (Funded, Personal, Demo) with different brokers, balances, and statuses.
- **Goals & Habits Tracking**: Set customized goals (Profit, Consistency, Psychology) and track daily trading habits to build discipline.
- **AI Trading Coach**: Leverage AI to analyze your trades, receive quality scores, psychological profiling, risk evaluation, and tailored improvement plans.
- **Transactions & Payouts**: Manage deposits, withdrawals, and track prop firm profit splits.
- **Data Management**: Import/Export trading data seamlessly using Excel (xlsx) and ZIP formats.
- **Calculators & Tools**: Position sizing calculators, checklists, and an economic calendar integration to stay on top of market news.

## 🛠 Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 14 (App Router)             |
| Language       | TypeScript                          |
| Styling        | Tailwind CSS + shadcn/ui + clsx     |
| Database       | PostgreSQL (SQLite fallback)        |
| ORM            | Prisma                              |
| Authentication | NextAuth.js + bcryptjs              |
| Charts & UI    | Recharts + Radix UI + Lucide React  |
| File parsing   | xlsx + jszip                        |

## 📁 Project Structure

```text
src/
├── app/                  # Next.js App Router (Frontend Pages & Layouts)
│   ├── accounts/         # Account management page
│   ├── ai-coach/         # AI analysis and insights
│   ├── api/              # Backend API routes
│   ├── calculator/       # Position sizing calculators
│   ├── checklist/        # Pre-trade and post-trade checklists
│   ├── dashboard/        # Main overview
│   ├── data-management/  # Import/Export functionality
│   ├── goals/            # Goal and Habit tracking
│   ├── journal/          # Detailed trade logs
│   ├── trades/           # Trade entries
│   ├── withdrawals/      # Transactions and Payouts
│   └── (auth)/           # Login and Signup pages
├── components/           # Reusable UI components
│   ├── layout/           # Shared layouts (Sidebar, Navbar)
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature specific components
├── lib/                  # Utility functions (utils.ts, prisma.ts)
└── types/                # Global TypeScript definitions

prisma/
└── schema.prisma         # Prisma Database Schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm
- PostgreSQL running locally or remotely (optional, SQLite can be used as fallback)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update your `.env` file with appropriate values:

```env
# Database configuration
# For Postgres, uncomment and customise the line below:
# DATABASE_URL="postgresql://user:password@localhost:5432/tradeflow?schema=public"

# If left empty, Prisma will automatically use a local SQLite DB (`file:./dev.db`)
DATABASE_URL=""

# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-in-production"

# Any AI API keys for the AI Coach (if applicable)
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Setup Database

Generate the Prisma client and push the schema to your database. This step creates the required tables (`Trade`, `Account`, `Goal`, `Habit`, `AiAnalysis`, `User`, `Transaction`).

```bash
npm run build # or manually run: npx prisma generate && npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Flow

1. **Signup**: Users register with name, email, and password. The password is hashed using `bcryptjs` and stored securely.
2. **Login**: Users authenticate using `NextAuth.js` credentials provider.
3. **Session Management**: JWTs are managed by NextAuth, handling session cookies and validation across protected routes.
4. **Protected Routes**: Next.js Middleware protects internal application routes (`/dashboard`, `/trades`, etc.) from unauthenticated access.

## 🔌 API Routes Overview

TradeFlow exposes several RESTful API endpoints powered by Next.js Route Handlers:

| Endpoint                  | Description                                      |
|---------------------------|--------------------------------------------------|
| `/api/auth/[...nextauth]` | NextAuth.js handling for login/session management|
| `/api/accounts`           | CRUD operations for Trading Accounts             |
| `/api/trades`             | CRUD operations for Trades and Journal entries   |
| `/api/transactions`       | Manage deposits, withdrawals, and prop firm splits|
| `/api/goals`              | Create and update Trading Goals                  |
| `/api/habits`             | Track daily habits and checklist compliance      |
| `/api/ai-coach`           | Request AI analysis on trading data              |
| `/api/data-management`    | Import/Export data logic                         |
| `/api/economic-calendar`  | Fetch relevant financial news and events         |

## 🛠 Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Generates Prisma client and builds the application for production.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint to catch syntax and styling issues.

## 📜 License

MIT License. See the `LICENSE` file for more details.
