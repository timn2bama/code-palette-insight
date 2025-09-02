import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import SocialOutfitCard from '@/components/social/SocialOutfitCard';
import SocialViewOutfitDialog from '@/components/social/SocialViewOutfitDialog';
import { useSocialOutfits, SocialOutfit } from '@/hooks/useSocialOutfits';
import { useAuth } from '@/contexts/AuthContext';
import { Search, TrendingUp, Users, Award } from 'lucide-react';
import SEO from '@/components/SEO';

const Explore = () => {
  const [outfits, setOutfits] = useState<SocialOutfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<SocialOutfit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [occasionFilter, setOccasionFilter] = useState('all');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [selectedOutfit, setSelectedOutfit] = useState<SocialOutfit | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { user } = useAuth();
  const {
    loading,
    fetchPublicOutfits,
    likeOutfit,
    unlikeOutfit,
    rateOutfit,
    addComment
  } = useSocialOutfits();

  useEffect(() => {
    loadOutfits();
  }, []);

  useEffect(() => {
    filterOutfits();
  }, [outfits, searchQuery, occasionFilter, seasonFilter]);

  const loadOutfits = async () => {
    const data = await fetchPublicOutfits(50);
    setOutfits(data);
  };

  const filterOutfits = () => {
    let filtered = [...outfits];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(outfit =>
        outfit.name.toLowerCase().includes(query) ||
        outfit.description?.toLowerCase().includes(query) ||
        outfit.profiles?.display_name?.toLowerCase().includes(query)
      );
    }

    if (occasionFilter !== 'all') {
      filtered = filtered.filter(outfit => outfit.occasion === occasionFilter);
    }

    if (seasonFilter !== 'all') {
      filtered = filtered.filter(outfit => outfit.season === seasonFilter);
    }

    setFilteredOutfits(filtered);
  };

  const handleViewOutfit = (outfit: SocialOutfit) => {
    setSelectedOutfit(outfit);
    setViewDialogOpen(true);
  };

  const handleLike = async (outfitId: string) => {
    if (!user) return;
    const success = await likeOutfit(outfitId);
    if (success) {
      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { 
              ...outfit, 
              _count: { 
                ...outfit._count, 
                likes: (outfit._count?.likes || 0) + 1 
              },
              user_liked: true
            }
          : outfit
      ));
    }
  };

  const handleUnlike = async (outfitId: string) => {
    if (!user) return;
    const success = await unlikeOutfit(outfitId);
    if (success) {
      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId 
          ? { 
              ...outfit, 
              _count: { 
                ...outfit._count, 
                likes: Math.max((outfit._count?.likes || 0) - 1, 0)
              },
              user_liked: false
            }
          : outfit
      ));
    }
  };

  const handleRate = async (outfitId: string, rating: number) => {
    if (!user) return;
    await rateOutfit(outfitId, rating);
    // Optimistically update the UI
    setOutfits(prev => prev.map(outfit => 
      outfit.id === outfitId 
        ? { ...outfit, user_rating: rating }
        : outfit
    ));
  };

  const handleComment = (outfitId: string) => {
    // This would open a comment dialog - simplified for now
    const comment = prompt('Add a comment:');
    if (comment) {
      addComment(outfitId, comment);
    }
  };

  const occasions = Array.from(new Set(outfits.map(o => o.occasion).filter(Boolean)));
  const seasons = Array.from(new Set(outfits.map(o => o.season).filter(Boolean)));

  return (
    <>
      <SEO 
        title="Explore Outfits - Style Discovery"
        description="Discover trending outfit ideas, browse popular styles, and get inspired by fashion-forward looks from our community."
        keywords="outfit inspiration, fashion trends, style discovery, wardrobe ideas"
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Explore Outfits</h1>
              <p className="text-muted-foreground">
                Discover trending styles and get inspired by the community
              </p>
            </div>

            <Tabs defaultValue="trending" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="trending" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  <Users className="h-4 w-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="top-rated" className="gap-2">
                  <Award className="h-4 w-4" />
                  Top Rated
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search outfits, creators, or styles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={occasionFilter} onValueChange={setOccasionFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Occasion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Occasions</SelectItem>
                      {occasions.map((occasion) => (
                        <SelectItem key={occasion} value={occasion}>
                          {occasion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      {seasons.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="trending" className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-muted animate-pulse rounded-lg h-96" />
                    ))}
                  </div>
                ) : filteredOutfits.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOutfits.map((outfit) => (
                      <SocialOutfitCard
                        key={outfit.id}
                        outfit={outfit}
                        onLike={handleLike}
                        onUnlike={handleUnlike}
                        onRate={handleRate}
                        onComment={handleComment}
                        onView={handleViewOutfit}
                        userLiked={outfit.user_liked}
                        userRating={outfit.user_rating}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No outfits found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or check back later for new content.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent">
                <div className="text-center py-12 text-muted-foreground">
                  Recent outfits view - Same layout as trending
                </div>
              </TabsContent>

              <TabsContent value="top-rated">
                <div className="text-center py-12 text-muted-foreground">
                  Top rated outfits view - Same layout as trending
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {selectedOutfit && (
          <SocialViewOutfitDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            outfit={selectedOutfit}
            onLike={handleLike}
            onUnlike={handleUnlike}
            onRate={handleRate}
            userLiked={selectedOutfit.user_liked}
            userRating={selectedOutfit.user_rating}
          />
        )}
      </div>
    </>
  );
};

export default Explore;