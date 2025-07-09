import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import AddWardrobeItemDialog from "@/components/AddWardrobeItemDialog";
import ViewDetailsDialog from "@/components/ViewDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Wardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWardrobeItems();
    }
  }, [user]);

  const fetchWardrobeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected format
      const transformedItems = data.map(item => ({
        ...item,
        wearCount: item.wear_count || 0,
        lastWorn: item.last_worn ? formatDate(item.last_worn) : 'Never'
      }));

      setClothingItems(transformedItems);
    } catch (error) {
      console.error('Error fetching wardrobe items:', error);
      toast.error('Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Calculate categories dynamically
  const categories = [
    { id: "all", name: "All Items", count: clothingItems.length },
    { id: "tops", name: "Tops", count: clothingItems.filter(item => item.category === 'tops').length },
    { id: "bottoms", name: "Bottoms", count: clothingItems.filter(item => item.category === 'bottoms').length },
    { id: "dresses", name: "Dresses", count: clothingItems.filter(item => item.category === 'dresses').length },
    { id: "outerwear", name: "Outerwear", count: clothingItems.filter(item => item.category === 'outerwear').length },
    { id: "shoes", name: "Shoes", count: clothingItems.filter(item => item.category === 'shoes').length },
  ];

  const filteredItems = selectedCategory === "all" 
    ? clothingItems 
    : clothingItems.filter(item => item.category === selectedCategory);

  const mostWornItems = clothingItems.sort((a, b) => b.wearCount - a.wearCount).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Your Wardrobe</h1>
          <p className="text-muted-foreground">Track and manage your clothing collection</p>
        </div>

        {/* Analytics Cards */}
        {!loading && clothingItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Most Worn This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {mostWornItems[0]?.name || 'No items'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mostWornItems[0]?.wearCount || 0} times
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{clothingItems.length}</div>
                <p className="text-sm text-muted-foreground">
                  Across {categories.filter(c => c.id !== 'all' && c.count > 0).length} categories
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Wardrobe Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">$--</div>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Most Worn Items */}
        <Card className="shadow-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-fashion-gold">⭐</span>
              Your Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mostWornItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold text-fashion-gold">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.wearCount} wears</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "elegant" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="transition-all duration-300"
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Clothing Grid */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading your wardrobe...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? "No items in your wardrobe yet. Add your first item!" 
                : `No items in the ${selectedCategory} category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
            <Card key={item.id} className="shadow-card hover:shadow-elegant transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-primary group-hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                  </div>
                  <Badge variant="secondary">{item.color}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wear Count</span>
                    <span className="font-medium">{item.wearCount}</span>
                  </div>
                  
                  <Progress value={(item.wearCount / 35) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Worn</span>
                    <span className="font-medium">{item.lastWorn}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <ViewDetailsDialog item={item}>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </ViewDetailsDialog>
                  <Button variant="gold" size="sm" className="flex-1">
                    Mark as Worn
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* Add Item Button */}
        <div className="text-center mt-8">
          <AddWardrobeItemDialog onItemAdded={fetchWardrobeItems} />
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;