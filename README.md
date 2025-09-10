# Travis - Intelligent Travel Planning Platform

## Project Overview

Travis is a mobile-first travel planning platform that provides intelligent destination insights and essential travel information. This Phase 1 MVP delivers a seamless user experience for travelers seeking detailed information about their destinations.

## Completed Features (Phase 1)

- **Destination Search** - Intelligent search with Mapbox geocoding and contextual suggestions
- **Results Transition** - Smooth animated loading screens and seamless transitions  
- **Currency Converter** - Real-time exchange rates with interactive interface
- **Weather Forecast** - Current conditions and 7-day forecasts with detailed breakdowns
- **Local Holidays** - Comprehensive holiday calendar with cultural insights
- **Time Zone Comparison** - Real-time world clock with business hours considerations
- **Visa Requirements** - Hybrid AI-powered system with database-first approach and OpenAI streaming
- **Uber Availability** - Real-time ride availability with wait times and pricing
- **Photo Gallery** - High-quality destination photography with Unsplash integration
- **Pinned Locations** - User authentication-based location saving (max 10 per user)
- **User Authentication** - Secure login/signup with Supabase Auth
- **Mobile-First Design** - Responsive interface optimized for all devices

## Technical Stack

**Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion, React Query, React Router

**Backend:** Supabase (PostgreSQL + Edge Functions + Auth), Real-time subscriptions

**Integrations:** Mapbox, OpenAI, Unsplash, Weather APIs, Currency APIs, Uber API

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── widgets/         # Feature-specific widgets
│   │   ├── containers/ # Widget container components
│   │   └── presenters/ # Widget presentation components
│   └── [Feature Components]
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── types/               # TypeScript type definitions
├── utils/                # Utility functions
└── integrations/        # Third-party service integrations

supabase/
├── functions/           # Edge functions
├── migrations/          # Database migrations
└── config.toml         # Supabase configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase CLI (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd travis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Add your API keys to .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Configuration

### API Keys Required

| Service | Purpose | Required |
|---------|---------|----------|
| Supabase | Database & Auth | ✅ Required |
| Mapbox | Geocoding & Maps | ✅ Required |
| OpenAI | Visa Analysis | ✅ Required |
| Unsplash | Destination Photos | ✅ Required |
| Weather API | Forecast Data | ✅ Required |
| Currency API | Exchange Rates | ✅ Required |
| Uber API | Ride Availability | ✅ Required |

### Supabase Setup

1. **Database Migrations**
   ```bash
   supabase db reset
   ```

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy
   ```

3. **Environment Variables**
   ```bash
   supabase secrets set OPENAI_API_KEY=your_openai_key
   ```

## Key Features

**Mobile-First Design:** Responsive grid system, touch-optimized interface, progressive web app capabilities

**Security:** Supabase Auth with Row Level Security, secure API key management, GDPR compliance

**Performance:** Code splitting, image optimization, intelligent caching, bundle optimization

**Accessibility:** WCAG 2.1 compliant, keyboard navigation, screen reader support

## Quality & Deployment

**Testing:** ESLint, TypeScript, component testing, integration testing

**Deployment:** Production build via `npm run build`, recommended on Vercel/Netlify with Supabase backend

**Development:** Feature branches, TypeScript best practices, meaningful commits

## Phase 1 Deliverables

✅ **Production-Ready Application** - Fully deployed web app with mobile-first design and all core features

✅ **Source Code Repository** - Complete codebase in private GitHub repo with documentation

✅ **API Integration Framework** - Comprehensive third-party service integration with secure key management

✅ **Technical Documentation** - Setup guides, API docs, and implementation details

✅ **Live Demonstration** - Working app with real-time data and user authentication

## Out of Scope (Phase 1)

**Excluded Features:** Design iterations, alert system, loyalty features, advanced analytics, social features, offline support, advanced search


## Next Steps

- **Migrate GoDaddy DNS to Netlify** - Transfer domain management for improved deployment workflow
- **Purchase tokens from [Time and Date API](https://dev.timeanddate.com/)** - Obtain secret key for holiday data integration
- **Design audit and revision** - Comprehensive UI/UX review and optimization 

## License & Usage

This project is proprietary software developed for client use. All rights reserved.

---

**Travis - Intelligent Travel Planning Platform**  
*Phase 1 MVP - Production Ready*

