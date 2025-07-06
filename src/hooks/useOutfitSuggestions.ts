interface CurrentWeather {
  temperature: number;
  condition: string;
}

interface OutfitSuggestion {
  id: number;
  weather: string;
  outfit: string;
  items: string[];
  reason: string;
}

export const useOutfitSuggestions = (currentWeather: CurrentWeather): OutfitSuggestion[] => {
  const temp = currentWeather.temperature;
  const condition = currentWeather.condition.toLowerCase();
  
  const suggestions: OutfitSuggestion[] = [];
  
  // Base suggestion based on temperature
  if (temp >= 80) {
    suggestions.push({
      id: 1,
      weather: `${currentWeather.condition}, ${temp}°F`,
      outfit: "Summer Comfort",
      items: ["Light Tank Top", "Linen Shorts", "Sandals", "Sun Hat", "Sunglasses"],
      reason: "Hot weather calls for breathable fabrics and sun protection.",
    });
  } else if (temp >= 65) {
    suggestions.push({
      id: 1,
      weather: `${currentWeather.condition}, ${temp}°F`,
      outfit: "Perfect Layers",
      items: ["Cotton T-shirt", "Light Cardigan", "Comfortable Jeans", "Sneakers"],
      reason: "Great temperature for layering. Add or remove layers as needed.",
    });
  } else {
    suggestions.push({
      id: 1,
      weather: `${currentWeather.condition}, ${temp}°F`,
      outfit: "Stay Warm",
      items: ["Warm Sweater", "Jacket", "Long Pants", "Closed-toe Shoes", "Scarf"],
      reason: "Cool weather requires warm layers and coverage.",
    });
  }
  
  // Additional suggestion based on weather condition
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
    suggestions.push({
      id: 2,
      weather: `${currentWeather.condition}, ${temp}°F`,
      outfit: "Rain Ready",
      items: ["Waterproof Jacket", "Dark Jeans", "Waterproof Boots", "Umbrella"],
      reason: "Stay dry and comfortable with waterproof layers.",
    });
  } else if (condition.includes('snow')) {
    suggestions.push({
      id: 2,
      weather: `${currentWeather.condition}, ${temp}°F`,
      outfit: "Winter Ready",
      items: ["Heavy Coat", "Warm Sweater", "Insulated Boots", "Gloves", "Warm Hat"],
      reason: "Snow requires warm, insulated clothing and proper footwear.",
    });
  } else if (condition.includes('clear') || condition.includes('sun')) {
    suggestions.push({
      id: 2,
      weather: `${currentWeather.condition}, ${temp}°F`,
      outfit: "Sunny Day",
      items: ["Light Shirt", "Comfortable Pants", "Walking Shoes", "Sunglasses"],
      reason: "Perfect weather for comfortable, casual clothing.",
    });
  }
  
  // Add a third suggestion based on activity
  suggestions.push({
    id: 3,
    weather: `${currentWeather.condition}, ${temp}°F`,
    outfit: "Work/Professional",
    items: temp >= 70 ? 
      ["Light Blouse/Shirt", "Dress Pants", "Professional Shoes", "Light Blazer"] :
      ["Long-sleeve Shirt", "Dress Pants", "Professional Shoes", "Blazer/Suit Jacket"],
    reason: "Professional attire adjusted for current weather conditions.",
  });
  
  return suggestions;
};