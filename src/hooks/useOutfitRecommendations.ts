import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/integrations/firebase/client";
import { ref, get, push, serverTimestamp } from "firebase/database";

interface WardrobeItem {
  id: string;
  name: string;
  category: string;
  color: string | null;
  photo_url: string | null;
}

interface OutfitSuggestion {
  id: string;
  items: WardrobeItem[];
  occasion: string;
  season: string;
  matchScore: number;
  description: string;
}

export const useOutfitRecommendations = () => {
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const generateSuggestions = async (baseItem?: WardrobeItem) => {
    if (!user) return;

    setLoading(true);
    try {
      const wardrobeRef = ref(db, `wardrobe_items/${user.uid}`);
      const snapshot = await get(wardrobeRef);

      let wardrobeItems: WardrobeItem[] = [];
      if (snapshot.exists()) {
        wardrobeItems = Object.entries(snapshot.val()).map(([id, item]) => ({
          id,
          ...item as Omit<WardrobeItem, 'id'>
        }));
      }

      const outfitSuggestions = generateOutfitCombinations(wardrobeItems, baseItem);
      setSuggestions(outfitSuggestions);
    } catch (error) {
      console.error('Error generating outfit suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOutfitCombinations = (
    items: WardrobeItem[], 
    baseItem?: WardrobeItem
  ): OutfitSuggestion[] => {
    const suggestions: OutfitSuggestion[] = [];
    
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, WardrobeItem[]>);

    const outfitTemplates = [
      { name: 'Business Casual', categories: ['tops', 'bottoms', 'shoes'], occasion: 'work', season: 'all seasons', description: 'Professional yet comfortable' },
      { name: 'Weekend Casual', categories: ['tops', 'bottoms', 'shoes'], occasion: 'casual', season: 'all seasons', description: 'Relaxed and comfortable' },
      { name: 'Evening Out', categories: ['dresses', 'shoes'], occasion: 'date night', season: 'all seasons', description: 'Elegant look for dinner' },
      { name: 'Layered Look', categories: ['tops', 'outerwear', 'bottoms', 'shoes'], occasion: 'casual', season: 'fall', description: 'Perfect for transitional weather' }
    ];

    outfitTemplates.forEach((template, index) => {
      const outfitItems: WardrobeItem[] = [];
      let matchScore = 100;

      if (baseItem) {
        outfitItems.push(baseItem);
        if (!template.categories.includes(baseItem.category)) {
          matchScore -= 20;
        }
      }

      template.categories.forEach(category => {
        const categoryItems = itemsByCategory[category] || [];
        if (baseItem && baseItem.category === category) return;

        if (categoryItems.length > 0) {
          const selectedItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          outfitItems.push(selectedItem);
        } else {
          matchScore -= 30;
        }
      });

      if (outfitItems.length >= 2 && matchScore >= 50) {
        suggestions.push({
          id: `suggestion-${index}`,
          items: outfitItems,
          occasion: template.occasion,
          season: template.season,
          matchScore,
          description: template.description
        });
      }
    });

    return suggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  };

  const createOutfitFromSuggestion = async (suggestion: OutfitSuggestion, name: string) => {
    if (!user) return;

    try {
      const outfitsRef = ref(db, `outfits/${user.uid}`);
      const newOutfit = {
        user_id: user.uid,
        name,
        description: suggestion.description,
        occasion: suggestion.occasion,
        season: suggestion.season,
        created_at: serverTimestamp(),
        items: suggestion.items.reduce((acc, item) => {
          acc[item.id] = {
            name: item.name,
            category: item.category,
            color: item.color,
            photo_url: item.photo_url
          };
          return acc;
        }, {} as { [key: string]: any })
      };

      await push(outfitsRef, newOutfit);
      return newOutfit;
    } catch (error) {
      console.error('Error creating outfit from suggestion:', error);
      throw error;
    }
  };

  return {
    suggestions,
    loading,
    generateSuggestions,
    createOutfitFromSuggestion
  };
};