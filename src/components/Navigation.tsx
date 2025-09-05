import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityStatus } from "@/components/SecurityStatus";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Pages that should show back to home button
  const featurePages = ["/wardrobe", "/outfits", "/weather", "/services", "/subscription", "/blog/admin"];
  const showBackButton = featurePages.includes(location.pathname);

  const navigationItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Wardrobe", path: "/wardrobe", icon: "👔" },
    { name: "Outfits", path: "/outfits", icon: "✨" },
    { name: "Explore", path: "/explore", icon: "🔍" },
    { name: "Analytics", path: "/analytics", icon: "📊" },
    { name: "Integrations", path: "/integrations", icon: "🔗" },
    { name: "Weather", path: "/weather", icon: "🌤️" },
    { name: "Services", path: "/services", icon: "🔧" },
    { name: "Subscription", path: "/subscription", icon: "💎" },
    { name: "Mobile & Accessibility", path: "/mobile", icon: "📱" },
    { name: "AI Analysis", path: "/ai-analysis", icon: "🧠" },
  ];

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md border-border/50 shadow-elegant">
      <div className="flex items-center gap-6 px-6 py-3">
        <div className="text-lg font-bold text-primary">
          SyncStyle
        </div>
        
        <SecurityStatus />
        
        <nav className="hidden md:flex items-center gap-4">
          {user && navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300",
                location.pathname === item.path
                  ? "bg-accent text-accent-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>

        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </Button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95">
          <nav className="flex flex-col gap-1 p-4">
            {user && navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300",
                  location.pathname === item.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
                onClick={() => setIsOpen(false)}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                className="mt-2"
              >
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </Card>
  );
};

export default Navigation;