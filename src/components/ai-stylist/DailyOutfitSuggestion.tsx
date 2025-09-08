import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, ThumbsUp, ThumbsDown, Meh, Star, Calendar, Cloud } from 'lucide-react';

interface DailyOutfitSuggestionProps {
  suggestions: any[];
  onRefresh: () => void;
}

const DailyOutfitSuggestion: React.FC<DailyOutfitSuggestionProps> = ({
  suggestions,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFeedback = async (suggestionId: string, feedback: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('daily_outfit_suggestions')
        .update({ user_feedback: feedback })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: "Feedback Recorded",
        description: "Your feedback helps improve future suggestions!",
      });

      onRefresh();
    } catch (error) {
      console.error('Error recording feedback:', error);
      toast({
        title: "Error",
        description: "Failed to record feedback",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsWorn = async (suggestionId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('daily_outfit_suggestions')
        .update({ was_worn: true })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: "Outfit Marked as Worn",
        description: "Great choice! This helps us learn your preferences.",
      });

      onRefresh();
    } catch (error) {
      console.error('Error marking as worn:', error);
      toast({
        title: "Error",
        description: "Failed to mark outfit as worn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackIcon = (feedback: string) => {
    switch (feedback) {
      case 'loved': return <Heart className="h-4 w-4 text-red-500" />;
      case 'liked': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'neutral': return <Meh className="h-4 w-4 text-yellow-500" />;
      case 'disliked': return <ThumbsDown className="h-4 w-4 text-orange-500" />;
      case 'hated': return <Star className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Daily Suggestions Yet</h3>
          <p className="text-muted-foreground">
            Click "Generate Daily Outfit" to get your first AI-powered outfit suggestion!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Daily Outfit Suggestions</CardTitle>
          <CardDescription>
            AI-generated outfits tailored to your style, weather, and occasions
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {new Date(suggestion.suggestion_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </CardTitle>
                  <CardDescription>
                    {suggestion.occasion && (
                      <Badge variant="outline" className="mr-2">
                        {suggestion.occasion}
                      </Badge>
                    )}
                    {suggestion.style_preference && (
                      <Badge variant="secondary">
                        {suggestion.style_preference}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  {suggestion.was_worn && (
                    <Badge className="bg-green-500">
                      Worn
                    </Badge>
                  )}
                  {suggestion.user_feedback && getFeedbackIcon(suggestion.user_feedback)}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Weather Context */}
              {suggestion.weather_context && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Cloud className="h-4 w-4" />
                  <span>
                    {suggestion.weather_context.temperature}°F, {suggestion.weather_context.condition}
                  </span>
                </div>
              )}

              {/* Outfit Items */}
              {suggestion.outfit_data?.items && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Suggested Items:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestion.outfit_data.items.map((item: any, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {suggestion.ai_reasoning && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">AI Styling Notes:</h4>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.ai_reasoning}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4">
                {!suggestion.was_worn && (
                  <Button 
                    size="sm" 
                    onClick={() => markAsWorn(suggestion.id)}
                    disabled={loading}
                  >
                    Mark as Worn
                  </Button>
                )}

                {!suggestion.user_feedback && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(suggestion.id, 'loved')}
                      disabled={loading}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(suggestion.id, 'liked')}
                      disabled={loading}
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(suggestion.id, 'neutral')}
                      disabled={loading}
                    >
                      <Meh className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeedback(suggestion.id, 'disliked')}
                      disabled={loading}
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DailyOutfitSuggestion;