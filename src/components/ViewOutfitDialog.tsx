import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, Calendar, MapPin, Shirt, Palette } from "lucide-react";
import { toast } from "sonner";

interface OutfitItem {
  id: string;
  wardrobe_items: {
    id: string;
    name: string;
    category: string;
    color: string | null;
    photo_url: string | null;
    brand?: string | null;
  };
}

interface Outfit {
  id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  created_at: string;
  outfit_items: OutfitItem[];
}

interface ViewOutfitDialogProps {
  outfit: Outfit;
  children: React.ReactNode;
}

const ViewOutfitDialog = ({ outfit, children }: ViewOutfitDialogProps) => {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleWearToday = () => {
    toast.success(`"${outfit.name}" added to today's outfit plan!`);
    setOpen(false);
  };

  const groupItemsByCategory = (items: OutfitItem[]) => {
    return items.reduce((acc, item) => {
      const category = item.wardrobe_items.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, OutfitItem[]>);
  };

  const groupedItems = groupItemsByCategory(outfit.outfit_items);
  const categoryOrder = ['tops', 'outerwear', 'bottoms', 'dresses', 'shoes', 'accessories'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{outfit.name}</DialogTitle>
          <DialogDescription className="text-base">
            {outfit.description || "View your complete outfit details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Outfit Info */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {formatDate(outfit.created_at)}
            </div>
            {outfit.occasion && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {outfit.occasion.charAt(0).toUpperCase() + outfit.occasion.slice(1)}
              </Badge>
            )}
            {outfit.season && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Palette className="h-3 w-3" />
                {outfit.season.charAt(0).toUpperCase() + outfit.season.slice(1)}
              </Badge>
            )}
          </div>

          <Separator />

          {/* Outfit Items by Category */}
          {outfit.outfit_items.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Shirt className="h-5 w-5" />
                Outfit Items ({outfit.outfit_items.length})
              </div>
              
              {categoryOrder.map(category => {
                const items = groupedItems[category];
                if (!items || items.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-3">
                    <h3 className="font-medium text-foreground capitalize">
                      {category} ({items.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((outfitItem) => (
                        <div
                          key={outfitItem.id}
                          className="bg-secondary/20 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {outfitItem.wardrobe_items.photo_url ? (
                              <img
                                src={outfitItem.wardrobe_items.photo_url}
                                alt={outfitItem.wardrobe_items.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-subtle rounded-lg flex items-center justify-center text-2xl border border-border">
                                👕
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground">
                                {outfitItem.wardrobe_items.name}
                              </h4>
                              {outfitItem.wardrobe_items.brand && (
                                <p className="text-sm text-muted-foreground">
                                  {outfitItem.wardrobe_items.brand}
                                </p>
                              )}
                              {outfitItem.wardrobe_items.color && (
                                <p className="text-sm text-muted-foreground">
                                  {outfitItem.wardrobe_items.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Show any uncategorized items */}
              {Object.keys(groupedItems).some(cat => !categoryOrder.includes(cat)) && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Other Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedItems)
                      .filter(([category]) => !categoryOrder.includes(category))
                      .flatMap(([, items]) => items)
                      .map((outfitItem) => (
                        <div
                          key={outfitItem.id}
                          className="bg-secondary/20 rounded-lg p-4 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {outfitItem.wardrobe_items.photo_url ? (
                              <img
                                src={outfitItem.wardrobe_items.photo_url}
                                alt={outfitItem.wardrobe_items.name}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-subtle rounded-lg flex items-center justify-center text-2xl border border-border">
                                👕
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground">
                                {outfitItem.wardrobe_items.name}
                              </h4>
                              {outfitItem.wardrobe_items.brand && (
                                <p className="text-sm text-muted-foreground">
                                  {outfitItem.wardrobe_items.brand}
                                </p>
                              )}
                              {outfitItem.wardrobe_items.color && (
                                <p className="text-sm text-muted-foreground">
                                  {outfitItem.wardrobe_items.color}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this outfit yet</p>
            </div>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleWearToday} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              Wear Today
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              Share Outfit
            </Button>
            <Button variant="outline" className="flex-1" disabled>
              Edit Outfit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewOutfitDialog;