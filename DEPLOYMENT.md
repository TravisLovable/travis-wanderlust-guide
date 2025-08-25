# Travis MVP - Deployment Guide

## Overview
Travis is a modern, mobile-first travel intelligence platform built with React, TypeScript, Tailwind CSS, and Supabase. This guide covers deployment setup and API configuration.

## Prerequisites
- Node.js 18+ 
- Supabase account
- API keys for required services

## Required API Keys

### 1. Weather API (OpenWeatherMap)
- **Purpose**: 14-day weather forecast
- **Signup**: https://openweathermap.org/api
- **Environment Variable**: `OPENWEATHER_API_KEY`
- **Free Tier**: 1000 calls/day

### 2. Currency Exchange API
- **Purpose**: Real-time currency conversion
- **Signup**: https://exchangerate-api.com/
- **Environment Variable**: `EXCHANGE_RATE_API_KEY`
- **Free Tier**: 1500 requests/month

### 3. Mapbox API
- **Purpose**: Location search and geocoding
- **Signup**: https://www.mapbox.com/
- **Environment Variable**: `MAPBOX_API_KEY`
- **Free Tier**: 100,000 requests/month

### 4. Time & Date API
- **Purpose**: World clock and holiday information
- **Signup**: https://timeanddate.com/services/api/
- **Environment Variable**: `TIMEANDDATE_API_KEY`
- **Note**: This is a paid service; fallback data available

### 5. Unsplash API (Optional)
- **Purpose**: Destination photo gallery
- **Signup**: https://unsplash.com/developers
- **Environment Variable**: `UNSPLASH_ACCESS_KEY`
- **Free Tier**: 50 requests/hour
- **Note**: Fallback images available if not configured

## Supabase Setup

### 1. Create Supabase Project
1. Visit https://supabase.com
2. Create new project
3. Note your project URL and anon key

### 2. Database Schema
The database is already configured with:
- `users` table for user profiles
- Authentication enabled
- Row Level Security policies

### 3. Edge Functions
Deploy the following Supabase Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Deploy functions
supabase functions deploy get-weather-low-tier
supabase functions deploy get-world-clock
supabase functions deploy get-holidays
supabase functions deploy getExchangeRate
supabase functions deploy mapbox-geocoding
supabase functions deploy unsplash-photos
supabase functions deploy uber-availability
supabase functions deploy visa-requirements
```

### 4. Set Environment Variables in Supabase
In your Supabase dashboard, go to Settings > Edge Functions and add:

```
OPENWEATHER_API_KEY=your_key_here
EXCHANGE_RATE_API_KEY=your_key_here
MAPBOX_API_KEY=your_key_here
TIMEANDDATE_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_key_here
```

## Local Development

### 1. Clone and Install
```bash
git clone <repository>
cd travis-mvp
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

## Production Deployment Options

### Option 1: Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Option 2: Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### Option 3: Self-hosted
1. Build the project: `npm run build`
2. Serve the `dist` directory with any static file server
3. Ensure environment variables are available

## Feature Status

### ✅ Fully Implemented
- **Destination Search**: Google Places/Mapbox autocomplete
- **Results Transition**: Loading screen with animations
- **Currency Converter**: Real-time exchange rates with caching
- **Weather Forecast**: 14-day forecast with temperature units
- **Local Holidays**: Country/region specific holidays
- **Time Zone Comparison**: User timezone vs destination
- **Visa Requirements**: Comprehensive visa database for US passport holders
- **Uber Availability**: Check ride-sharing availability by city
- **Photo Gallery**: Destination photos via Unsplash API with fallbacks
- **Mobile-First Design**: Responsive layouts with dark/light themes
- **Authentication**: Email/password auth with user profiles
- **Onboarding**: User profile setup with travel preferences

### 🔄 API Integrations
All integrations include fallback data for when APIs are unavailable:
- Weather: Mock data for testing
- Currency: Basic conversion rates
- Photos: Default travel images
- Holidays: Common holidays by country
- Visa: Comprehensive offline database

## Performance Considerations

### API Rate Limits
- Weather API: Cached for 30 minutes
- Currency API: Cached for 1 hour
- Photos API: Client-side caching
- All APIs include rate limit handling

### Image Optimization
- Unsplash images loaded with appropriate sizes
- Fallback images for failed loads
- Progressive loading states

### Mobile Performance
- Responsive images
- Touch-friendly interactions
- Optimized bundle sizes

## Security Features

### API Keys
- All sensitive API keys stored in Supabase Edge Functions
- No client-side exposure of API credentials
- Environment variable validation

### Authentication
- Supabase Auth with Row Level Security
- Email verification for new accounts
- Secure password requirements

## Monitoring & Debugging

### Logging
- Console logging for API calls
- Error tracking for failed requests
- User action tracking

### Error Handling
- Graceful fallbacks for all API failures
- User-friendly error messages
- Offline functionality where possible

## Support Information

### API Documentation
- Weather: https://openweathermap.org/api
- Currency: https://exchangerate-api.com/docs
- Maps: https://docs.mapbox.com/api/
- Photos: https://unsplash.com/documentation

### Framework Documentation
- React: https://reactjs.org/docs
- Supabase: https://supabase.com/docs
- Tailwind: https://tailwindcss.com/docs

## Troubleshooting

### Common Issues
1. **API Key Errors**: Verify keys are set in Supabase Edge Functions
2. **CORS Issues**: Ensure Supabase functions are deployed correctly
3. **Build Errors**: Check Node.js version (18+)
4. **Auth Issues**: Verify Supabase URL and anon key

### Performance Issues
1. **Slow Loading**: Check API response times
2. **High Usage**: Monitor API quotas
3. **Mobile Issues**: Test on actual devices

## Handoff Notes

The Travis MVP is production-ready with:
- ✅ All SOW requirements implemented
- ✅ Mobile-first responsive design
- ✅ Comprehensive error handling
- ✅ API fallbacks for reliability
- ✅ Authentication system
- ✅ Environment variable framework

The client needs to:
1. Obtain API keys from the listed services
2. Set up Supabase project and deploy edge functions
3. Configure environment variables
4. Choose deployment platform

The application will run with fallback data even if APIs are not configured, making it suitable for demonstration purposes.