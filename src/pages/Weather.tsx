import Navigation from "@/components/Navigation";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { ForecastCard } from "@/components/weather/ForecastCard";
import { OutfitSuggestions } from "@/components/weather/OutfitSuggestions";
import { TravelDestinations } from "@/components/weather/TravelDestinations";
import { useWeatherData } from "@/hooks/useWeatherData";
import { useOutfitSuggestions } from "@/hooks/useOutfitSuggestions";
import { useTravelDestinations } from "@/hooks/useTravelDestinations";

const Weather = () => {
  const { currentWeather, forecast } = useWeatherData();
  const weatherSuggestions = useOutfitSuggestions(currentWeather);
  const { travelDestinations, locationLoading, getCurrentLocation } = useTravelDestinations(currentWeather);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Weather & Style</h1>
          <p className="text-muted-foreground">Smart outfit suggestions based on weather conditions</p>
        </div>

        <WeatherCard currentWeather={currentWeather} />
        <ForecastCard forecast={forecast} />
        <OutfitSuggestions weatherSuggestions={weatherSuggestions} />
        <TravelDestinations 
          travelDestinations={travelDestinations} 
          onGetCurrentLocation={getCurrentLocation}
          locationLoading={locationLoading}
        />
      </div>
    </div>
  );
};

export default Weather;