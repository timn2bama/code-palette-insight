import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import CreateOutfitDialog from "@/components/CreateOutfitDialog";
import SmartOutfitAI from "@/components/SmartOutfitAI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Search, Calendar, Trash2, Edit, Eye, Shirt } from "lucide-react";
import ViewOutfitDialog from "@/components/ViewOutfitDialog";

interface OutfitWithItems {
  id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  created_at: string;
  outfit_items: {
    id: string;
    wardrobe_items: {
      id: string;
      name: string;
      category: string;
      color: string | null;
      photo_url: string | null;
    };
  }[];
}

const Outfits = () => {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [occasionFilter, setOccasionFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOutfits();
    }
  }, [user]);

  useEffect(() => {
    let filtered = outfits;

    if (searchQuery.trim()) {
      filtered = filtered.filter(outfit =>
        outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (occasionFilter !== "all") {
      filtered = filtered.filter(outfit => outfit.occasion === occasionFilter);
    }

    if (seasonFilter !== "all") {
      filtered = filtered.filter(outfit => outfit.season === seasonFilter);
    }

    setFilteredOutfits(filtered);
  }, [searchQuery, occasionFilter, seasonFilter, outfits]);

  const fetchOutfits = async () => {
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select(`
          id,
          name,
          description,
          occasion,
          season,
          created_at,
          outfit_items (
            id,
            wardrobe_items (
              id,
              name,
              category,
              color,
              photo_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutfits(data || []);
    } catch (error) {
      console.error('Error fetching outfits:', error);
      toast.error('Failed to load outfits');
    } finally {
      setLoading(false);
    }
  };

  const deleteOutfit = async (outfitId: string, outfitName: string) => {
    if (!confirm(`Are you sure you want to delete "${outfitName}"?`)) return;

    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (error) throw error;

      toast.success(`Deleted "${outfitName}"`);
      fetchOutfits();
    } catch (error) {
      console.error('Error deleting outfit:', error);
      toast.error('Failed to delete outfit');
    }
  };

  const removeItemFromOutfit = async (outfitItemId: string, itemName: string) => {
    try {
      const { error } = await supabase
        .from('outfit_items')
        .delete()
        .eq('id', outfitItemId);

      if (error) throw error;

      toast.success(`Removed "${itemName}" from outfit`);
      fetchOutfits();
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get unique occasions and seasons for filters
  const occasions = [...new Set(outfits.map(o => o.occasion).filter(Boolean))].sort();
  const seasons = [...new Set(outfits.map(o => o.season).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Your Outfits</h1>
          <p className="text-muted-foreground">Create and manage your outfit collections</p>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search outfits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={occasionFilter} onValueChange={setOccasionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Occasions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Occasions</SelectItem>
              {occasions.map((occasion) => (
                <SelectItem key={occasion} value={occasion}>
                  {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={seasonFilter} onValueChange={setSeasonFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Seasons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <CreateOutfitDialog onOutfitCreated={fetchOutfits} />
        </div>

        {/* Smart AI Section */}
        <div className="mb-8">
          <SmartOutfitAI onOutfitCreated={fetchOutfits} />
        </div>

        {/* Analytics Cards */}
        {!loading && outfits.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Outfits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{outfits.length}</div>
                <p className="text-sm text-muted-foreground">
                  {occasions.length} occasion{occasions.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular Occasion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {occasions.length > 0 ? occasions[0].charAt(0).toUpperCase() + occasions[0].slice(1) : 'None'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Plan outfits for more occasions
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Outfit Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  <Calendar className="h-6 w-6 inline mr-1" />
                  Smart
                </div>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Outfits Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your outfits...</p>
          </div>
        ) : filteredOutfits.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold mb-2">
              {outfits.length === 0 ? 'No outfits created yet' : 'No outfits match your filters'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {outfits.length === 0 
                ? 'Start creating outfit combinations from your wardrobe items' 
                : 'Try adjusting your search or filters'
              }
            </p>
            {outfits.length === 0 && (
              <CreateOutfitDialog onOutfitCreated={fetchOutfits} />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredOutfits.map((outfit) => (
              <Card key={outfit.id} className="shadow-card hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                        {outfit.name}
                      </h3>
                      {outfit.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {outfit.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {formatDate(outfit.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOutfit(outfit.id, outfit.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {outfit.occasion && (
                      <Badge variant="secondary" className="text-xs">
                        {outfit.occasion}
                      </Badge>
                    )}
                    {outfit.season && (
                      <Badge variant="outline" className="text-xs">
                        {outfit.season}
                      </Badge>
                    )}
                  </div>

                  {/* Outfit Items Preview */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shirt className="h-4 w-4" />
                      {outfit.outfit_items.length} item{outfit.outfit_items.length !== 1 ? 's' : ''}
                    </div>
                    
                    {outfit.outfit_items.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-hidden">
                        {outfit.outfit_items.slice(0, 4).map((outfitItem) => (
                          <div
                            key={outfitItem.id}
                            className="relative group/item bg-secondary/20 rounded-lg p-2 hover:bg-secondary/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {outfitItem.wardrobe_items.photo_url ? (
                                <img
                                  src={outfitItem.wardrobe_items.photo_url}
                                  alt={outfitItem.wardrobe_items.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-subtle rounded flex items-center justify-center text-xs">
                                  👕
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {outfitItem.wardrobe_items.name}
                                </p>
                                {outfitItem.wardrobe_items.color && (
                                  <p className="text-xs text-muted-foreground">
                                    {outfitItem.wardrobe_items.color}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromOutfit(outfitItem.id, outfitItem.wardrobe_items.name)}
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover/item:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {outfit.outfit_items.length > 4 && (
                          <div className="bg-secondary/20 rounded-lg p-2 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{outfit.outfit_items.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No items added yet
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <ViewOutfitDialog outfit={outfit}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </ViewOutfitDialog>
                    <Button variant="outline" size="sm" className="flex-1" disabled>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Outfits;