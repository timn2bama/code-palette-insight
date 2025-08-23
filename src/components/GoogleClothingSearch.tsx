import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
}

export default function GoogleClothingSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Using Google Custom Search API with clothing-focused search
      const clothingQuery = `${searchQuery} clothing fashion buy online`;
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_SEARCH_ENGINE_ID&q=${encodeURIComponent(clothingQuery)}&num=8`;
      
      // For demo purposes, we'll simulate search results
      // In production, you would need to set up Google Custom Search API
      setTimeout(() => {
        const mockResults: SearchResult[] = [
          {
            title: `${searchQuery} - Fashion Collection | Online Store`,
            link: `https://example-store.com/search?q=${encodeURIComponent(searchQuery)}`,
            snippet: `Shop the latest ${searchQuery} from top fashion brands. Free shipping and returns available.`,
            displayLink: "example-store.com",
            formattedUrl: "https://example-store.com"
          },
          {
            title: `Best ${searchQuery} for 2024 | Style Guide`,
            link: `https://style-guide.com/${searchQuery.toLowerCase()}`,
            snippet: `Discover trending ${searchQuery} styles and how to wear them. Expert fashion advice and styling tips.`,
            displayLink: "style-guide.com",
            formattedUrl: "https://style-guide.com"
          },
          {
            title: `${searchQuery} Sale - Up to 50% Off | Fashion Retailer`,
            link: `https://fashion-retailer.com/sale/${searchQuery.toLowerCase()}`,
            snippet: `Save big on ${searchQuery} from your favorite brands. Limited time offers and exclusive deals.`,
            displayLink: "fashion-retailer.com",
            formattedUrl: "https://fashion-retailer.com"
          }
        ];
        
        setResults(mockResults);
        setLoading(false);
        
        toast({
          title: "Search completed",
          description: `Found ${mockResults.length} results for "${searchQuery}"`,
        });
      }, 1000);

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search at this time. Please try again later.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Google Clothing Search
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search for clothing items online to add inspiration to your wardrobe
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for clothing items (e.g., 'black dress', 'winter coat')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading || !searchQuery.trim()}
            className="shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Search Results ({results.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <Card key={index} className="border border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium line-clamp-2 flex-1">
                          {result.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="shrink-0"
                        >
                          <a 
                            href={result.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`Open ${result.title} in new tab`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {result.displayLink}
                      </Badge>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter a search term to find clothing items</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p><strong>Note:</strong> This is a demo version. To enable real Google Search, you'll need to:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Set up Google Custom Search API</li>
            <li>Create a custom search engine focused on clothing/fashion sites</li>
            <li>Add your API credentials to the application</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}