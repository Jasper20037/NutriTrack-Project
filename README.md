# SimplePark Dashboard

A modern, full-stack parking management dashboard built with React.js, Next.js, and real-time data visualization. Monitor parking sessions, manage bookings, analyze trends, and visualize parking data with interactive maps and charts.

![SimplePark Dashboard](https://img.shields.io/badge/SimplePark-Dashboard-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)

## Features

### **Dashboard & Analytics**

- Parking session monitoring
- Interactive charts and visualizations (Recharts)
- Occupancy rate tracking with time-based filtering
- Peak/off-peak moment analysis
- Revenue tracking and financial metrics

### **Interactive Mapping**

- Mapbox-powered heatmaps showing parking density
- Session visualization by location
- City-based parking distribution
- Interactive markers with session details

### **Data Management**

- **Parking Sessions**: Monitor active and completed sessions
- **Bookings**: Track reservations and their status
- **Private Spots**: Manage parking spots with features (camera, gates, covered, charger)
- **Users**: View user accounts and their parking behavior
- **Vehicles**: Track registered vehicles and their owners
- **Zones**: Manage parking zones and selling points

### **Modern UI/UX**

- Responsive design for desktop, tablet, and mobile
- Dark/light theme support
- Accessible components (WCAG compliant)
- Smooth animations and transitions
- Professional dashboard layout

## Tech Stack

### **Frontend**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Maps**: Mapbox GL JS
- **Icons**: Lucide React
- **Date Handling**: date-fns

### **Backend**

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0
- **API**: RESTful endpoints

### **Development Tools**

- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Package Manager**: npm

## Quick Start

### Prerequisites

Make sure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **MySQL** 8.0 or higher

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/simplepark-dashboard.git
cd simplepark-dashboard
\`\`\`

### 2. Install Dependencies

\`\`\`bash

# Install frontend dependencies

npm install

# Install backend dependencies

cd api-server
npm install
cd ..
\`\`\`

### 3. Database Setup

1. Create a MySQL database named `simplepark`
2. Import your existing database schema and data
3. Update database credentials in `api-server/server.js`:

\`\`\`javascript
const dbConfig = {
host: "localhost",
user: "your_username",
password: "your_password",
database: "simplepark",
// ... other config
}
\`\`\`

### 4. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env

# Mapbox (for maps)

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# API Configuration

NEXT_PUBLIC_API_URL=http://localhost:3001/api
\`\`\`

### 5. Start the Application

\`\`\`bash

# Terminal 1: Start the API server

cd api-server
npm start

# Terminal 2: Start the frontend (in a new terminal)

npm run dev
\`\`\`

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/tables

## Project Structure

\`\`\`
simplepark-dashboard/
├── app/ # Next.js App Router pages
│ ├── analytics/ # Analytics dashboard
│ ├── bookings/ # Bookings management
│ ├── parking-sessions/ # Session monitoring
│ ├── private-spots/ # Private parking spots
│ ├── users/ # User management
│ ├── vehicles/ # Vehicle tracking
│ ├── zones/ # Zone management
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Main dashboard
├── components/ # Reusable React components
│ ├── ui/ # shadcn/ui components
│ ├── charts/ # Chart components
│ ├── notifications/ # Notification system
│ ├── dashboard-layout.tsx # Main layout component
│ ├── map-view.tsx # Mapbox integration
│ └── stat-card.tsx # Statistics cards
├── lib/ # Utility functions
│ ├── api.ts # API service layer
│ ├── chart-theme.ts # Chart styling
│ └── utils.ts # Helper functions
├── api-server/ # Express.js backend
│ ├── server.js # Main server file
│ └── package.json # Backend dependencies
├── public/ # Static assets
└── README.md # This file
\`\`\`

## API Endpoints

The backend provides RESTful endpoints for all database tables:

### **Core Endpoints**

- `GET /api/accounts` - User accounts
- `GET /api/bookings` - Parking bookings
- `GET /api/parking_sessions` - Parking sessions
- `GET /api/parking_spots` - Private parking spots
- `GET /api/vehicles` - Registered vehicles
- `GET /api/zones` - Parking zones
- `GET /api/selling_points` - Selling points

### **Utility Endpoints**

- `GET /` - API information
- `GET /health` - Health check
- `GET /api/tables` - List all available tables
- `GET /api/:tableName/schema` - Get table schema

### **Query Parameters**

- `limit` - Number of records (max 1000)
- `offset` - Pagination offset

Example:
\`\`\`bash
curl "http://localhost:3001/api/parking_sessions?limit=50&offset=0"
\`\`\`

## Database Schema

The application works with the following main tables:

- **accounts** - User account information
- **bookings** - Parking reservations
- **parking_sessions** - Active/completed parking sessions
- **parking_spots** - Private parking spot details
- **vehicles** - Registered vehicle information
- **drivers** - Driver profiles
- **hosts** - Parking spot hosts
- **zones** - Parking zone definitions
- **selling_points** - Payment/booking locations

## Customization

### **Themes**

The application supports light/dark themes. Customize colors in:

- `app/globals.css` - CSS custom properties
- `lib/chart-theme.ts` - Chart color schemes

### **Charts**

Modify chart configurations in:

- `lib/chart-theme.ts` - Global chart settings
- Individual chart components in `components/charts/`

### **Maps**

Update map settings in:

- `components/map-view.tsx` - Mapbox configuration
- Environment variables for API keys

## Deployment

### **Frontend (Vercel)**

\`\`\`bash
npm run build

# Deploy to Vercel, Netlify, or your preferred platform

\`\`\`

### **Backend (Production)**

\`\`\`bash
cd api-server
npm install --production

# Deploy to your server, Docker, or cloud platform

\`\`\`

### **Environment Variables for Production**

\`\`\`env

# Database

DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=simplepark

# Mapbox

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_production_mapbox_token

# API

NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
\`\`\`

## Development

### **Running Tests**

\`\`\`bash
npm run test
\`\`\`

### **Linting**

\`\`\`bash
npm run lint
npm run lint:fix
\`\`\`

### **Type Checking**

\`\`\`bash
npm run type-check
\`\`\`

### **Building for Production**

\`\`\`bash
npm run build
npm start
\`\`\`

## Performance

### **Frontend Optimizations**

- Server-side rendering (SSR) with Next.js
- Image optimization
- Code splitting and lazy loading
- Efficient re-rendering with React

### **Backend Optimizations**

- MySQL connection pooling
- Efficient database queries
- CORS configuration
- Error handling and logging

### **Database Optimizations**

- Indexed columns for fast queries
- Connection pooling
- Query optimization

## Security

- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: TypeScript type checking
- **Error Handling**: Secure error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Use meaningful component and variable names
- Write self-documenting code
- Add comments for complex logic
- Ensure responsive design
- Test on multiple browsers

## License

This project is licensed under the MIT License - see the X(LICENSE) file for details.

## Support

### **Common Issues**

**Database Connection Failed**
\`\`\`bash

# Check MySQL service is running

sudo service mysql start

# Verify credentials in api-server/server.js

\`\`\`

**Mapbox Not Loading**
\`\`\`bash

# Verify your Mapbox token in .env.local

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token_here
\`\`\`

**API Endpoints Not Working**
\`\`\`bash

# Ensure API server is running on port 3001

cd api-server && npm start
\`\`\`

### **Getting Help**

- Email: X

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful and accessible components
- [Mapbox](https://www.mapbox.com/) - Interactive maps and location data
- [Recharts](https://recharts.org/) - Composable charting library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ for modern parking management**

_SimplePark Dashboard - Making parking data beautiful and actionable_
