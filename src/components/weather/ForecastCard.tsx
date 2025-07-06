import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ForecastItem {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

interface ForecastCardProps {
  forecast: ForecastItem[];
}

export const ForecastCard = ({ forecast }: ForecastCardProps) => {
  return (
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
  );
};