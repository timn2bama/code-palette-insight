import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OutfitSuggestion {
  id: number;
  weather: string;
  outfit: string;
  items: string[];
  reason: string;
}

interface OutfitSuggestionsProps {
  weatherSuggestions: OutfitSuggestion[];
}

export const OutfitSuggestions = ({ weatherSuggestions }: OutfitSuggestionsProps) => {
  return (
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
  );
};