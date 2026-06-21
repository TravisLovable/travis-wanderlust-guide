// Canonical place type for destination/location selections across the app.
// Superset of the two shapes that previously lived in hooks: useMapboxGeocoding
// (subset) and useGooglePlaces (this superset). Relocated here so the type
// outlives the now-deleted useMapboxGeocoding hook; useGooglePlaces re-exports it.

export interface SelectedPlace {
  name: string;
  formatted_address: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  region?: string;
  // Onboarding "Home City" extras (optional; destination consumers ignore them):
  // admin-area short code (e.g. "NY") and country long name (e.g. "Portugal").
  region_code?: string;
  country?: string;
  place_id: string;
}
