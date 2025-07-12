import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useLocalServices } from "@/hooks/useLocalServices";

const Services = () => {
  const [searchLocation, setSearchLocation] = useState("San Francisco, CA");
  const [currentLocation, setCurrentLocation] = useState("San Francisco, CA");
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();
  
  const { data, loading, error, refetch } = useLocalServices({
    location: currentLocation
  });

  const handleSearch = () => {
    setCurrentLocation(searchLocation);
    refetch();
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          
          if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
          }
          
          const data = await response.json();
          console.log('Geocoding response:', data); // Debug log
          
          // Extract location components with better fallbacks
          const cityName = data.address?.city || 
                          data.address?.town || 
                          data.address?.village ||
                          data.address?.suburb ||
                          data.address?.county ||
                          data.address?.municipality ||
                          data.name ||
                          null;
          
          const state = data.address?.state || 
                       data.address?.state_code ||
                       data.address?.region ||
                       null;
          
          const country = data.address?.country_code?.toUpperCase() || '';
          
          // Build location string with available components
          let fullAddress = '';
          if (cityName && state) {
            fullAddress = `${cityName}, ${state}`;
          } else if (cityName) {
            fullAddress = cityName;
          } else if (state) {
            fullAddress = state;
          } else {
            // Parse from display_name as last resort
            const displayParts = data.display_name?.split(',') || [];
            if (displayParts.length >= 2) {
              fullAddress = `${displayParts[0].trim()}, ${displayParts[1].trim()}`;
            } else if (displayParts.length === 1) {
              fullAddress = displayParts[0].trim();
            } else {
              throw new Error('Unable to parse location name');
            }
          }
          
          setSearchLocation(fullAddress);
          setCurrentLocation(fullAddress);
          
          toast({
            title: "Location Found!",
            description: `Using your current location: ${fullAddress}`,
          });
          
        } catch (error) {
          console.error('Geocoding error:', error);
          // Fallback to coordinates if geocoding fails
          const coordsLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setSearchLocation(coordsLocation);
          setCurrentLocation(coordsLocation);
          
          toast({
            title: "Location Found!",
            description: "Using your current coordinates (geocoding unavailable).",
            variant: "destructive",
          });
        }
        
        setLocationLoading(false);
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case "$": return "text-green-600";
      case "$$": return "text-yellow-600";
      case "$$$": return "text-orange-600";
      case "$$$$": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const servicesCount = data?.stats?.total || 0;
  const avgRating = data?.stats?.avgRating?.toFixed(1) || "0.0";
  const openCount = data?.stats?.openCount || 0;
  const allServices = data ? Object.values(data.servicesByCategory).flat() : [];
  const closestDistance = allServices.length > 0 ? allServices[0].distance : "N/A";

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
                <div className="flex gap-2">
                  <Input 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Enter your location..."
                    className="bg-background/50 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className="px-4"
                    title="Use current GPS location"
                  >
                    {locationLoading ? "📡" : "📍"}
                  </Button>
                </div>
              </div>
              <Button 
                variant="premium" 
                size="lg" 
                className="px-8"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "Searching..." : "🔍 Find Services"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            {[...Array(3)].map((_, categoryIndex) => (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="shadow-card">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Services</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={refetch}>
                🔄 Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Services by Category */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {data.categories.map((category) => {
              const categoryServices = data.servicesByCategory[category.id] || [];
              
              if (categoryServices.length === 0) return null;
              
              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-primary">{category.name}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {categoryServices.length} found
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {categoryServices.map((service) => (
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
                </div>
              );
            })}
            
            {/* No Services Found */}
            {data.categories.every(cat => (data.servicesByCategory[cat.id] || []).length === 0) && (
              <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Services Found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any services in your area. Try searching a different location.
                  </p>
                  <Button variant="outline" onClick={refetch}>
                    🔄 Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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