# Visa Widget Setup Guide

## Overview
This guide helps you set up the enhanced visa requirements widget with the "cheeky hybrid approach" that combines Supabase database storage with OpenAI streaming responses.

## Features Implemented
- ✅ Database-first approach with fallback to AI
- ✅ Streaming text responses with highlighting
- ✅ Visual indicators for data sources (Database vs AI)
- ✅ Citation of sources and last updated dates
- ✅ Links to official verification sources

## Setup Steps

### 1. Database Migration
Run the database migration to create the visa requirements table:

```bash
# Apply the migration
supabase db push

# Or if using Supabase CLI locally
supabase migration up
```

### 2. Environment Variables
Set up your OpenAI API key in Supabase:

```bash
# Create a .env.local file in the supabase folder
echo "OPENAI_API_KEY=your_actual_openai_api_key" > supabase/.env.local

# Deploy the secrets to Supabase
supabase secrets set --env-file ./supabase/.env.local
```

### 3. Deploy the Updated Function
Deploy the enhanced visa-requirements function:

```bash
supabase functions deploy visa-requirements
```

## How It Works

### Data Flow
1. **User searches for a destination** → Widget shows loading state
2. **Check Supabase database first** → If data exists, use it as context
3. **Stream OpenAI response** → AI interprets data and provides conversational explanation
4. **Display with highlighting** → Important terms are highlighted in yellow
5. **Show citations** → Data source and last updated information displayed
6. **Provide verification links** → Link to official government sources

### Widget States
- **Loading**: Spinning indicator with "Analyzing visa requirements..."
- **Streaming**: AI content appears word by word with blinking cursor
- **Complete**: Full response with source citations and verification links
- **Error**: Fallback to hardcoded data with error message

### Data Sources
- 🗄️ **Database Icon**: Information from structured visa requirements table
- 🤖 **Bot Icon**: AI-generated analysis (with or without database context)
- 📊 **Shield Icon**: Fallback hardcoded data

## Testing
Test with different destinations to see the hybrid approach in action:
- **Countries in database**: France, Japan, UK, Brazil, Peru, Australia, China, India
- **Countries not in database**: Any other destination will use pure AI analysis

## Benefits
- **Accuracy**: Structured data when available
- **Coverage**: AI fills gaps for destinations not in database
- **User Experience**: Engaging streaming text with visual feedback
- **Transparency**: Clear indication of data sources and freshness
- **Verification**: Direct links to official sources