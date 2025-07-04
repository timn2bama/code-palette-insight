import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

const Outfits = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filters = [
    { id: "all", name: "All Outfits" },
    { id: "work", name: "Work" },
    { id: "casual", name: "Casual" },
    { id: "formal", name: "Formal" },
    { id: "weekend", name: "Weekend" },
  ];

  const outfits = [
    {
      id: 1,
      name: "Power Meeting Look",
      category: "work",
      items: ["Black Blazer", "White Button Shirt", "Dark Jeans", "Leather Boots"],
      lastWorn: "Yesterday",
      wearCount: 8,
      weather: "Cool",
    },
    {
      id: 2,
      name: "Sunday Brunch",
      category: "casual",
      items: ["Floral Summer Dress", "Cardigan", "White Sneakers"],
      lastWorn: "1 week ago",
      wearCount: 3,
      weather: "Warm",
    },
    {
      id: 3,
      name: "Date Night Elegance",
      category: "formal",
      items: ["Little Black Dress", "Heels", "Statement Necklace"],
      lastWorn: "2 weeks ago",
      wearCount: 5,
      weather: "Mild",
    },
    {
      id: 4,
      name: "Cozy Weekend",
      category: "weekend",
      items: ["Cashmere Sweater", "Jeans", "Comfortable Flats"],
      lastWorn: "3 days ago",
      wearCount: 12,
      weather: "Cool",
    },
  ];

  const filteredOutfits = selectedFilter === "all" 
    ? outfits 
    : outfits.filter(outfit => outfit.category === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Your Outfits</h1>
          <p className="text-muted-foreground">Create, manage, and track your favorite looks</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">24</div>
              <p className="text-sm text-muted-foreground">Total Outfits</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-fashion-gold">12</div>
              <p className="text-sm text-muted-foreground">Most Worn</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-fashion-rose">3</div>
              <p className="text-sm text-muted-foreground">New This Week</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">85%</div>
              <p className="text-sm text-muted-foreground">Outfit Usage</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Outfit Section */}
        <Card className="shadow-elegant mb-8 bg-gradient-accent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary mb-2">Create New Outfit</h2>
                <p className="text-muted-foreground">
                  Mix and match your wardrobe items to create the perfect look. 
                  Drag and drop items or use our smart suggestions.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="elegant" size="lg">
                  🎨 Style Creator
                </Button>
                <Button variant="premium" size="lg">
                  ✨ AI Suggestions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "elegant" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className="transition-all duration-300"
            >
              {filter.name}
            </Button>
          ))}
        </div>

        {/* Outfits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map((outfit) => (
            <Card key={outfit.id} className="shadow-card hover:shadow-elegant transition-all duration-300 group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="group-hover:text-accent transition-colors">
                    {outfit.name}
                  </CardTitle>
                  <Badge variant="secondary">{outfit.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Outfit Items */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Items</h4>
                    <div className="space-y-1">
                      {outfit.items.map((item, index) => (
                        <div key={index} className="text-sm bg-secondary/50 rounded px-2 py-1">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Worn:</span>
                      <span className="font-medium ml-1">{outfit.wearCount} times</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last:</span>
                      <span className="font-medium ml-1">{outfit.lastWorn}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Weather:</span>
                    <Badge variant="outline" className="text-xs">
                      {outfit.weather}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="gold" size="sm" className="flex-1">
                      Wear Today
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for filtered results */}
        {filteredOutfits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👗</div>
            <h3 className="text-xl font-semibold mb-2">No outfits found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first {selectedFilter} outfit to get started!
            </p>
            <Button variant="premium" size="lg">
              Create New Outfit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Outfits;