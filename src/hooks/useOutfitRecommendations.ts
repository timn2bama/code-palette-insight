import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
      const { data: wardrobeItems, error } = await supabase
        .from('wardrobe_items')
        .select('*');

      if (error) throw error;

      // Simple outfit recommendation algorithm
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
    
    // Group items by category
    const itemsByCategory = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, WardrobeItem[]>);

    // Define outfit templates
    const outfitTemplates = [
      {
        name: 'Business Casual',
        categories: ['tops', 'bottoms', 'shoes'],
        occasion: 'work',
        season: 'all seasons',
        description: 'Professional yet comfortable for the office'
      },
      {
        name: 'Weekend Casual',
        categories: ['tops', 'bottoms', 'shoes'],
        occasion: 'casual',
        season: 'all seasons',
        description: 'Relaxed and comfortable for weekend activities'
      },
      {
        name: 'Evening Out',
        categories: ['dresses', 'shoes'],
        occasion: 'date night',
        season: 'all seasons',
        description: 'Elegant look for dinner or entertainment'
      },
      {
        name: 'Layered Look',
        categories: ['tops', 'outerwear', 'bottoms', 'shoes'],
        occasion: 'casual',
        season: 'fall',
        description: 'Perfect for transitional weather'
      }
    ];

    // Generate combinations based on templates
    outfitTemplates.forEach((template, index) => {
      const outfitItems: WardrobeItem[] = [];
      let matchScore = 100;

      // If we have a base item, start with that
      if (baseItem) {
        outfitItems.push(baseItem);
        // Reduce match score if base item doesn't fit template
        if (!template.categories.includes(baseItem.category)) {
          matchScore -= 20;
        }
      }

      // Fill remaining categories
      template.categories.forEach(category => {
        const categoryItems = itemsByCategory[category] || [];
        
        // Skip if we already have an item from this category (from base item)
        if (baseItem && baseItem.category === category) return;

        if (categoryItems.length > 0) {
          // Simple selection: pick first available item
          // In a real app, this would be more sophisticated (color matching, style compatibility, etc.)
          const selectedItem = categoryItems[Math.floor(Math.random() * categoryItems.length)];
          outfitItems.push(selectedItem);
        } else {
          // Reduce score if we can't find items for this category
          matchScore -= 30;
        }
      });

      // Only add suggestion if we have at least 2 items and decent match score
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

    // Sort by match score
    return suggestions.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
  };

  const createOutfitFromSuggestion = async (suggestion: OutfitSuggestion, name: string) => {
    if (!user) return;

    try {
      // Create the outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name,
          description: suggestion.description,
          occasion: suggestion.occasion,
          season: suggestion.season
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Add items to the outfit
      const outfitItems = suggestion.items.map(item => ({
        outfit_id: outfit.id,
        wardrobe_item_id: item.id
      }));

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItems);

      if (itemsError) throw itemsError;

      return outfit;
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