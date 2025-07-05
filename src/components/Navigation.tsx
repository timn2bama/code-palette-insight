import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "Wardrobe", path: "/wardrobe", icon: "👔" },
    { name: "Outfits", path: "/outfits", icon: "✨" },
    { name: "Weather", path: "/weather", icon: "🌤️" },
    { name: "Services", path: "/services", icon: "🔧" },
  ];

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-background/80 backdrop-blur-md border-border/50 shadow-elegant">
      <div className="flex items-center gap-6 px-6 py-3">
        <Link to="/" className="text-lg font-bold text-primary hover:text-accent transition-colors">
          SyncStyle
        </Link>
        
        <nav className="hidden md:flex items-center gap-4">
          {navigationItems.map((item) => (
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
            {navigationItems.map((item) => (
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
          </nav>
        </div>
      )}
    </Card>
  );
};

export default Navigation;