import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image, AlertCircle, Crown, Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateTextInput, validateImageFile, getSafeErrorMessage, rateLimiter } from "@/lib/security";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useUploadLimits } from "@/hooks/useUploadLimits";

interface AddWardrobeItemDialogProps {
  onItemAdded: () => void;
}

const AddWardrobeItemDialog = ({ onItemAdded }: AddWardrobeItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { logEvent } = useAuditLog();
  const { canUploadToCategory, getCategoryUsage, uploadLimits, refreshLimits } = useUploadLimits();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
  });

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const categories = [
    "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"
  ];

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        console.log('Original image dimensions:', img.width, 'x', img.height);
        
        // Very aggressive compression for phone cameras
        // Max 800px to ensure it stays under limits
        const maxSize = 800;
        let { width, height } = img;
        
        // Always resize if either dimension is over maxSize
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        console.log('Compressed image dimensions:', width, 'x', height);
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress with much lower quality for smaller files
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Blob size after compression:', blob.size, 'bytes');
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', 0.5); // Much lower quality for smaller file size
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-clothing-items', {
        body: { query: searchQuery }
      });

      if (error) {
        throw error;
      }

      setSearchResults(data.results || []);
      setShowSearchResults(true);
      
      toast({
        title: "Search completed",
        description: `Found ${data.results?.length || 0} clothing items`,
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for clothing items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: any) => {
    try {
      // Auto-fill form with search result data
      setFormData({
        name: result.title || "",
        category: result.suggestedCategory || "",
        color: result.suggestedColor || "",
        brand: result.suggestedBrand || "",
      });

      // For now, just set the preview URL without trying to download
      // The user can manually upload a photo if needed
      if (result.image) {
        setPreviewUrl(result.image);
      }

      setShowSearchResults(false);
      
      toast({
        title: "Item selected",
        description: "Form filled with search result. Upload a photo manually if needed.",
      });

    } catch (error) {
      console.error('Error selecting search result:', error);
      toast({
        title: "Error",
        description: "Failed to load selected item. Please try manually entering the details.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type first
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    let processedFile = file;
    
    // Always compress images from phone cameras (typically > 2MB) or large images
    if (file.size > 2 * 1024 * 1024) {
      console.log('Original file size:', file.size, 'bytes');
      toast({
        title: "Compressing image...",
        description: "Optimizing image for upload",
      });
      processedFile = await compressImage(file);
      console.log('Compressed file size:', processedFile.size, 'bytes');
    }

    // Final validation on compressed file
    const fileValidation = validateImageFile(processedFile);
    if (!fileValidation.isValid) {
      console.error('File validation failed:', fileValidation.error);
      toast({
        title: "Invalid file",
        description: fileValidation.error,
        variant: "destructive",
      });
      return;
    }

    console.log('File passed validation, setting as selected file');

    setSelectedFile(processedFile);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(processedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limiting check
      if (!rateLimiter.isAllowed('wardrobe-item-creation', 10, 60000)) {
        toast({
          title: "Too many requests",
          description: "Please wait a moment before adding another item.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your wardrobe.",
          variant: "destructive",
        });
        return;
      }

      // Check upload limits for selected category
      if (!canUploadToCategory(formData.category)) {
        const usage = getCategoryUsage(formData.category);
        toast({
          title: "Upload limit reached",
          description: `You can only upload ${usage.limit} items per category on the free plan. Upgrade to Premium for unlimited uploads.`,
          variant: "destructive",
        });
        return;
      }

      // Validate and sanitize inputs
      const nameValidation = validateTextInput(formData.name, 'name');
      const colorValidation = validateTextInput(formData.color, 'color');
      const brandValidation = validateTextInput(formData.brand, 'brand');

      if (!nameValidation.isValid) {
        toast({
          title: "Invalid name",
          description: nameValidation.error,
          variant: "destructive",
        });
        return;
      }

      if (!colorValidation.isValid) {
        toast({
          title: "Invalid color",
          description: colorValidation.error,
          variant: "destructive",
        });
        return;
      }

      if (!brandValidation.isValid) {
        toast({
          title: "Invalid brand",
          description: brandValidation.error,
          variant: "destructive",
        });
        return;
      }

      let photoUrl = null;

      // Upload photo if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('wardrobe-photos')
          .upload(fileName, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('wardrobe-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      // Insert wardrobe item with sanitized data
      const { error: insertError } = await supabase
        .from('wardrobe_items')
        .insert({
          name: nameValidation.sanitized,
          category: formData.category,
          color: colorValidation.sanitized || null,
          brand: brandValidation.sanitized || null,
          photo_url: photoUrl,
          user_id: user.id,
        });

      if (insertError) {
        throw insertError;
      }

      // Log the creation for audit purposes
      await logEvent({
        event_type: 'wardrobe_item_created',
        details: {
          item_name: nameValidation.sanitized,
          category: formData.category,
          has_photo: !!photoUrl
        }
      });

      toast({
        title: "Success!",
        description: "Item added to your wardrobe.",
      });

      // Reset form
      setFormData({ name: "", category: "", color: "", brand: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setOpen(false);
      refreshLimits(); // Refresh limits after successful upload
      onItemAdded();

    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="premium" size="lg" className="shadow-glow">
          Add New Item to Wardrobe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Wardrobe Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Google Search Section */}
          <div className="space-y-3 border-b border-border pb-4">
            <Label className="text-base font-semibold">🔍 Quick Search & Add</Label>
            <p className="text-sm text-muted-foreground">Search Google for clothing items to auto-fill the form</p>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for clothing items..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
                size="default"
              >
                {isSearching ? "Searching..." : <Search className="w-4 h-4" />}
              </Button>
            </div>
            
            {/* Search Results */}
            {showSearchResults && (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-border rounded-md p-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Search Results</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearchResults(false)}
                  >
                    Close
                  </Button>
                </div>
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No results found. Try a different search term.</p>
                ) : (
                  <div className="grid gap-2">
                    {searchResults.slice(0, 6).map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-md border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => handleSelectSearchResult(result)}
                      >
                        {result.image && (
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-12 h-12 object-cover rounded-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{result.snippet}</p>
                          {(result.suggestedCategory || result.suggestedColor || result.suggestedBrand) && (
                            <div className="flex gap-1 mt-1">
                              {result.suggestedCategory && (
                                <span className="text-xs bg-primary/10 text-primary px-1 rounded">
                                  {result.suggestedCategory}
                                </span>
                              )}
                              {result.suggestedColor && (
                                <span className="text-xs bg-secondary text-secondary-foreground px-1 rounded">
                                  {result.suggestedColor}
                                </span>
                              )}
                              {result.suggestedBrand && (
                                <span className="text-xs bg-accent text-accent-foreground px-1 rounded">
                                  {result.suggestedBrand}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
              {previewUrl ? (
                <div className="space-y-2">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Remove Photo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload a photo</p>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Black Blazer"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const usage = getCategoryUsage(category);
                  const isAtLimit = !canUploadToCategory(category);
                  return (
                    <SelectItem key={category} value={category} disabled={isAtLimit}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        {!uploadLimits.isUnlimited && (
                          <span className={`text-xs ml-2 ${isAtLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {usage.used}/{usage.limit}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {formData.category && !uploadLimits.isUnlimited && (
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const usage = getCategoryUsage(formData.category);
                  return `${usage.used}/${usage.limit} items used in this category`;
                })()}
              </div>
            )}
            {!uploadLimits.isUnlimited && (
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertDescription>
                  Free plan: 4 items per category. <strong>Upgrade to Premium for unlimited uploads!</strong>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g., Black, Navy, Red"
            />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Zara, H&M, Nike"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.category}
              className="flex-1 bg-gradient-primary hover:opacity-90"
            >
              {loading ? "Adding to Wardrobe..." : "💾 Add to Wardrobe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWardrobeItemDialog;