import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, perPage = 10 } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const apiKey = Deno.env.get('UNSPLASH_ACCESS_KEY')
    
    if (!apiKey) {
      console.error('Unsplash API key not configured')
      // Return placeholder images as fallback
      const fallbackImages = [
        {
          id: 'fallback-1',
          urls: {
            small: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            regular: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
          },
          alt_description: `Beautiful view of ${query}`,
          user: { name: 'Unsplash', username: 'unsplash' },
          description: `Discover the beauty of ${query}`
        },
        {
          id: 'fallback-2', 
          urls: {
            small: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            regular: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
          },
          alt_description: `Travel destination ${query}`,
          user: { name: 'Unsplash', username: 'unsplash' },
          description: `Experience ${query} like never before`
        }
      ]
      
      return new Response(
        JSON.stringify({ results: fallbackImages.slice(0, perPage) }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🖼️ Fetching photos for: ${query}`)

    // Search for destination photos
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' travel destination landmark')}&per_page=${perPage}&orientation=landscape&order_by=relevant`
    
    const response = await fetch(unsplashUrl, {
      headers: {
        'Authorization': `Client-ID ${apiKey}`,
        'Accept-Version': 'v1'
      }
    })

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform the data to include only what we need
    const transformedResults = data.results.map((photo: any) => ({
      id: photo.id,
      urls: {
        small: photo.urls.small,
        regular: photo.urls.regular
      },
      alt_description: photo.alt_description || `${query} travel destination`,
      user: {
        name: photo.user.name,
        username: photo.user.username
      },
      description: photo.description || `Beautiful view of ${query}`
    }))

    console.log(`✅ Found ${transformedResults.length} photos for ${query}`)

    return new Response(
      JSON.stringify({ results: transformedResults }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error fetching photos:', error)
    
    // Return fallback on error
    const fallbackImages = [
      {
        id: 'error-fallback',
        urls: {
          small: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          regular: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
        },
        alt_description: 'Beautiful travel destination',
        user: { name: 'Unsplash', username: 'unsplash' },
        description: 'Explore amazing destinations around the world'
      }
    ]

    return new Response(
      JSON.stringify({ results: fallbackImages }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})