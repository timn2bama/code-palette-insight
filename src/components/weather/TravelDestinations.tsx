import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TravelDestination {
  city: string;
  weather: string;
  suggestion: string;
  outfit: string[];
}

interface TravelDestinationsProps {
  travelDestinations: TravelDestination[];
  onGetCurrentLocation: () => void;
  locationLoading: boolean;
}

export const TravelDestinations = ({ 
  travelDestinations, 
  onGetCurrentLocation, 
  locationLoading 
}: TravelDestinationsProps) => {
  return (
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
          <Button 
            variant="premium" 
            size="lg"
            onClick={onGetCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <>
                <span className="animate-spin mr-2">📍</span>
                Getting GPS Location...
              </>
            ) : (
              <>
                📍 Add Current Location
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};