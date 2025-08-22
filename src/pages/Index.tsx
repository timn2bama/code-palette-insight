import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/utils/seo";
import heroImage from "@/assets/hero-wardrobe.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <SEO 
        title="SyncStyle - Smart Wardrobe & Outfit Management"
        description="Organize your wardrobe, create perfect outfits, and get weather-based style recommendations with SyncStyle. Your personal styling assistant."
        keywords="wardrobe management, outfit planning, style assistant, weather-based outfits, fashion organizer, digital closet, smart wardrobe"
        url="/"
        jsonLd={[generateOrganizationJsonLd(), generateWebsiteJsonLd()]}
      />
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16">
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
                       aria-label="Start organizing your wardrobe with SyncStyle"
                     >
                       ✨ Start Organizing
                     </Button>
                     <Button 
                       variant="elegant" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/wardrobe')}
                       aria-label="View your digital wardrobe"
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
                       aria-label="Get started with SyncStyle wardrobe management"
                     >
                       ✨ Get Started
                     </Button>
                     <Button 
                       variant="elegant" 
                       size="lg" 
                       className="text-lg px-8 py-6"
                       onClick={() => navigate('/auth')}
                       aria-label="Sign in to your SyncStyle account"
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
                alt="Elegant organized wardrobe with smart clothing management system showing various outfits and style options"
                className="relative z-10 rounded-3xl shadow-elegant w-full"
                loading="eager"
                width="600"
                height="400"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 pb-16" aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">SyncStyle Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/wardrobe')}
              role="button"
              tabIndex={0}
              aria-label="Access Smart Wardrobe feature"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4" role="img" aria-label="Wardrobe icon">👔</div>
                <h3 className="font-semibold text-primary mb-2">Smart Wardrobe</h3>
                <p className="text-sm text-muted-foreground">Track your clothing collection with analytics and smart insights. Upload photos, categorize items, and monitor wear patterns.</p>
              </CardContent>
            </Card>
          </article>
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/outfits')}
              role="button"
              tabIndex={0}
              aria-label="Access Outfit Creator feature"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4" role="img" aria-label="Sparkles icon">✨</div>
                <h3 className="font-semibold text-primary mb-2">Outfit Creator</h3>
                <p className="text-sm text-muted-foreground">Mix and match with our intuitive style builder. Create and save outfit combinations for any occasion.</p>
              </CardContent>
            </Card>
          </article>
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/weather')}
              role="button"
              tabIndex={0}
              aria-label="Access Weather Sync feature"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4" role="img" aria-label="Weather icon">🌤️</div>
                <h3 className="font-semibold text-primary mb-2">Weather Sync</h3>
                <p className="text-sm text-muted-foreground">Get AI-powered outfit suggestions based on local weather conditions and temperature forecasts.</p>
              </CardContent>
            </Card>
          </article>
          
          <article className="group">
            <Card 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer h-full"
              onClick={() => navigate('/services')}
              role="button"
              tabIndex={0}
              aria-label="Access Local Services feature"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4" role="img" aria-label="Shopping icon">🛍️</div>
                <h3 className="font-semibold text-primary mb-2">Local Services</h3>
                <p className="text-sm text-muted-foreground">Find nearby dry cleaners, tailors, and styling services. Connect with local fashion professionals.</p>
              </CardContent>
            </Card>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-primary mb-4">SyncStyle</h3>
              <p className="text-muted-foreground text-sm">
                Your smart wardrobe assistant for effortless style management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary mb-4">Support</h4>
              <p className="text-muted-foreground text-sm mb-2">
                Need help? Contact us:
              </p>
              <a 
                href="mailto:syncstyleonline@gmail.com" 
                className="text-primary hover:underline text-sm"
              >
                syncstyleonline@gmail.com
              </a>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} SyncStyle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default Index;
