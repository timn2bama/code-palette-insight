import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";

const Wardrobe = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Items", count: 47 },
    { id: "tops", name: "Tops", count: 15 },
    { id: "bottoms", name: "Bottoms", count: 12 },
    { id: "dresses", name: "Dresses", count: 8 },
    { id: "outerwear", name: "Outerwear", count: 7 },
    { id: "shoes", name: "Shoes", count: 5 },
  ];

  const clothingItems = [
    { id: 1, name: "Black Blazer", category: "outerwear", wearCount: 24, lastWorn: "2 days ago", color: "Black", brand: "Zara" },
    { id: 2, name: "White Button Shirt", category: "tops", wearCount: 18, lastWorn: "1 week ago", color: "White", brand: "Uniqlo" },
    { id: 3, name: "Dark Jeans", category: "bottoms", wearCount: 32, lastWorn: "Yesterday", color: "Navy", brand: "Levi's" },
    { id: 4, name: "Floral Summer Dress", category: "dresses", wearCount: 6, lastWorn: "2 weeks ago", color: "Multi", brand: "H&M" },
    { id: 5, name: "Leather Boots", category: "shoes", wearCount: 21, lastWorn: "3 days ago", color: "Brown", brand: "Dr. Martens" },
    { id: 6, name: "Cashmere Sweater", category: "tops", wearCount: 15, lastWorn: "1 week ago", color: "Gray", brand: "Everlane" },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Worn This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Dark Jeans</div>
              <p className="text-sm text-muted-foreground">32 times</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">47</div>
              <p className="text-sm text-muted-foreground">Across 6 categories</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Wardrobe Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">$2,847</div>
              <p className="text-sm text-muted-foreground">Estimated total</p>
            </CardContent>
          </Card>
        </div>

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
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="gold" size="sm" className="flex-1">
                    Mark as Worn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Item Button */}
        <div className="text-center mt-8">
          <Button variant="premium" size="lg" className="shadow-glow">
            Add New Item to Wardrobe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;