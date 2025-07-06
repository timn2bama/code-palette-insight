import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TravelDestination {
  city: string;
  weather: string;
  suggestion: string;
  outfit: string[];
}

interface CurrentWeather {
  temperature: number;
  condition: string;
}

export const useTravelDestinations = (currentWeather: CurrentWeather) => {
  const { toast } = useToast();
  const [locationLoading, setLocationLoading] = useState(false);
  const [travelDestinations, setTravelDestinations] = useState<TravelDestination[]>([
    {
      city: "New York",
      weather: "Cool, 58°F",
      suggestion: "Bring layers and a warm coat",
      outfit: ["Wool Coat", "Sweater", "Dark Jeans", "Boots"],
    },
    {
      city: "Miami",
      weather: "Hot, 85°F",
      suggestion: "Light, breathable fabrics",
      outfit: ["Tank Top", "Linen Shorts", "Sandals", "Sunglasses"],
    },
    {
      city: "Seattle",
      weather: "Rainy, 62°F",
      suggestion: "Waterproof layers essential",
      outfit: ["Rain Jacket", "Long Sleeve Shirt", "Jeans", "Waterproof Shoes"],
    },
  ]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          const cityName = data.address?.city || 
                          data.address?.town || 
                          data.address?.village || 
                          data.display_name?.split(',')[0] || 
                          `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
          
          const state = data.address?.state || '';
          const city = state ? `${cityName}, ${state}` : cityName;
          
          const currentLocationData = {
            city: city,
            weather: `${currentWeather.condition}, ${currentWeather.temperature}°F`,
            suggestion: "Based on current weather conditions in your area",
            outfit: ["Light Cardigan", "Comfortable Jeans", "Walking Shoes", "Light Jacket"],
          };

          setTravelDestinations(prev => [currentLocationData, ...prev]);
          
          toast({
            title: "Location Added!",
            description: `${city} has been added to travel destinations.`,
          });
          
        } catch (error) {
          // Fallback to coordinates if geocoding fails
          const currentLocationData = {
            city: `Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
            weather: `${currentWeather.condition}, ${currentWeather.temperature}°F`,
            suggestion: "Based on current weather conditions in your area",
            outfit: ["Light Cardigan", "Comfortable Jeans", "Walking Shoes", "Light Jacket"],
          };

          setTravelDestinations(prev => [currentLocationData, ...prev]);
          
          toast({
            title: "Location Added!",
            description: "Your current location has been added to travel destinations.",
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return {
    travelDestinations,
    locationLoading,
    getCurrentLocation,
  };
};