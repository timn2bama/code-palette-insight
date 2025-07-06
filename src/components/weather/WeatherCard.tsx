import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeatherCardProps {
  currentWeather: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    city: string;
  };
}

export const WeatherCard = ({ currentWeather }: WeatherCardProps) => {
  return (
    <Card className="shadow-elegant mb-8 bg-gradient-accent">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{currentWeather.icon}</div>
            <div>
              <h2 className="text-3xl font-bold text-primary">{currentWeather.temperature}°F</h2>
              <p className="text-lg text-foreground">{currentWeather.condition}</p>
              <p className="text-sm text-muted-foreground">{currentWeather.city}</p>
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
  );
};