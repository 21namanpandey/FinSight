# FinSight - Personal Finance Tracker

A comprehensive personal finance tracking application built with Next.js, Prisma, PostgreSQL, and Redis.

## Features

- 📊 **Transaction Management**: Add, edit, and delete financial transactions
- 💰 **Budget Tracking**: Set monthly budgets and track spending against them
- 📈 **Analytics Dashboard**: Visual insights with charts and spending trends
- 🔍 **Category-wise Analysis**: Organize transactions by categories
- ⚡ **Real-time Updates**: Instant updates with optimistic UI
- 🎨 **Beautiful UI**: Modern design with dark/light mode support
- 📱 **Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Caching**: Redis
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finsight
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the database services**
   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the environment variables as needed.

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination and filtering)
- `POST /api/transactions` - Create a new transaction
- `GET /api/transactions/[id]` - Get a specific transaction
- `PUT /api/transactions/[id]` - Update a transaction
- `DELETE /api/transactions/[id]` - Delete a transaction

### Budgets
- `GET /api/budgets` - Get all budgets (with filtering)
- `POST /api/budgets` - Create or update a budget
- `GET /api/budgets/[id]` - Get a specific budget
- `PUT /api/budgets/[id]` - Update a budget
- `DELETE /api/budgets/[id]` - Delete a budget

### Dashboard
- `GET /api/dashboard` - Get dashboard analytics and insights

## Database Schema

### Transaction
- `id`: Unique identifier (CUID)
- `description`: Transaction description
- `amount`: Transaction amount (Float)
- `date`: Transaction date
- `category`: Transaction category (Enum)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Budget
- `id`: Unique identifier (CUID)
- `category`: Budget category (Enum)
- `amount`: Budget amount (Float)
- `month`: Budget month (YYYY-MM format)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Categories

The application supports the following transaction categories:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Travel
- Education
- Groceries
- Rent
- Other

## Caching Strategy

Redis is used for caching expensive dashboard queries:
- Dashboard statistics (5 minutes TTL)
- Monthly expenses (10 minutes TTL)
- Budget alerts (3 minutes TTL)

Cache is automatically invalidated when relevant data changes.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Docker Services

The application uses Docker Compose for local development:

- **PostgreSQL**: Database server (port 5432)
- **Redis**: Caching server (port 6379)
- **Adminer**: Database administration tool (port 8080)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.