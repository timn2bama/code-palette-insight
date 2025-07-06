import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  city: string;
}

interface ForecastItem {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export const useWeatherData = () => {
  const { toast } = useToast();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>({
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    icon: "🌤️",
    city: "Getting location...",
  });

  const [forecast, setForecast] = useState<ForecastItem[]>([
    { day: "Today", high: 75, low: 62, condition: "Partly Cloudy", icon: "🌤️" },
    { day: "Tomorrow", high: 78, low: 65, condition: "Sunny", icon: "☀️" },
    { day: "Wednesday", high: 73, low: 58, condition: "Rainy", icon: "🌧️" },
    { day: "Thursday", high: 69, low: 55, condition: "Cloudy", icon: "☁️" },
    { day: "Friday", high: 76, low: 63, condition: "Sunny", icon: "☀️" },
  ]);

  const [weatherLoading, setWeatherLoading] = useState(true);

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const { data, error } = await supabase.functions.invoke('get-weather', {
            body: { latitude, longitude }
          });
          
          if (error) {
            console.error('Weather API error:', error);
            toast({
              title: "Weather Error",
              description: "Failed to fetch weather data.",
              variant: "destructive",
            });
            return;
          }
          
          if (data) {
            setCurrentWeather({
              ...data.current,
              city: data.current.city,
            });
            setForecast(data.forecast);
          }
          
        } catch (error) {
          console.error('Error fetching weather:', error);
          toast({
            title: "Weather Error",
            description: "Failed to get weather information.",
            variant: "destructive",
          });
        }
        
        setWeatherLoading(false);
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
        
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return {
    currentWeather,
    forecast,
    weatherLoading,
    fetchWeatherData,
  };
};