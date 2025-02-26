# Puppy Spa Management System

A full-stack application for managing a puppy grooming spa, built with NestJS and Next.js.

## Features

- **Daily Appointment Management**
  - Add new appointments with pet and owner details
  - Select from multiple service types (Grooming, Bathing, Nail Trimming)
  - Time slot management with availability checking
  - Mark appointments as Completed, Pending, or Cancelled

- **Interactive Interface**
  - Drag and drop appointment reordering
  - Real-time status updates
  - Responsive design for all screen sizes
  - Date-based navigation

- **Business Analytics**
  - Daily revenue tracking
  - Service completion statistics
  - Historical data analysis
  - Appointment status breakdown

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Project Structure

### Backend (NestJS)

```
backend/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── puppy.entity.ts
│   │   │   │   └── waiting-list.entity.ts
│   │   │   └── repositories/
│   │   │       └── waiting-list.repository.ts
│   │   └── services/
│   │       └── waiting-list.service.ts
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── database.config.ts
│   │   └── persistence/
│   │       └── mikro-orm/
│   │           └── migrations/
│   ├── interface/
│   │   ├── controllers/
│   │   │   └── waiting-list.controller.ts
│   │   └── dtos/
│   │       └── waiting-list.dto.ts
│   ├── migrations/
│   │   └── *.ts
│   ├── app.module.ts
│   ├── main.ts
│   └── mikro-orm.config.ts
├── test/
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

#### Directory Structure Explanation

- **src/**: Main source code directory
  - **core/**: Core business logic
    - **domain/**: Domain entities and repositories
    - **services/**: Business logic services
  - **infrastructure/**: External concerns and configurations
    - **config/**: Configuration files
    - **persistence/**: Database-related code
  - **interface/**: Application interface layer
    - **controllers/**: API endpoints
    - **dtos/**: Data Transfer Objects
  - **migrations/**: Database migrations

### Frontend (Next.js)

```
frontend/
├── src/
│   ├── app/
│   │   └── page.tsx
│   ├── components/
│   │   ├── AddPuppyForm.tsx
│   │   ├── DashboardStats.tsx
│   │   ├── HistoricalLists.tsx
│   │   ├── SearchHistory.tsx
│   │   ├── Tabs.tsx
│   │   ├── WaitingList.tsx
│   │   └── WaitingListTable.tsx
│   ├── config/
│   │   └── environment.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── api-client.ts
│       └── time-slots.ts
├── public/
├── .env.development
├── .env.production
└── package.json
```

## Environment Setup

### Backend

1. Create `.env` file:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/puppy_spa
CORS_ORIGIN=http://localhost:3000
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Run migrations:
```bash
npm run migration:up
```

### Frontend

1. Create environment files:

`.env.development`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

`.env.production`:
```env
NEXT_PUBLIC_API_URL=https://puppy-spa-api.onrender.com/api
```

2. Install dependencies:
```bash
cd frontend
npm install
```

## Development

### Backend
```bash
cd backend
npm run start:dev
```

### Frontend
```bash
cd frontend
npm run dev
```

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

### Environment Variables

#### Backend (Render)
- `NODE_ENV`: production
- `PORT`: 3001
- `CORS_ORIGIN`: https://puppy-spa-beta.vercel.app
- `DATABASE_URL`: (from Render PostgreSQL)

#### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: https://puppy-spa-api.onrender.com/api

## API Endpoints

### Waiting List
- `GET /api/waiting-list/by-date/:date` - Get appointments for a specific date
- `POST /api/waiting-list/create` - Create new appointment
- `PUT /api/waiting-list/by-date/:date/:id/update` - Update appointment
- `PUT /api/waiting-list/by-date/:date/:id/service` - Toggle service status
- `PUT /api/waiting-list/by-date/:date/:id/status` - Update appointment status
- `PUT /api/waiting-list/by-date/:date/reorder` - Reorder appointments
- `GET /api/waiting-list/search` - Search appointments
- `GET /api/waiting-list/history` - Get historical appointments

## Technologies

- **Backend**:
  - NestJS
  - MikroORM
  - PostgreSQL
  - TypeScript

- **Frontend**:
  - Next.js 13 (App Router)
  - TailwindCSS
  - TypeScript
  - React Beautiful DnD

## License

MIT 

## Vercel Deployment

2. Go to [Vercel](https://vercel.com) and:
   - Create new project
   - Import your GitHub repository
   - Select the frontend directory as root
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://puppy-spa-api.onrender.com/api
     ```
   - Deploy to: https://puppy-spa-beta.vercel.app

3. After deployment:
   - Add your Vercel domain (https://puppy-spa-beta.vercel.app) to backend CORS settings
   - Update frontend API URL if needed

## Deployment to Render

3. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://puppy-spa-beta.vercel.app
   ``` 