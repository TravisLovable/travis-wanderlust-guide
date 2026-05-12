import { useNavigate } from 'react-router-dom';
import { SelectedPlace } from '@/hooks/useGooglePlaces';
import { Home } from '@/components/travis/Home';

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (
    placeDetails: SelectedPlace,
    dates: { checkin: string; checkout: string },
    skipTransition = false,
  ) => {
    const searchParams = new URLSearchParams({
      destination: placeDetails.formatted_address,
      name: placeDetails.name,
      lat: placeDetails.latitude.toString(),
      lng: placeDetails.longitude.toString(),
      checkin: dates.checkin,
      checkout: dates.checkout,
      ...(placeDetails.country_code && { country: placeDetails.country_code }),
      ...(placeDetails.region && { region: placeDetails.region }),
      ...(placeDetails.place_id && { placeId: placeDetails.place_id }),
      ...(!skipTransition && { loading: 'true' }),
    });

    navigate(`/search?${searchParams.toString()}`);
  };

  return <Home onSearch={(place, dates) => handleSearch(place, dates, false)} />;
};

export default Index;
