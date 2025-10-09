import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useWardrobeAnalytics } from "@/hooks/queries/useWardrobeAnalytics";
import { useSubscriptionTiers } from "@/hooks/queries/useSubscriptionTiers";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, ShoppingBag, Star } from "lucide-react";

const Analytics = () => {
  const { analytics, recommendations, loading, generateShoppingRecommendations } = useWardrobeAnalytics();
  const { currentTier, usageStats, trackUsage, getRemainingUsage } = useSubscriptionTiers();
  const { user, subscriptionStatus } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

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

  // Check if user has access to analytics
  const hasAnalyticsAccess = currentTier?.features?.analytics || subscriptionStatus.subscribed;

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <SEO 
          title="Analytics - SyncStyle"
          description="Advanced wardrobe analytics and insights"
          url="/analytics"
        />
        <Navigation />
        <div className="container mx-auto px-4 pt-24">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Premium Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Advanced analytics and insights are available with a Premium or Enterprise subscription.
              </p>
              <Button onClick={() => window.location.href = '/subscription'}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <SEO 
        title="Analytics Dashboard - SyncStyle"
        description="Advanced wardrobe analytics, ROI tracking, and style insights"
        url="/analytics"
      />
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights into your wardrobe performance and style trends</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roi">ROI Tracking</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="recommendations">Shopping</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalItems || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.totalValue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">
                    Wardrobe investment
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Cost/Wear</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.averageCostPerWear?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">
                    Efficiency metric
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usageStats.ai_recommendations}</div>
                  <p className="text-xs text-muted-foreground">
                    AI recommendations used
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Limits for Current Tier */}
            {currentTier && (
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Usage - {currentTier.tier_name} Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AI Recommendations</span>
                      <span>{usageStats.ai_recommendations} / {getRemainingUsage('ai_recommendations') === null ? '∞' : currentTier.limits.ai_recommendations_per_month}</span>
                    </div>
                    <Progress 
                      value={currentTier.limits.ai_recommendations_per_month === -1 ? 0 : (usageStats.ai_recommendations / currentTier.limits.ai_recommendations_per_month) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Photo Uploads</span>
                      <span>{usageStats.photo_uploads} / {getRemainingUsage('photo_uploads') === null ? '∞' : currentTier.limits.photo_uploads_per_month}</span>
                    </div>
                    <Progress 
                      value={currentTier.limits.photo_uploads_per_month === -1 ? 0 : (usageStats.photo_uploads / currentTier.limits.photo_uploads_per_month) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown Chart */}
            {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Wardrobe Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, count }) => `${category}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analytics.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Worn Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Worn Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.mostWornItems?.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.wear_count} wears</p>
                        </div>
                        <Badge variant="secondary">
                          ${item.cost_per_wear.toFixed(2)}/wear
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Least Worn Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Underutilized Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics?.leastWornItems?.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.wear_count} wears</p>
                        </div>
                        <Badge variant="outline">
                          ${item.cost_per_wear > 0 ? item.cost_per_wear.toFixed(2) : '∞'}/wear
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Value Chart */}
            {analytics?.categoryBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.categoryBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Value']} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Usage Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.seasonalUsage && analytics.seasonalUsage.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {analytics.seasonalUsage.map((season) => (
                      <div key={season.season} className="text-center p-4 border rounded-lg">
                        <h3 className="font-semibold capitalize mb-2">{season.season}</h3>
                        <p className="text-2xl font-bold text-primary">{season.usage_count}</p>
                        <p className="text-sm text-muted-foreground">items worn</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No seasonal data available yet. Keep using your wardrobe to see trends!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Shopping Recommendations</h2>
              <Button onClick={generateShoppingRecommendations}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Generate New Recommendations
              </Button>
            </div>

            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="capitalize">{rec.category}</span>
                        <Badge variant={rec.priority >= 4 ? "destructive" : rec.priority >= 3 ? "default" : "secondary"}>
                          Priority {rec.priority}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{rec.reason}</p>
                      {rec.external_links && rec.external_links.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Suggested Items:</p>
                          {rec.external_links.slice(0, 2).map((link: any, index: number) => (
                            <Button key={index} variant="outline" size="sm" className="w-full">
                              View Options
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No shopping recommendations available.</p>
                  <Button 
                    onClick={generateShoppingRecommendations}
                    className="mt-4"
                  >
                    Generate Recommendations
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;