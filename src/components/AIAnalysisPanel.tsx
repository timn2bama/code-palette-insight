import React, { useState } from 'react';
import { useEnhancedClaude } from '@/hooks/useEnhancedClaude';
import { useComputerVision } from '@/hooks/useComputerVision';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Upload, Brain, Eye, Palette, Shirt, Zap } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AIAnalysisPanelProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { 
    capabilities, 
    isAnalyzing, 
    analyzeClothingItem, 
    getPersonalizedAdvice 
  } = useEnhancedClaude();

  const { 
    isProcessing, 
    analysisResults, 
    analyzeClothingImage 
  } = useComputerVision();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClaudeAnalysis = async () => {
    if (!selectedImage) return;
    
    const result = await analyzeClothingItem(selectedImage);
    if (result && onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  };

  const handleVisionAnalysis = async () => {
    if (!selectedImage) return;
    
    const result = await analyzeClothingImage(selectedImage);
    if (result && onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  };

  const handlePersonalizedAdvice = async () => {
    if (!prompt) return;
    
    const result = await getPersonalizedAdvice(prompt);
    if (result && onAnalysisComplete) {
      onAnalysisComplete(result);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI/ML Analysis Suite
        </CardTitle>
        <CardDescription>
          Advanced Claude integration and computer vision for intelligent wardrobe analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Image Analysis</TabsTrigger>
            <TabsTrigger value="advice">Personalized Advice</TabsTrigger>
            <TabsTrigger value="capabilities">AI Capabilities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="mb-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm font-medium">Upload clothing image</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {previewUrl && (
                  <div className="mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-xs mx-auto rounded-lg"
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleClaudeAnalysis}
                    disabled={!selectedImage || isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Claude Analysis
                    {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />}
                  </Button>
                  
                  <Button 
                    onClick={handleVisionAnalysis}
                    disabled={!selectedImage || isProcessing}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Computer Vision
                    {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />}
                  </Button>
                </div>
              </div>
            </div>
            
            {analysisResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shirt className="h-4 w-4" />
                        Category
                      </h4>
                      <Badge variant="secondary">{analysisResults.category}</Badge>
                      <Progress value={analysisResults.confidence * 100} className="mt-2" />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Colors
                      </h4>
                      <div className="flex gap-1 flex-wrap">
                        {analysisResults.colors?.palette.map((color, index) => (
                          <div
                            key={index}
                            className="w-6 h-6 rounded-full border border-border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {analysisResults.patterns && (
                    <div>
                      <h4 className="font-semibold mb-2">Patterns</h4>
                      <div className="flex gap-2 flex-wrap">
                        {analysisResults.patterns.map((pattern, index) => (
                          <Badge key={index} variant="outline">
                            {pattern.type} ({Math.round(pattern.confidence * 100)}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysisResults.fabric && (
                    <div>
                      <h4 className="font-semibold mb-2">Fabric Analysis</h4>
                      <p className="text-sm text-muted-foreground">
                        <strong>Texture:</strong> {analysisResults.fabric.texture} <br />
                        <strong>Material:</strong> {analysisResults.fabric.material_guess}
                      </p>
                    </div>
                  )}
                  
                  {analysisResults.style_tags && (
                    <div>
                      <h4 className="font-semibold mb-2">Style Tags</h4>
                      <div className="flex gap-2 flex-wrap">
                        {analysisResults.style_tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="advice" className="space-y-4">
            <div className="space-y-4">
              <Textarea
                placeholder="Ask for personalized fashion advice, outfit suggestions, or style guidance..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
              
              <Button 
                onClick={handlePersonalizedAdvice}
                disabled={!prompt || isAnalyzing}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Get AI Advice
                {isAnalyzing && <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent ml-2" />}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="capabilities" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Enhanced Claude</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Visual Analysis</span>
                      <Badge variant={capabilities.visualAnalysis ? "default" : "secondary"}>
                        {capabilities.visualAnalysis ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Contextual Memory</span>
                      <Badge variant={capabilities.contextualMemory ? "default" : "secondary"}>
                        {capabilities.contextualMemory ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Personalized Responses</span>
                      <Badge variant={capabilities.personalizedResponses ? "default" : "secondary"}>
                        {capabilities.personalizedResponses ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Multi-language Support</span>
                      <Badge variant={capabilities.multiLanguageSupport ? "default" : "secondary"}>
                        {capabilities.multiLanguageSupport ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Computer Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4" />
                      <span>Automatic Categorization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span>Color & Pattern Recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>Fabric Texture Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>Fit Assessment</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAnalysisPanel;