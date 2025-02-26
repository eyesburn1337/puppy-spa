# Puppy Spa Management System

A full-stack application for managing a pet grooming business's daily appointments and records.

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

```
puppy-spa/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js app router
│   │   │   ├── components/
│   │   │   │   ├── AddPuppyForm.tsx    # New appointment form
│   │   │   │   ├── DashboardStats.tsx  # Statistics display
│   │   │   │   ├── SearchHistory.tsx   # Historical search
│   │   │   │   ├── Tabs.tsx           # Tab navigation
│   │   │   │   └── WaitingListTable.tsx # Appointment list
│   │   │   ├── constants/
│   │   │   │   └── prices.ts          # Service pricing
│   │   │   └── utils/
│   │   │       └── time-slots.ts      # Time management
└── backend/          # NestJS backend application
```

## Service Types and Pricing

- Grooming: $50
- Bathing: $30
- Nail Trimming: $20

## Time Slots

- Operating hours: 9:00 AM to 5:00 PM
- 30-minute intervals
- Automatic availability checking
- Cancelled slots become available for new bookings

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:
```sql
CREATE DATABASE puppy_spa;
```

4. Configure environment:
```bash
cp .env.example .env
# Update database credentials in .env
```

5. Run migrations:
```bash
npm run migration:up
```

6. Start server:
```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Waiting List Management
- `GET /api/waiting-list/by-date/:date`
  - Get appointments for specific date
  - Returns: `{ dayListId: string, entries: WaitingListEntry[] }`

- `POST /api/waiting-list/create`
  - Create new appointment
  - Body: `{ petName, customerName, service, appointmentTime }`

- `PUT /api/waiting-list/by-date/:date/:id/update`
  - Update appointment details
  - Body: `{ petName?, customerName?, service?, status?, appointmentTime? }`

- `PUT /api/waiting-list/by-date/:date/reorder`
  - Reorder appointments
  - Body: `{ entryId: string, newIndex: number }`

### Historical Data
- `GET /api/waiting-list/history`
  - Get historical appointments
  - Query: `startDate, endDate`

- `GET /api/waiting-list/search`
  - Search appointments
  - Query: `query`

## Frontend Components

### AddPuppyForm
- New appointment creation
- Time slot selection
- Service type selection
- Validation and availability checking

### WaitingListTable
- Appointment list display
- Drag and drop reordering
- Status management
- Appointment editing

### SearchHistory
- Historical appointment search
- Filter by pet/owner name
- Date range selection

### DashboardStats
- Daily statistics
- Revenue calculation
- Status breakdowns

## Development

### Running in Development Mode
```bash
# Root directory
npm run dev # Starts both frontend and backend

# Separately
npm run dev:frontend
npm run dev:backend
```

### Database Reset
```bash
npm run db:reset
```

## License

MIT 

## Vercel Deployment

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and:
   - Create new project
   - Import your GitHub repository
   - Select the frontend directory as root
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url/api
     ```
   - Deploy

3. After deployment:
   - Add your Vercel domain to backend CORS settings
   - Update frontend API URL if needed 