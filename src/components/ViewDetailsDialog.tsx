import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Upload, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  wearCount: number;
  lastWorn: string;
  color: string | null;
  brand: string | null;
  photo_url?: string | null;
}

interface ViewDetailsDialogProps {
  item: ClothingItem;
  children: React.ReactNode;
  onItemUpdated?: () => void;
}

const ViewDetailsDialog = ({ item, children, onItemUpdated }: ViewDetailsDialogProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  // Use the uploaded photo if available, otherwise show placeholder
  const photos = item.photo_url ? [item.photo_url] : [
    `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=600&fit=crop`
  ];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${item.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('wardrobe-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wardrobe-photos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('wardrobe_items')
        .update({ photo_url: publicUrl })
        .eq('id', item.id);

      if (updateError) throw updateError;

      toast.success('Photo uploaded successfully!');
      onItemUpdated?.();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[80vh]">
          {/* Photo Gallery */}
          <div className="space-y-4">
            {/* Main Photo Display */}
            <div className="relative group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary/20">
                <img
                  src={photos[currentPhotoIndex]}
                  alt={`${item.name} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                      onClick={prevPhoto}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                      onClick={nextPhoto}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Photo Counter */}
                {photos.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-sm">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                )}
              </div>
            </div>

            {/* Photo Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className={cn(
                      "flex-shrink-0 aspect-square w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                      currentPhotoIndex === index
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <img
                      src={photo}
                      alt={`${item.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Upload New Photo Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Photo'}
            </Button>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.color && <Badge variant="secondary">{item.color}</Badge>}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brand</span>
                    <span className="font-medium">{item.brand || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium capitalize">{item.category}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wear Statistics */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="text-fashion-gold">📊</span>
                  Wear Statistics
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Times Worn</span>
                    <span className="font-medium">{item.wearCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Worn</span>
                    <span className="font-medium">{item.lastWorn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium">
                      {item.wearCount > 20 ? "High" : item.wearCount > 10 ? "Medium" : "Low"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Care Instructions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <span className="text-fashion-gold">🧺</span>
                  Care Instructions
                </h4>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>• Machine wash cold with like colors</div>
                  <div>• Tumble dry low heat</div>
                  <div>• Iron on medium heat if needed</div>
                  <div>• Do not bleach</div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="elegant">
                Mark as Worn Today
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" disabled>
                  Add to Outfit
                </Button>
                <Button variant="outline" disabled>
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsDialog;