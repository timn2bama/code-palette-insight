import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClothingAnalysis {
  category: string;
  confidence: number;
  subcategory?: string;
  colors: {
    dominant: string;
    palette: string[];
    hex_codes: string[];
  };
  patterns: {
    type: string;
    confidence: number;
  }[];
  fabric: {
    texture: string;
    material_guess: string;
    confidence: number;
  };
  fit_assessment: {
    fit_type: string;
    size_recommendation: string;
    confidence: number;
  };
  style_tags: string[];
  season_suitability: string[];
}

interface ProcessingOptions {
  includeColors?: boolean;
  includePatterns?: boolean;
  includeFabric?: boolean;
  includeFit?: boolean;
  includeStyle?: boolean;
}

export const useComputerVision = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<ClothingAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeClothingImage = useCallback(async (
    image: File,
    options: ProcessingOptions = {}
  ): Promise<ClothingAnalysis | null> => {
    try {
      setIsProcessing(true);

      // Convert image to base64
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(image);
      });

      const { data, error } = await supabase.functions.invoke('computer-vision-analysis', {
        body: {
          image: base64Image,
          options: {
            includeColors: options.includeColors ?? true,
            includePatterns: options.includePatterns ?? true,
            includeFabric: options.includeFabric ?? true,
            includeFit: options.includeFit ?? true,
            includeStyle: options.includeStyle ?? true,
          },
        },
      });

      if (error) throw error;

      const analysis = data as ClothingAnalysis;
      setAnalysisResults(analysis);

      toast({
        title: 'Analysis complete',
        description: `Detected ${analysis.category} with ${Math.round(analysis.confidence * 100)}% confidence`,
      });

      return analysis;
    } catch (error) {
      console.error('Computer vision analysis error:', error);
      toast({
        title: 'Analysis failed',
        description: 'Failed to analyze image. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const extractColors = useCallback(async (image: File): Promise<string[] | null> => {
    try {
      const analysis = await analyzeClothingImage(image, {
        includeColors: true,
        includePatterns: false,
        includeFabric: false,
        includeFit: false,
        includeStyle: false,
      });

      return analysis?.colors.palette || null;
    } catch (error) {
      console.error('Color extraction error:', error);
      return null;
    }
  }, [analyzeClothingImage]);

  const categorizeClothing = useCallback(async (image: File): Promise<string | null> => {
    try {
      const analysis = await analyzeClothingImage(image, {
        includeColors: false,
        includePatterns: false,
        includeFabric: false,
        includeFit: false,
        includeStyle: false,
      });

      return analysis?.category || null;
    } catch (error) {
      console.error('Categorization error:', error);
      return null;
    }
  }, [analyzeClothingImage]);

  const assessFit = useCallback(async (image: File): Promise<any | null> => {
    try {
      const analysis = await analyzeClothingImage(image, {
        includeColors: false,
        includePatterns: false,
        includeFabric: false,
        includeFit: true,
        includeStyle: false,
      });

      return analysis?.fit_assessment || null;
    } catch (error) {
      console.error('Fit assessment error:', error);
      return null;
    }
  }, [analyzeClothingImage]);

  const analyzeFabric = useCallback(async (image: File): Promise<any | null> => {
    try {
      const analysis = await analyzeClothingImage(image, {
        includeColors: false,
        includePatterns: false,
        includeFabric: true,
        includeFit: false,
        includeStyle: false,
      });

      return analysis?.fabric || null;
    } catch (error) {
      console.error('Fabric analysis error:', error);
      return null;
    }
  }, [analyzeClothingImage]);

  return {
    isProcessing,
    analysisResults,
    analyzeClothingImage,
    extractColors,
    categorizeClothing,
    assessFit,
    analyzeFabric,
  };
};