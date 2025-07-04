import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

const Weather = () => {
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 72,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 8,
    icon: "🌤️",
  });

  const [forecast] = useState([
    { day: "Today", high: 75, low: 62, condition: "Partly Cloudy", icon: "🌤️" },
    { day: "Tomorrow", high: 78, low: 65, condition: "Sunny", icon: "☀️" },
    { day: "Wednesday", high: 73, low: 58, condition: "Rainy", icon: "🌧️" },
    { day: "Thursday", high: 69, low: 55, condition: "Cloudy", icon: "☁️" },
    { day: "Friday", high: 76, low: 63, condition: "Sunny", icon: "☀️" },
  ]);

  const weatherSuggestions = [
    {
      id: 1,
      weather: "Partly Cloudy, 72°F",
      outfit: "Light Layers",
      items: ["Cotton T-shirt", "Light Cardigan", "Jeans", "Comfortable Sneakers"],
      reason: "Perfect temperature for layering. You can remove the cardigan if it gets warmer.",
    },
    {
      id: 2,
      weather: "Rainy, 65°F",
      outfit: "Rain Ready",
      items: ["Waterproof Jacket", "Dark Jeans", "Waterproof Boots", "Umbrella"],
      reason: "Stay dry and comfortable. Dark colors hide splashes better.",
    },
    {
      id: 3,
      weather: "Sunny, 78°F",
      outfit: "Summer Comfort",
      items: ["Light Blouse", "Linen Pants", "Sandals", "Sun Hat"],
      reason: "Breathable fabrics and sun protection for a warm, sunny day.",
    },
  ];

  const travelDestinations = [
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
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Weather & Style</h1>
          <p className="text-muted-foreground">Smart outfit suggestions based on weather conditions</p>
        </div>

        {/* Current Weather */}
        <Card className="shadow-elegant mb-8 bg-gradient-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{currentWeather.icon}</div>
                <div>
                  <h2 className="text-3xl font-bold text-primary">{currentWeather.temperature}°F</h2>
                  <p className="text-lg text-foreground">{currentWeather.condition}</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Humidity:</span>
                  <Badge variant="outline">{currentWeather.humidity}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Wind:</span>
                  <Badge variant="outline">{currentWeather.windSpeed} mph</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5-Day Forecast */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <div key={index} className="text-center p-3 rounded-lg bg-secondary/50">
                  <div className="text-sm font-medium text-muted-foreground mb-2">{day.day}</div>
                  <div className="text-3xl mb-2">{day.icon}</div>
                  <div className="text-sm font-semibold">{day.high}°</div>
                  <div className="text-xs text-muted-foreground">{day.low}°</div>
                  <div className="text-xs text-muted-foreground mt-1">{day.condition}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weather-Based Outfit Suggestions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Today's Outfit Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weatherSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{suggestion.outfit}</CardTitle>
                  <p className="text-sm text-muted-foreground">{suggestion.weather}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Recommended Items</h4>
                      <div className="space-y-1">
                        {suggestion.items.map((item, index) => (
                          <div key={index} className="text-sm bg-secondary/50 rounded px-2 py-1">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground bg-accent/10 rounded p-3">
                      <strong>Why this works:</strong> {suggestion.reason}
                    </div>

                    <Button variant="gold" size="sm" className="w-full">
                      Create This Outfit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Travel Suggestions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>✈️</span>
              Travel Destination Suggestions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Planning a trip? Get outfit suggestions based on your destination's weather.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {travelDestinations.map((destination, index) => (
                <div key={index} className="p-4 rounded-lg border border-border/50 bg-secondary/30">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-primary">{destination.city}</h3>
                    <Badge variant="outline" className="text-xs">
                      {destination.weather}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{destination.suggestion}</p>
                  
                  <div className="space-y-1">
                    {destination.outfit.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-xs bg-background/50 rounded px-2 py-1">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Button variant="premium" size="lg">
                Add Travel Destination
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weather;