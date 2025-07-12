import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
  const [outfitName, setOutfitName] = useState("");
  const [outfitDescription, setOutfitDescription] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<OutfitSuggestion | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleCreateOutfit = async () => {
    if (!selectedSuggestion || !user || !outfitName.trim()) return;

    setIsCreating(true);
    try {
      const { data: outfitData, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          name: outfitName,
          description: outfitDescription || `Weather-suggested outfit for ${selectedSuggestion.weather}`,
          occasion: 'weather-suggested',
          season: getSeasonFromTemp(selectedSuggestion.weather),
          user_id: user.id
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      toast.success(`Outfit "${outfitName}" created successfully!`);
      setDialogOpen(false);
      setOutfitName("");
      setOutfitDescription("");
      setSelectedSuggestion(null);
    } catch (error) {
      console.error('Error creating outfit:', error);
      toast.error('Failed to create outfit');
    } finally {
      setIsCreating(false);
    }
  };

  const getSeasonFromTemp = (weather: string) => {
    const temp = parseInt(weather.match(/(\d+)°F/)?.[1] || "70");
    if (temp >= 80) return 'summer';
    if (temp >= 65) return 'spring';
    if (temp >= 50) return 'fall';
    return 'winter';
  };

  const openCreateDialog = (suggestion: OutfitSuggestion) => {
    setSelectedSuggestion(suggestion);
    setOutfitName(suggestion.outfit);
    setOutfitDescription(`AI-suggested outfit for ${suggestion.weather}. ${suggestion.reason}`);
    setDialogOpen(true);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-fashion-gold" />
        Today's Outfit Suggestions
      </h2>
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

                <Button 
                  variant="gold" 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => openCreateDialog(suggestion)}
                >
                  <Plus className="h-4 w-4" />
                  Create This Outfit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-fashion-gold" />
              Create Weather Outfit
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSuggestion && (
              <div className="bg-secondary/20 rounded-lg p-4">
                <h4 className="font-medium text-primary mb-2">{selectedSuggestion.outfit}</h4>
                <p className="text-sm text-muted-foreground mb-3">{selectedSuggestion.weather}</p>
                <div className="space-y-1">
                  {selectedSuggestion.items.map((item, index) => (
                    <div key={index} className="text-sm bg-background/60 rounded px-2 py-1">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="outfit-name">Outfit Name</Label>
              <Input
                id="outfit-name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Enter outfit name..."
              />
            </div>

            <div>
              <Label htmlFor="outfit-description">Description (Optional)</Label>
              <Textarea
                id="outfit-description"
                value={outfitDescription}
                onChange={(e) => setOutfitDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={handleCreateOutfit}
                disabled={!outfitName.trim() || isCreating}
                className="flex-1 gap-2"
              >
                <Plus className="h-4 w-4" />
                {isCreating ? 'Creating...' : 'Create Outfit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};