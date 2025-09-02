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

### 1. Database Setup (Optional - Widget works without this!)

**Option A: Manual Setup (Recommended)**
1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/jmbjxlijwojvavmmzpmo/sql
2. Copy and paste the contents of `create_visa_table_manual.sql`
3. Click "Run" to create the table and populate sample data

**Option B: CLI Migration (if you can resolve migration conflicts)**
```bash
# Try applying the migration
supabase db push
```

### 2. OpenAI API Key (Optional - Widget works without this!)

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to: https://supabase.com/dashboard/project/jmbjxlijwojvavmmzpmo/settings/functions
2. Add Environment Variable: `OPENAI_API_KEY` = your actual key

**Option B: Via CLI**
```bash
# Create a .env.local file in the supabase folder
echo "OPENAI_API_KEY=your_actual_openai_api_key" > supabase/.env.local

# Deploy the secrets to Supabase
supabase secrets set --env-file ./supabase/.env.local
```

### 3. Deploy the Updated Function ✅ DONE!

The enhanced visa-requirements function is already deployed and working:

```bash
supabase functions deploy visa-requirements  # ✅ Already completed!
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
