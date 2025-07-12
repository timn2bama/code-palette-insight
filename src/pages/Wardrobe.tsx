import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import AddWardrobeItemDialog from "@/components/AddWardrobeItemDialog";
import ViewDetailsDialog from "@/components/ViewDetailsDialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Shirt, Plus } from "lucide-react";

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

  const markAsWorn = async (itemId: string, itemName: string) => {
    try {
      const { error } = await supabase
        .from('wardrobe_items')
        .update({ 
          wear_count: clothingItems.find(item => item.id === itemId)?.wearCount + 1 || 1,
          last_worn: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success(`Marked "${itemName}" as worn today!`);
      fetchWardrobeItems(); // Refresh the data
    } catch (error) {
      console.error('Error marking item as worn:', error);
      toast.error('Failed to mark item as worn');
    }
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
        <div className="flex flex-wrap gap-2 mb-6 justify-center sm:justify-start">
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
          <div className="text-center py-16">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground mt-4 text-lg">Loading your wardrobe...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          selectedCategory === 'all' ? (
            <EmptyState
              icon={<Shirt className="h-16 w-16 text-muted-foreground" />}
              title="Your wardrobe awaits!"
              description="Start building your digital wardrobe by adding your first clothing item. Upload photos, track wear patterns, and get personalized style recommendations."
              action={{
                label: "Add Your First Item",
                onClick: () => {
                  // This will trigger the AddWardrobeItemDialog
                  const addButton = document.querySelector('[data-add-item-trigger]') as HTMLElement;
                  addButton?.click();
                }
              }}
            />
          ) : (
            <EmptyState
              icon={<Shirt className="h-16 w-16 text-muted-foreground" />}
              title={`No ${selectedCategory} items yet`}
              description={`You haven't added any ${selectedCategory} to your wardrobe yet. Start building this category to get better outfit suggestions.`}
              action={{
                label: `Add ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`,
                onClick: () => {
                  const addButton = document.querySelector('[data-add-item-trigger]') as HTMLElement;
                  addButton?.click();
                }
              }}
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
            <Card key={item.id} className="shadow-card hover:shadow-elegant transition-all duration-300 group">
              <CardContent className="p-0">
                {/* Photo Section */}
                {item.photo_url ? (
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={item.photo_url} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-subtle rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-2">👕</div>
                      <p className="text-sm">No photo</p>
                    </div>
                  </div>
                )}
                
                 {/* Content Section */}
                 <div className="p-4 sm:p-6">
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

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                   <ViewDetailsDialog item={item} onItemUpdated={fetchWardrobeItems}>
                     <Button variant="outline" size="sm" className="flex-1">
                       View Details
                     </Button>
                   </ViewDetailsDialog>
                    <Button 
                      variant="gold" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => markAsWorn(item.id, item.name)}
                    >
                      Mark as Worn
                    </Button>
                 </div>
                </div>
               </CardContent>
             </Card>
            ))}
          </div>
        )}

        {/* Add Item Button */}
        <div className="text-center mt-8">
          <div data-add-item-trigger>
            <AddWardrobeItemDialog onItemAdded={fetchWardrobeItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;