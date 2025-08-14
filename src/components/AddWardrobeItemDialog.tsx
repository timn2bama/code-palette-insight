import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Image, AlertCircle, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { storage, db } from "@/integrations/firebase/client";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ref as dbRef, push, serverTimestamp } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { validateTextInput, validateImageFile, getSafeErrorMessage, rateLimiter } from "@/lib/security";
// NOTE: Audit log and upload limits are temporarily disabled during migration.
// import { useAuditLog } from "@/hooks/useAuditLog";
// import { useUploadLimits } from "@/hooks/useUploadLimits";

interface AddWardrobeItemDialogProps {
  onItemAdded: () => void;
}

const AddWardrobeItemDialog = ({ onItemAdded }: AddWardrobeItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  // NOTE: The following hooks are temporarily disabled.
  // const { logEvent } = useAuditLog();
  // const { canUploadToCategory, getCategoryUsage, uploadLimits, refreshLimits } = useUploadLimits();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    color: "",
    brand: "",
  });

  const categories = [
    "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"
  ];

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        }, 'image/jpeg', 0.5);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and WebP images are allowed",
        variant: "destructive",
      });
      return;
    }

    let processedFile = file;
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Compressing image...",
        description: "Optimizing image for upload",
      });
      processedFile = await compressImage(file);
    }

    const fileValidation = validateImageFile(processedFile);
    if (!fileValidation.isValid) {
      toast({
        title: "Invalid file",
        description: fileValidation.error,
        variant: "destructive",
      });
      return;
    }

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
      if (!rateLimiter.isAllowed('wardrobe-item-creation', 10, 60000)) {
        toast({
          title: "Too many requests",
          description: "Please wait a moment before adding another item.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add items to your wardrobe.",
          variant: "destructive",
        });
        return;
      }

      // NOTE: Upload limits are temporarily disabled.
      // if (!canUploadToCategory(formData.category)) { ... }

      const nameValidation = validateTextInput(formData.name, 'name');
      const colorValidation = validateTextInput(formData.color, 'color');
      const brandValidation = validateTextInput(formData.brand, 'brand');

      if (!nameValidation.isValid || !colorValidation.isValid || !brandValidation.isValid) {
        toast({ title: "Invalid input", description: "Please check your form fields.", variant: "destructive" });
        return;
      }

      let photo_url = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.uid}/${Date.now()}.${fileExt}`;
        const imageRef = storageRef(storage, `wardrobe-photos/${fileName}`);
        
        await uploadBytes(imageRef, selectedFile);
        photo_url = await getDownloadURL(imageRef);
      }

      const itemsRef = dbRef(db, `wardrobe_items/${user.uid}`);
      await push(itemsRef, {
        name: nameValidation.sanitized,
        category: formData.category,
        color: colorValidation.sanitized || null,
        brand: brandValidation.sanitized || null,
        photo_url,
        user_id: user.uid,
        wear_count: 0,
        last_worn: null,
        purchase_date: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // NOTE: Audit log is temporarily disabled.
      // await logEvent({ ... });

      toast({
        title: "Success!",
        description: "Item added to your wardrobe.",
      });

      setFormData({ name: "", category: "", color: "", brand: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      setOpen(false);
      // refreshLimits(); // Temporarily disabled
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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    <div className="flex items-center justify-between w-full">
                      <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* NOTE: Upload limit UI is temporarily disabled */}
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
              className="flex-1"
            >
              {loading ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWardrobeItemDialog;