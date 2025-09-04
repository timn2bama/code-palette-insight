import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAccessibility } from "@/hooks/useAccessibility";
import { 
  Eye, 
  Mic, 
  Type, 
  Keyboard, 
  Volume2,
  Settings
} from "lucide-react";

const AccessibilityPanel = () => {
  const {
    settings,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleScreenReaderOptimization,
    startVoiceControl,
    isListening,
  } = useAccessibility();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your experience with accessibility features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="high-contrast" className="text-sm font-medium">
                High Contrast Mode
              </label>
              <p className="text-xs text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={toggleHighContrast}
              aria-label="Toggle high contrast mode"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="reduced-motion" className="text-sm font-medium">
                Reduced Motion
              </label>
              <p className="text-xs text-muted-foreground">
                Minimizes animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={toggleReducedMotion}
              aria-label="Toggle reduced motion"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="font-size" className="text-sm font-medium flex items-center gap-2">
                <Type className="h-4 w-4" />
                Font Size
              </label>
              <p className="text-xs text-muted-foreground">
                Adjust text size for better readability
              </p>
            </div>
            <Select value={settings.fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-32" id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Navigation Accessibility */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Navigation
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label htmlFor="screen-reader" className="text-sm font-medium">
                Screen Reader Optimization
              </label>
              <p className="text-xs text-muted-foreground">
                Enhanced compatibility with screen readers
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReaderOptimized}
              onCheckedChange={toggleScreenReaderOptimization}
              aria-label="Toggle screen reader optimization"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keyboard Shortcuts</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Home:</span>
                <Badge variant="outline">Alt + 1</Badge>
              </div>
              <div className="flex justify-between">
                <span>Wardrobe:</span>
                <Badge variant="outline">Alt + 2</Badge>
              </div>
              <div className="flex justify-between">
                <span>Outfits:</span>
                <Badge variant="outline">Alt + 3</Badge>
              </div>
              <div className="flex justify-between">
                <span>Analytics:</span>
                <Badge variant="outline">Alt + 4</Badge>
              </div>
              <div className="flex justify-between">
                <span>High Contrast:</span>
                <Badge variant="outline">Alt + H</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Control */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Voice Control
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Voice Navigation</label>
              <p className="text-xs text-muted-foreground">
                Control the app with voice commands
              </p>
            </div>
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={startVoiceControl}
              disabled={!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)}
              aria-label={isListening ? "Stop voice control" : "Start voice control"}
            >
              <Mic className="h-4 w-4 mr-2" />
              {isListening ? "Listening..." : "Start Voice Control"}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Commands</label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>"Go to wardrobe" - Navigate to wardrobe</p>
              <p>"Go to outfits" - Navigate to outfits</p>
              <p>"Go home" - Navigate to home page</p>
              <p>"High contrast on/off" - Toggle contrast</p>
              <p>"Larger text" - Increase font size</p>
              <p>"Smaller text" - Decrease font size</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityPanel;