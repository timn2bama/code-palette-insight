import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import SEO from "@/components/SEO";
import { Sparkles, Users, Target, Heart } from "lucide-react";
import { generateOrganizationJsonLd } from "@/utils/seo";

const About = () => {
  return (
    <>
      <SEO 
        title="About SyncStyle - Smart Wardrobe Management Team"
        description="Learn about SyncStyle's mission to revolutionize wardrobe management with smart technology, weather integration, and intuitive design for effortless style."
        keywords="about syncstyle, wardrobe management team, fashion technology, smart closet organization, style assistant mission"
        url="/about"
        jsonLd={generateOrganizationJsonLd()}
      />
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-6">About SyncStyle</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Revolutionizing wardrobe management with smart technology and intuitive design
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-primary mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mb-6">
              SyncStyle was born from a simple frustration: standing in front of a full closet with "nothing to wear." 
              We realized that the problem wasn't a lack of clothes, but a lack of organization and inspiration.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Our team of fashion enthusiasts and tech innovators came together to create a solution that would help 
              people rediscover their style, make the most of their existing wardrobe, and feel confident in their choices every day.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-primary mb-8">Our Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Sparkles className="h-8 w-8 text-fashion-gold" />
                    <h3 className="text-xl font-semibold text-primary">Simplify Style</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Make wardrobe management effortless with smart organization tools and AI-powered recommendations.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Users className="h-8 w-8 text-fashion-gold" />
                    <h3 className="text-xl font-semibold text-primary">Empower Everyone</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Help people of all fashion backgrounds feel confident and stylish with personalized guidance.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Target className="h-8 w-8 text-fashion-gold" />
                    <h3 className="text-xl font-semibold text-primary">Maximize Value</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Help users get the most out of their existing wardrobe and make smarter purchasing decisions.
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Heart className="h-8 w-8 text-fashion-gold" />
                    <h3 className="text-xl font-semibold text-primary">Build Confidence</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Transform getting dressed from a daily stress into a moment of joy and self-expression.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-primary mb-6">What Makes Us Different</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-fashion-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Weather-Smart Recommendations</h3>
                  <p className="text-muted-foreground">
                    Our AI doesn't just suggest outfits – it considers your local weather, ensuring you're always dressed appropriately and comfortably.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-fashion-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Real Usage Analytics</h3>
                  <p className="text-muted-foreground">
                    Track which pieces you actually wear and love, helping you identify your style preferences and shopping patterns.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-fashion-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Local Service Integration</h3>
                  <p className="text-muted-foreground">
                    Connect with local tailors, dry cleaners, and styling services to keep your wardrobe in perfect condition.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-fashion-gold rounded-full mt-3 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-semibold text-primary mb-2">Privacy-First Approach</h3>
                  <p className="text-muted-foreground">
                    Your personal style data stays private and secure. We believe fashion is personal, and your data should be too.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="text-center bg-secondary/20 rounded-lg p-8">
            <h2 className="text-3xl font-semibold text-primary mb-4">Join the SyncStyle Community</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Ready to transform your relationship with your wardrobe? Join thousands of users who have already 
              discovered the joy of organized, intentional dressing.
            </p>
            <p className="text-muted-foreground">
              Questions? We'd love to hear from you at{" "}
              <a href="mailto:syncstyleonline@gmail.com" className="text-primary hover:underline font-medium">
                syncstyleonline@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
      </div>
    </>
  );
};

export default About;