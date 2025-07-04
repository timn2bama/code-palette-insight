import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";

const Services = () => {
  const [searchLocation, setSearchLocation] = useState("San Francisco, CA");
  const [selectedService, setSelectedService] = useState("all");

  const serviceTypes = [
    { id: "all", name: "All Services", icon: "🔧" },
    { id: "cleaners", name: "Dry Cleaners", icon: "🧼" },
    { id: "tailors", name: "Tailors", icon: "✂️" },
    { id: "laundromats", name: "Laundromats", icon: "🏪" },
    { id: "seamstresses", name: "Seamstresses", icon: "🪡" },
    { id: "shoe-repair", name: "Shoe Repair", icon: "👟" },
    { id: "alterations", name: "Alterations", icon: "📏" },
  ];

  const services = [
    {
      id: 1,
      name: "Premium Dry Cleaning Co.",
      type: "cleaners",
      rating: 4.8,
      price: "$$$",
      distance: "0.3 miles",
      address: "123 Market St, San Francisco, CA",
      phone: "(415) 555-0123",
      services: ["Dry Cleaning", "Laundry", "Alterations"],
      hours: "Mon-Fri: 7AM-7PM, Sat: 8AM-5PM",
      specialties: ["Delicate fabrics", "Designer clothing"],
    },
    {
      id: 2,
      name: "Master Tailor Studio",
      type: "tailors",
      rating: 4.9,
      price: "$$$$",
      distance: "0.5 miles",
      address: "456 Union St, San Francisco, CA",
      phone: "(415) 555-0456",
      services: ["Custom Tailoring", "Alterations", "Repairs"],
      hours: "Tue-Sat: 10AM-6PM",
      specialties: ["Suits", "Formal wear", "Custom fitting"],
    },
    {
      id: 3,
      name: "Quick Wash Laundromat",
      type: "laundromats",
      rating: 4.2,
      price: "$",
      distance: "0.7 miles",
      address: "789 Mission St, San Francisco, CA",
      phone: "(415) 555-0789",
      services: ["Self-service", "Wash & Fold", "Drop-off"],
      hours: "Daily: 6AM-11PM",
      specialties: ["Large capacity machines", "Express service"],
    },
    {
      id: 4,
      name: "Artisan Seamstress",
      type: "seamstresses",
      rating: 4.7,
      price: "$$$",
      distance: "1.2 miles",
      address: "321 Valencia St, San Francisco, CA",
      phone: "(415) 555-0321",
      services: ["Hemming", "Repairs", "Custom work"],
      hours: "Wed-Sun: 11AM-5PM",
      specialties: ["Vintage clothing", "Delicate repairs"],
    },
    {
      id: 5,
      name: "Sole Revival Shoe Repair",
      type: "shoe-repair",
      rating: 4.6,
      price: "$$",
      distance: "0.9 miles",
      address: "654 Fillmore St, San Francisco, CA",
      phone: "(415) 555-0654",
      services: ["Sole replacement", "Heel repair", "Cleaning"],
      hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
      specialties: ["Leather shoes", "Boot repair", "Sneaker cleaning"],
    },
  ];

  const filteredServices = selectedService === "all" 
    ? services 
    : services.filter(service => service.type === selectedService);

  const getPriceColor = (price) => {
    switch (price) {
      case "$": return "text-green-600";
      case "$$": return "text-yellow-600";
      case "$$$": return "text-orange-600";
      case "$$$$": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Local Services</h1>
          <p className="text-muted-foreground">Find trusted cleaners, tailors, and garment care services nearby</p>
        </div>

        {/* Search Section */}
        <Card className="shadow-elegant mb-8 bg-gradient-accent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Search Location
                </label>
                <Input 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter your location..."
                  className="bg-background/50"
                />
              </div>
              <Button variant="premium" size="lg" className="px-8">
                🔍 Find Services
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Service Type Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {serviceTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedService === type.id ? "elegant" : "outline"}
              size="sm"
              onClick={() => setSelectedService(type.id)}
              className="transition-all duration-300"
            >
              <span className="mr-2">{type.icon}</span>
              {type.name}
            </Button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">47</div>
              <p className="text-sm text-muted-foreground">Services Found</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-fashion-gold">4.6</div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-fashion-rose">0.3</div>
              <p className="text-sm text-muted-foreground">Miles Away</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">12</div>
              <p className="text-sm text-muted-foreground">Open Now</p>
            </CardContent>
          </Card>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="shadow-card hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{service.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-fashion-gold">⭐</span>
                      <span className="font-semibold">{service.rating}</span>
                    </div>
                    <span className={`font-bold ${getPriceColor(service.price)}`}>
                      {service.price}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Distance and Contact */}
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      📍 {service.distance}
                    </Badge>
                    <a 
                      href={`tel:${service.phone}`}
                      className="text-sm text-primary hover:text-accent transition-colors"
                    >
                      {service.phone}
                    </a>
                  </div>

                  {/* Services Offered */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Services</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.services.map((serviceItem, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {serviceItem}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Hours */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Hours</h4>
                    <p className="text-sm text-foreground">{service.hours}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      📞 Call
                    </Button>
                    <Button variant="gold" size="sm" className="flex-1">
                      🗺️ Directions
                    </Button>
                    <Button variant="premium" size="sm" className="flex-1">
                      ⭐ Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Service CTA */}
        <div className="text-center mt-8">
          <Card className="shadow-card bg-secondary/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-primary mb-2">Can't find what you're looking for?</h3>
              <p className="text-muted-foreground mb-4">
                Help us improve by suggesting a service in your area.
              </p>
              <Button variant="premium" size="lg">
                Suggest a Service
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Services;