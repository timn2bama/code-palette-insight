import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateFAQJsonLd } from "@/utils/seo";

/**
 * FAQ Page Component
 * Provides answers to frequently asked questions about SyncStyle
 * Includes FAQPage structured data for enhanced search visibility
 */
const FAQ = () => {
  const faqData = [
    {
      question: "What is SyncStyle?",
      answer: "SyncStyle is an AI-powered digital wardrobe manager that helps you organize your clothing, plan outfits, and get personalized style recommendations based on weather, occasions, and your preferences."
    },
    {
      question: "Is SyncStyle free to use?",
      answer: "Yes! SyncStyle offers a free tier with core features including wardrobe management, outfit creation, and basic AI recommendations. Premium features are available through our subscription plans."
    },
    {
      question: "Does SyncStyle work offline?",
      answer: "Yes. SyncStyle includes offline support for core features like browsing your wardrobe and viewing saved outfits. Changes sync automatically when you're back online."
    },
    {
      question: "How does the AI outfit recommendation work?",
      answer: "Our AI analyzes your wardrobe items, weather conditions, personal style preferences, and occasion to suggest coordinated outfits. It learns from your choices to provide increasingly personalized recommendations."
    },
    {
      question: "Can I use SyncStyle on my mobile device?",
      answer: "Absolutely! SyncStyle is mobile-first and works great on phones and tablets. You can also install it as a Progressive Web App (PWA) for a native app-like experience."
    },
    {
      question: "How do I add items to my wardrobe?",
      answer: "Simply take a photo of your clothing item or upload an image. Our AI can automatically detect the type, color, and other attributes. You can also manually enter details like brand, purchase date, and price."
    },
    {
      question: "Is my wardrobe data private?",
      answer: "Yes. Your wardrobe and personal data are completely private. Only you can see your items unless you explicitly choose to share outfits publicly on the social features."
    },
    {
      question: "What are the sustainability features?",
      answer: "SyncStyle helps you track the environmental impact of your wardrobe, including carbon footprint calculations, cost-per-wear analytics, and suggestions to maximize use of existing items before buying new ones."
    },
    {
      question: "Can I share outfits with friends?",
      answer: "Yes! You can share individual outfits or looks through our social features. Friends can view, like, and get inspired by your style choices."
    },
    {
      question: "Does SyncStyle integrate with other services?",
      answer: "Yes. SyncStyle integrates with weather services for outfit recommendations, and we're continuously adding integrations with shopping platforms, dry cleaners, and tailoring services."
    }
  ];

  const jsonLd = generateFAQJsonLd(faqData);

  return (
    <>
      <Helmet>
        <title>Frequently Asked Questions | SyncStyle</title>
        <meta name="description" content="Find answers to common questions about SyncStyle - AI-powered wardrobe management, outfit planning, and smart fashion recommendations." />
        <link rel="canonical" href="https://syncstyle.lovable.app/faq" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about SyncStyle
              </p>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Common Questions</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Contact us at syncstyleonline@gmail.com
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Card>
                <CardHeader>
                  <CardTitle>Still have questions?</CardTitle>
                  <CardDescription>
                    We're here to help! Reach out to our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:syncstyleonline@gmail.com" className="text-primary hover:underline">
                        syncstyleonline@gmail.com
                      </a>
                    </p>
                    <p>
                      <strong>Help Center:</strong>{" "}
                      <a href="/help" className="text-primary hover:underline">
                        Visit our Help page
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default FAQ;
