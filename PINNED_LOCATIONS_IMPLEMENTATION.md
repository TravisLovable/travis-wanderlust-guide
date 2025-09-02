# Pinned Locations Feature Implementation

## Overview
The pinned locations feature allows authenticated users to save their favorite destinations for quick access throughout the app. Locations are stored in the database per user and persist across sessions.

## Key Features

### 🔐 Authentication Required
- Only authenticated users can pin/unpin locations
- Graceful error messages for unauthenticated users
- Clear UI indicators when login is required

### 💾 Database Storage
- Pinned locations stored in `pinned_locations` table
- Linked to user accounts via foreign key
- Row Level Security (RLS) policies for data protection
- Maximum 10 pinned locations per user

### 🎯 User Interface

#### Header (Global Access)
- Pin icon with count badge for authenticated users
- Dropdown showing up to 8 pinned locations
- "Login Required" message for unauthenticated users
- Direct login button in dropdown

#### Results Page
- Pin button next to destination title
- Visual feedback (yellow when pinned, blue when not)
- Filled pin icon when location is already pinned
- Shows pinned locations in collapsible header section
- Regional suggestions for pinning (authenticated users only)

#### Homepage
- Displays pinned locations as quick-select buttons
- Shows up to 6 locations with overflow indicator
- Only visible for authenticated users
- Clicking pre-fills destination and advances to date selection

## Database Schema

```sql
CREATE TABLE public.pinned_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  formatted_address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  country_code TEXT,
  region TEXT,
  place_id TEXT,
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## API Integration

### usePinnedLocations Hook
- `pinLocation(place: SelectedPlace)` - Pin a location (auth required)
- `unpinLocation(locationId: string)` - Unpin a location (auth required)
- `isPinned(place: SelectedPlace)` - Check if location is pinned
- `clearAllPinned()` - Remove all pinned locations (auth required)
- `isAuthenticated` - Boolean indicating if user is logged in
- `isLoading` - Boolean for loading state

### Toast Notifications
- Success messages when pinning/unpinning
- Error messages for failures
- Authentication requirement notifications

## Security Features

### Row Level Security Policies
- Users can only view their own pinned locations
- Users can only create/update/delete their own pins
- Automatic cleanup when user account is deleted

### Unique Constraints
- Prevents duplicate pins per user
- Uses place_id when available, falls back to formatted_address

## Usage Examples

### Pinning a Location
```typescript
const { pinLocation, isAuthenticated } = usePinnedLocations();

const handlePin = async () => {
  if (!isAuthenticated) {
    // Shows auth required toast
    return;
  }
  
  await pinLocation(selectedPlace);
  // Shows success toast
};
```

### Displaying Pinned Locations
```typescript
const { pinnedLocations, isAuthenticated } = usePinnedLocations();

return (
  <>
    {isAuthenticated && pinnedLocations.length > 0 && (
      <div>
        {pinnedLocations.map(location => (
          <PinnedLocationButton key={location.id} location={location} />
        ))}
      </div>
    )}
  </>
);
```

## Migration Instructions

1. Apply the database migration:
   ```bash
   npx supabase db reset
   ```

2. Verify tables were created:
   ```sql
   SELECT * FROM pinned_locations LIMIT 1;
   ```

3. Test the feature:
   - Login as a user
   - Pin a location from results page
   - Verify it appears in header dropdown
   - Test navigation from pinned locations

## Files Modified

- `src/hooks/usePinnedLocations.tsx` - Main hook with database integration
- `src/components/Header.tsx` - Global pinned locations access
- `src/components/ResultsPage.tsx` - Pin button and display updates
- `src/components/HomePage.tsx` - Quick-select pinned locations
- `src/components/PinnedLocations.tsx` - Reusable component
- `supabase/migrations/20250115000000_create_pinned_locations.sql` - Database schema

## Notes

- Removed auto-pinning behavior (now explicit user action only)
- Removed language selector from header as requested
- All pinned location operations require authentication
- Graceful degradation for unauthenticated users
- Toast notifications for all user actions
