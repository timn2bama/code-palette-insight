import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/hero-wardrobe.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
                Your Smart
                <span className="text-transparent bg-clip-text bg-gradient-accent"> Wardrobe</span>
                <br />Assistant
              </h1>
               <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Track your style, create perfect outfits, and never miss a sale on your favorite pieces. 
                <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-accent"> SyncStyle</span> makes wardrobe management effortless and elegant.
               </p>
               <div className="flex flex-col sm:flex-row gap-4">
                 {user ? (
                   <>
                     <Button 
                       variant="premium" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/wardrobe')}
                     >
                       ✨ Start Organizing
                     </Button>
                     <Button 
                       variant="elegant" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/wardrobe')}
                     >
                       👔 View Wardrobe
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button 
                       variant="premium" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/auth')}
                     >
                       ✨ Get Started
                     </Button>
                     <Button 
                       variant="elegant" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/auth')}
                     >
                       🔐 Sign In
                     </Button>
                   </>
                 )}
               </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-accent rounded-3xl blur-2xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="Elegant wardrobe collection"
                className="relative z-10 rounded-3xl shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card 
            className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/wardrobe')}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">👔</div>
              <h3 className="font-semibold text-primary mb-2">Smart Wardrobe</h3>
              <p className="text-sm text-muted-foreground">Track your clothing collection with analytics and smart insights</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-semibold text-primary mb-2">Outfit Creator</h3>
              <p className="text-sm text-muted-foreground">Mix and match with our intuitive style builder</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-4">🌤️</div>
              <h3 className="font-semibold text-primary mb-2">Weather Sync</h3>
              <p className="text-sm text-muted-foreground">Get outfit suggestions based on local weather</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
