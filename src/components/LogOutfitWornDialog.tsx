import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Cloud, Smile, Star } from 'lucide-react';
import { useOutfitLogging } from '@/hooks/useOutfitLogging';

interface LogOutfitWornDialogProps {
  outfit: {
    id: string;
    name: string;
    outfit_items: Array<{
      wardrobe_items: {
        id: string;
        name: string;
        category: string;
        color?: string;
        brand?: string;
      };
    }>;
  };
  children: React.ReactNode;
}

const OCCASIONS = ['work', 'casual', 'formal', 'party', 'date', 'sports', 'home'];
const MOOD_OPTIONS = ['confident', 'comfortable', 'stylish', 'playful', 'professional', 'relaxed', 'bold'];

export function LogOutfitWornDialog({ outfit, children }: LogOutfitWornDialogProps) {
  const [open, setOpen] = useState(false);
  const { logOutfitWorn, loading } = useOutfitLogging();
  
  const [formData, setFormData] = useState({
    worn_date: new Date().toISOString().split('T')[0],
    occasion: '',
    location: '',
    weather_condition: '',
    weather_temp: undefined as number | undefined,
    mood_tags: [] as string[],
    style_satisfaction: undefined as number | undefined,
    comfort_rating: undefined as number | undefined,
    notes: '',
  });

  const handleSubmit = async () => {
    const items_worn = outfit.outfit_items.map(oi => ({
      item_id: oi.wardrobe_items.id,
      name: oi.wardrobe_items.name,
      category: oi.wardrobe_items.category,
      color: oi.wardrobe_items.color,
      brand: oi.wardrobe_items.brand,
    }));

    const success = await logOutfitWorn({
      outfit_id: outfit.id,
      items_worn,
      ...formData,
      worn_date: new Date(formData.worn_date),
    });

    if (success) {
      setOpen(false);
      setFormData({
        worn_date: new Date().toISOString().split('T')[0],
        occasion: '',
        location: '',
        weather_condition: '',
        weather_temp: undefined,
        mood_tags: [],
        style_satisfaction: undefined,
        comfort_rating: undefined,
        notes: '',
      });
    }
  };

  const toggleMoodTag = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      mood_tags: prev.mood_tags.includes(mood)
        ? prev.mood_tags.filter(m => m !== mood)
        : [...prev.mood_tags, mood]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log "{outfit.name}" as Worn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="worn_date">
              <Calendar className="h-4 w-4 inline mr-2" />
              When did you wear this?
            </Label>
            <Input
              id="worn_date"
              type="date"
              value={formData.worn_date}
              onChange={(e) => setFormData(prev => ({ ...prev, worn_date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasion">
              <MapPin className="h-4 w-4 inline mr-2" />
              Occasion
            </Label>
            <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select occasion" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {OCCASIONS.map(occ => (
                  <SelectItem key={occ} value={occ}>
                    {occ.charAt(0).toUpperCase() + occ.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Office, Downtown, Home"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weather_temp">
                <Cloud className="h-4 w-4 inline mr-2" />
                Temperature (°F)
              </Label>
              <Input
                id="weather_temp"
                type="number"
                placeholder="72"
                value={formData.weather_temp || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, weather_temp: e.target.value ? parseInt(e.target.value) : undefined }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weather_condition">Condition</Label>
              <Input
                id="weather_condition"
                placeholder="Sunny"
                value={formData.weather_condition}
                onChange={(e) => setFormData(prev => ({ ...prev, weather_condition: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              <Smile className="h-4 w-4 inline mr-2" />
              How did you feel wearing this?
            </Label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map(mood => (
                <Badge
                  key={mood}
                  variant={formData.mood_tags.includes(mood) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleMoodTag(mood)}
                >
                  {mood}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                <Star className="h-4 w-4 inline mr-2" />
                Style Satisfaction
              </Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    type="button"
                    variant={formData.style_satisfaction === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, style_satisfaction: rating }))}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Comfort Level</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    type="button"
                    variant={formData.comfort_rating === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, comfort_rating: rating }))}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any thoughts about this outfit? What worked well?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Log Outfit'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
