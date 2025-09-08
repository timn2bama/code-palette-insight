import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf, TrendingDown, Recycle, Droplets, Factory, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface SustainabilityMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  period_start: string;
  period_end: string;
  calculated_at: string;
}

interface CarbonFootprintItem {
  id: string;
  wardrobe_item_id: string;
  manufacturing_impact: number;
  transportation_impact: number;
  usage_impact: number;
  disposal_impact: number;
  total_footprint: number;
  wardrobe_items?: {
    name: string;
    category: string;
    brand: string;
  };
}

const SustainabilityDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SustainabilityMetric[]>([]);
  const [carbonFootprint, setCarbonFootprint] = useState<CarbonFootprintItem[]>([]);
  const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSustainabilityData();
    }
  }, [user]);

  const fetchSustainabilityData = async () => {
    try {
      // Fetch sustainability metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('sustainability_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('calculated_at', { ascending: false });

      if (metricsError) throw metricsError;
      setMetrics(metricsData || []);

      // Fetch carbon footprint data
      const { data: carbonData, error: carbonError } = await supabase
        .from('carbon_footprint_items')
        .select(`
          *,
          wardrobe_items(name, category, brand)
        `)
        .eq('user_id', user?.id);

      if (carbonError) throw carbonError;
      setCarbonFootprint(carbonData || []);

      // Calculate total carbon footprint
      const total = (carbonData || []).reduce((sum, item) => sum + (item.total_footprint || 0), 0);
      setTotalCarbonFootprint(total);

    } catch (error) {
      console.error('Error fetching sustainability data:', error);
      toast({
        title: "Error",
        description: "Failed to load sustainability data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCarbonFootprint = async () => {
    try {
      setLoading(true);
      
      // Call edge function to calculate carbon footprint
      const { data, error } = await supabase.functions.invoke('calculate-carbon-footprint', {
        body: { user_id: user?.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Carbon footprint calculated and updated!",
      });

      fetchSustainabilityData();
    } catch (error) {
      console.error('Error calculating carbon footprint:', error);
      toast({
        title: "Error",
        description: "Failed to calculate carbon footprint",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSustainabilityScore = () => {
    if (totalCarbonFootprint === 0) return 100;
    
    // Calculate score based on carbon footprint per item
    const avgFootprintPerItem = totalCarbonFootprint / Math.max(carbonFootprint.length, 1);
    
    if (avgFootprintPerItem < 5) return 95;
    if (avgFootprintPerItem < 10) return 85;
    if (avgFootprintPerItem < 20) return 70;
    if (avgFootprintPerItem < 50) return 50;
    return 30;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const carbonBreakdown = [
    { name: 'Manufacturing', value: carbonFootprint.reduce((sum, item) => sum + (item.manufacturing_impact || 0), 0), color: '#8884d8' },
    { name: 'Transportation', value: carbonFootprint.reduce((sum, item) => sum + (item.transportation_impact || 0), 0), color: '#82ca9d' },
    { name: 'Usage', value: carbonFootprint.reduce((sum, item) => sum + (item.usage_impact || 0), 0), color: '#ffc658' },
    { name: 'Disposal', value: carbonFootprint.reduce((sum, item) => sum + (item.disposal_impact || 0), 0), color: '#ff7c7c' },
  ];

  const sustainabilityScore = getSustainabilityScore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading sustainability data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sustainability Dashboard</h1>
            <p className="text-muted-foreground">Track your fashion environmental impact and sustainability goals</p>
          </div>
          
          <Button onClick={calculateCarbonFootprint} disabled={loading}>
            <Leaf className="h-4 w-4 mr-2" />
            Calculate Carbon Footprint
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(sustainabilityScore)}`}>
                {sustainabilityScore}/100
              </div>
              <p className="text-xs text-muted-foreground">
                Based on carbon footprint analysis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Carbon Footprint</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCarbonFootprint.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                CO₂ equivalent across all items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items Tracked</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{carbonFootprint.length}</div>
              <p className="text-xs text-muted-foreground">
                Wardrobe items with footprint data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Impact per Item</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {carbonFootprint.length > 0 ? (totalCarbonFootprint / carbonFootprint.length).toFixed(1) : '0'} kg
              </div>
              <p className="text-xs text-muted-foreground">
                CO₂ per wardrobe item
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Carbon Footprint Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Carbon Footprint Breakdown</CardTitle>
              <CardDescription>
                Distribution of CO₂ emissions across lifecycle stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={carbonBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {carbonBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Impact Items */}
          <Card>
            <CardHeader>
              <CardTitle>Highest Impact Items</CardTitle>
              <CardDescription>
                Items with the largest carbon footprints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carbonFootprint
                  .sort((a, b) => (b.total_footprint || 0) - (a.total_footprint || 0))
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {item.wardrobe_items?.brand} {item.wardrobe_items?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.wardrobe_items?.category}
                        </p>
                      </div>
                      <Badge variant={index < 3 ? "destructive" : "secondary"}>
                        {item.total_footprint?.toFixed(1)} kg CO₂
                      </Badge>
                    </div>
                  ))}
                
                {carbonFootprint.length === 0 && (
                  <div className="text-center py-8">
                    <Leaf className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No carbon footprint data available</p>
                    <p className="text-sm text-muted-foreground">
                      Click "Calculate Carbon Footprint" to analyze your wardrobe
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sustainability Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Sustainability Tips</CardTitle>
            <CardDescription>
              Recommendations to reduce your fashion environmental impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Recycle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Buy Second-Hand</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Purchasing pre-loved items can reduce carbon footprint by up to 80%
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Care Properly</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Washing in cold water and air drying can extend item lifespan significantly
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  <h3 className="font-semibold">Quality Over Quantity</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Invest in fewer, higher-quality pieces that last longer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SustainabilityDashboard;