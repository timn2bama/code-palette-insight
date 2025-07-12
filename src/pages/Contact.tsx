import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Mail, MessageSquare, HelpCircle, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-6">Contact Us</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We'd love to hear from you! Get in touch with our team for support, feedback, or just to say hello.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your question or feedback..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Mail className="h-8 w-8 text-fashion-gold" />
                    <div>
                      <h3 className="text-xl font-semibold text-primary">Email Support</h3>
                      <p className="text-muted-foreground">Get help with your account</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    For technical support, account issues, or general inquiries, reach out to our support team.
                  </p>
                  <a 
                    href="mailto:syncstyleonline@gmail.com"
                    className="text-primary hover:underline font-medium"
                  >
                    syncstyleonline@gmail.com
                  </a>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <HelpCircle className="h-8 w-8 text-fashion-gold" />
                    <div>
                      <h3 className="text-xl font-semibold text-primary">Quick Help</h3>
                      <p className="text-muted-foreground">Common questions answered</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Before reaching out, check our FAQ section for quick answers to common questions.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = "/help"}>
                    View FAQ
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">Response Time</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• General inquiries: Within 24 hours</p>
                    <p>• Technical support: Within 12 hours</p>
                    <p>• Premium users: Within 6 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card bg-secondary/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary mb-4">We Value Your Feedback</h3>
                  <p className="text-muted-foreground">
                    Your suggestions help us improve SyncStyle. Whether it's a feature request, 
                    bug report, or general feedback, we want to hear from you!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;