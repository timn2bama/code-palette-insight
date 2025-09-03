import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";
import { 
  Cloud, 
  Calendar, 
  Share2, 
  ShoppingCart,
  Settings,
  Check,
  X,
  ExternalLink
} from "lucide-react";

const Integrations = () => {
  const { integrations, loading, updateIntegration, getUpcomingEvents, shareOutfit, findSimilarItems } = useIntegrations();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("weather");
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const [weatherSettings, setWeatherSettings] = useState({
    default_location: '',
    auto_location: false,
    temperature_unit: 'fahrenheit'
  });

  const [calendarSettings, setCalendarSettings] = useState({
    calendar_provider: 'google',
    sync_enabled: false,
    reminder_hours: 24
  });

  const [socialSettings, setSocialSettings] = useState({
    auto_share: false,
    platforms: {
      instagram: false,
      facebook: false,
      pinterest: false
    }
  });

  const [shoppingSettings, setShoppingSettings] = useState({
    price_alerts: false,
    auto_search: false,
    preferred_stores: []
  });

  const handleWeatherConnect = async () => {
    setIsConnecting('weather');
    try {
      await updateIntegration('weather', weatherSettings, true);
      toast({
        title: "Weather Integration Connected",
        description: "Weather-based outfit recommendations are now active.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect weather integration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleCalendarConnect = async () => {
    setIsConnecting('calendar');
    try {
      await updateIntegration('calendar', calendarSettings, true);
      toast({
        title: "Calendar Integration Connected",
        description: "Event-based outfit suggestions are now available.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect calendar integration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleSocialConnect = async () => {
    setIsConnecting('social_media');
    try {
      await updateIntegration('social_media', socialSettings, true);
      toast({
        title: "Social Media Integration Connected",
        description: "Outfit sharing features are now enabled.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect social media integration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleShoppingConnect = async () => {
    setIsConnecting('shopping');
    try {
      await updateIntegration('shopping', shoppingSettings, true);
      toast({
        title: "Shopping Integration Connected",
        description: "Smart shopping recommendations are now active.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect shopping integration.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const testSocialShare = async () => {
    const success = await shareOutfit(
      { name: "Test Outfit", items: ["shirt", "pants"] },
      ["instagram", "pinterest"]
    );
    
    if (success) {
      toast({
        title: "Share Test Successful",
        description: "Your outfit would be shared to selected platforms.",
      });
    } else {
      toast({
        title: "Share Test Failed",
        description: "Unable to share outfit. Check your settings.",
        variant: "destructive",
      });
    }
  };

  const testShoppingSimilar = async () => {
    const items = await findSimilarItems("blue denim jacket", "outerwear");
    if (items.length > 0) {
      toast({
        title: "Similar Items Found",
        description: `Found ${items.length} similar items across platforms.`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const isConnected = (type: string) => {
    return integrations.some(i => i.integration_type === type && i.is_active);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEO 
        title="Integrations - SyncStyle"
        description="Connect your wardrobe to weather, calendar, shopping, and social platforms"
        url="/integrations"
      />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Integrations</h1>
          <p className="text-muted-foreground">Connect your wardrobe to external services for enhanced functionality</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weather">
              <Cloud className="w-4 h-4 mr-2" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
            <TabsTrigger value="shopping">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Shopping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weather" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Cloud className="w-5 h-5 mr-2" />
                    Weather Integration
                  </div>
                  <Badge variant={isConnected('weather') ? "default" : "secondary"}>
                    {isConnected('weather') ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {isConnected('weather') ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Default Location</Label>
                  <Input
                    id="location"
                    placeholder="Enter city name"
                    value={weatherSettings.default_location}
                    onChange={(e) => setWeatherSettings(prev => ({ ...prev, default_location: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-location"
                    checked={weatherSettings.auto_location}
                    onCheckedChange={(checked) => setWeatherSettings(prev => ({ ...prev, auto_location: checked }))}
                  />
                  <Label htmlFor="auto-location">Auto-detect location</Label>
                </div>

                <div className="space-y-2">
                  <Label>Temperature Unit</Label>
                  <div className="flex space-x-4">
                    <Button
                      variant={weatherSettings.temperature_unit === 'fahrenheit' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWeatherSettings(prev => ({ ...prev, temperature_unit: 'fahrenheit' }))}
                    >
                      Fahrenheit
                    </Button>
                    <Button
                      variant={weatherSettings.temperature_unit === 'celsius' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWeatherSettings(prev => ({ ...prev, temperature_unit: 'celsius' }))}
                    >
                      Celsius
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleWeatherConnect}
                  disabled={isConnecting === 'weather'}
                  className="w-full"
                >
                  {isConnecting === 'weather' ? 'Connecting...' : isConnected('weather') ? 'Update Settings' : 'Connect Weather'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Calendar Integration
                  </div>
                  <Badge variant={isConnected('calendar') ? "default" : "secondary"}>
                    {isConnected('calendar') ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {isConnected('calendar') ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Calendar Provider</Label>
                  <div className="flex space-x-2">
                    <Button
                      variant={calendarSettings.calendar_provider === 'google' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarSettings(prev => ({ ...prev, calendar_provider: 'google' }))}
                    >
                      Google Calendar
                    </Button>
                    <Button
                      variant={calendarSettings.calendar_provider === 'outlook' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarSettings(prev => ({ ...prev, calendar_provider: 'outlook' }))}
                    >
                      Outlook
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="sync-enabled"
                    checked={calendarSettings.sync_enabled}
                    onCheckedChange={(checked) => setCalendarSettings(prev => ({ ...prev, sync_enabled: checked }))}
                  />
                  <Label htmlFor="sync-enabled">Enable event-based outfit suggestions</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-hours">Outfit reminder (hours before event)</Label>
                  <Input
                    id="reminder-hours"
                    type="number"
                    value={calendarSettings.reminder_hours}
                    onChange={(e) => setCalendarSettings(prev => ({ ...prev, reminder_hours: parseInt(e.target.value) }))}
                  />
                </div>

                <Button 
                  onClick={handleCalendarConnect}
                  disabled={isConnecting === 'calendar'}
                  className="w-full"
                >
                  {isConnecting === 'calendar' ? 'Connecting...' : isConnected('calendar') ? 'Update Settings' : 'Connect Calendar'}
                </Button>

                {isConnected('calendar') && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Upcoming Events</h4>
                    <div className="space-y-2">
                      {getUpcomingEvents().slice(0, 3).map(event => (
                        <div key={event.id} className="flex justify-between items-center text-sm">
                          <span>{event.title}</span>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Social Media Integration
                  </div>
                  <Badge variant={isConnected('social_media') ? "default" : "secondary"}>
                    {isConnected('social_media') ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {isConnected('social_media') ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-share"
                    checked={socialSettings.auto_share}
                    onCheckedChange={(checked) => setSocialSettings(prev => ({ ...prev, auto_share: checked }))}
                  />
                  <Label htmlFor="auto-share">Auto-share favorite outfits</Label>
                </div>

                <div className="space-y-3">
                  <Label>Connected Platforms</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="instagram"
                        checked={socialSettings.platforms.instagram}
                        onCheckedChange={(checked) => setSocialSettings(prev => ({ 
                          ...prev, 
                          platforms: { ...prev.platforms, instagram: checked }
                        }))}
                      />
                      <Label htmlFor="instagram">Instagram</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="facebook"
                        checked={socialSettings.platforms.facebook}
                        onCheckedChange={(checked) => setSocialSettings(prev => ({ 
                          ...prev, 
                          platforms: { ...prev.platforms, facebook: checked }
                        }))}
                      />
                      <Label htmlFor="facebook">Facebook</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pinterest"
                        checked={socialSettings.platforms.pinterest}
                        onCheckedChange={(checked) => setSocialSettings(prev => ({ 
                          ...prev, 
                          platforms: { ...prev.platforms, pinterest: checked }
                        }))}
                      />
                      <Label htmlFor="pinterest">Pinterest</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSocialConnect}
                    disabled={isConnecting === 'social_media'}
                    className="flex-1"
                  >
                    {isConnecting === 'social_media' ? 'Connecting...' : isConnected('social_media') ? 'Update Settings' : 'Connect Social'}
                  </Button>
                  
                  {isConnected('social_media') && (
                    <Button 
                      variant="outline"
                      onClick={testSocialShare}
                    >
                      Test Share
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shopping" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Shopping Integration
                  </div>
                  <Badge variant={isConnected('shopping') ? "default" : "secondary"}>
                    {isConnected('shopping') ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {isConnected('shopping') ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="price-alerts"
                    checked={shoppingSettings.price_alerts}
                    onCheckedChange={(checked) => setShoppingSettings(prev => ({ ...prev, price_alerts: checked }))}
                  />
                  <Label htmlFor="price-alerts">Enable price drop alerts</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-search"
                    checked={shoppingSettings.auto_search}
                    onCheckedChange={(checked) => setShoppingSettings(prev => ({ ...prev, auto_search: checked }))}
                  />
                  <Label htmlFor="auto-search">Auto-search for similar items</Label>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Shopping Platforms</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input type="checkbox" id="amazon" className="rounded" />
                      <Label htmlFor="amazon">Amazon</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input type="checkbox" id="nordstrom" className="rounded" />
                      <Label htmlFor="nordstrom">Nordstrom</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input type="checkbox" id="zara" className="rounded" />
                      <Label htmlFor="zara">Zara</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <input type="checkbox" id="hm" className="rounded" />
                      <Label htmlFor="hm">H&M</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleShoppingConnect}
                    disabled={isConnecting === 'shopping'}
                    className="flex-1"
                  >
                    {isConnecting === 'shopping' ? 'Connecting...' : isConnected('shopping') ? 'Update Settings' : 'Connect Shopping'}
                  </Button>
                  
                  {isConnected('shopping') && (
                    <Button 
                      variant="outline"
                      onClick={testShoppingSimilar}
                    >
                      Test Search
                    </Button>
                  )}
                </div>

                {isConnected('shopping') && (
                  <div className="mt-4 p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Quick Actions</h4>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Find Similar Items
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3 mr-1" />
                        Manage Alerts
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Integrations;