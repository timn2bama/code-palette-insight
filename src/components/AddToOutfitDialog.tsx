import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CreateOutfitDialog from "./CreateOutfitDialog";
import { db } from "@/integrations/firebase/client";
import { ref, get, update } from "firebase/database";

interface Outfit {
  id: string;
  name: string;
  description: string | null;
  occasion: string | null;
  season: string | null;
  created_at: string;
  items: { [itemId: string]: any } | null;
}

interface ClothingItem {
  id: string;
  name: string;
}

interface AddToOutfitDialogProps {
  item: ClothingItem;
  children: React.ReactNode;
}

const AddToOutfitDialog = ({ item, children }: AddToOutfitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingToOutfit, setAddingToOutfit] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchOutfits();
    }
  }, [open, user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = outfits.filter(outfit =>
        outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.occasion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.season?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOutfits(filtered);
    } else {
      setFilteredOutfits(outfits);
    }
  }, [searchQuery, outfits]);

  const fetchOutfits = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const outfitsRef = ref(db, `outfits/${user.uid}`);
      const snapshot = await get(outfitsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const transformedOutfits = Object.entries(data).map(([id, outfit]) => ({
          id,
          ...outfit as Omit<Outfit, 'id'>,
        }));
        setOutfits(transformedOutfits.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else {
        setOutfits([]);
      }
    } catch (error) {
      console.error('Error fetching outfits:', error);
      toast.error('Failed to load outfits');
    } finally {
      setLoading(false);
    }
  };

  const addToOutfit = async (outfitId: string) => {
    if (!user) return;

    setAddingToOutfit(outfitId);
    try {
      if (isItemInOutfit(outfits.find(o => o.id === outfitId)!)) {
        toast.info('Item is already in this outfit');
        return;
      }

      // Get the full wardrobe item details to denormalize
      const wardrobeItemRef = ref(db, `wardrobe_items/${user.uid}/${item.id}`);
      const snapshot = await get(wardrobeItemRef);
      if (!snapshot.exists()) {
        throw new Error("Could not find the wardrobe item to add.");
      }
      const itemDetails = snapshot.val();

      const outfitItemsRef = ref(db, `outfits/${user.uid}/${outfitId}/items`);
      await update(outfitItemsRef, {
        [item.id]: {
          name: itemDetails.name,
          category: itemDetails.category,
          color: itemDetails.color,
          photo_url: itemDetails.photo_url,
        }
      });

      const outfit = outfits.find(o => o.id === outfitId);
      toast.success(`Added "${item.name}" to "${outfit?.name}"`);
      setOpen(false);
    } catch (error) {
      console.error('Error adding to outfit:', error);
      toast.error('Failed to add item to outfit');
    } finally {
      setAddingToOutfit(null);
    }
  };

  const isItemInOutfit = (outfit: Outfit) => {
    return outfit.items && outfit.items[item.id];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] mx-4 sm:mx-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add "{item.name}" to Outfit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Search and Create New */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <CreateOutfitDialog 
              onOutfitCreated={() => {
                fetchOutfits();
                setOpen(false);
              }}
              initialItem={item}
            >
              <Button variant="outline" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Create New Outfit with This Item
              </Button>
            </CreateOutfitDialog>
          </div>

          {/* Existing Outfits */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading outfits...</p>
              </div>
            ) : filteredOutfits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery ? 'No outfits match your search' : 'No outfits created yet'}
                </p>
              </div>
            ) : (
              filteredOutfits.map((outfit) => (
                <Card key={outfit.id} className="hover:shadow-md transition-shadow">
                   <CardContent className="p-4">
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                       <div className="flex-1">
                         <h3 className="font-semibold">{outfit.name}</h3>
                         {outfit.description && (
                           <p className="text-sm text-muted-foreground mt-1">
                             {outfit.description}
                           </p>
                         )}
                         <div className="flex gap-2 mt-2">
                           {outfit.occasion && (
                             <Badge variant="secondary" className="text-xs">
                               {outfit.occasion}
                             </Badge>
                           )}
                           {outfit.season && (
                             <Badge variant="outline" className="text-xs">
                               {outfit.season}
                             </Badge>
                           )}
                         </div>
                         <p className="text-xs text-muted-foreground mt-2">
                           {outfit.items ? Object.keys(outfit.items).length : 0} item{outfit.items && Object.keys(outfit.items).length !== 1 ? 's' : ''}
                         </p>
                       </div>
                       
                       <div className="sm:ml-4 w-full sm:w-auto">
                         {isItemInOutfit(outfit) ? (
                           <Button variant="outline" disabled className="gap-2 w-full sm:w-auto">
                             <Check className="h-4 w-4" />
                             Added
                           </Button>
                         ) : (
                           <Button
                             variant="gold"
                             size="sm"
                             onClick={() => addToOutfit(outfit.id)}
                             disabled={addingToOutfit === outfit.id}
                             className="gap-2 w-full sm:w-auto"
                           >
                             <Plus className="h-4 w-4" />
                             {addingToOutfit === outfit.id ? 'Adding...' : 'Add'}
                           </Button>
                         )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToOutfitDialog;
