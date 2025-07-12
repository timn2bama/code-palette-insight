import Navigation from "@/components/Navigation";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you use SyncStyle, we collect information you provide directly to us, such as when you create an account, 
                upload wardrobe items, or contact us for support. This includes your email address, wardrobe photos, 
                clothing item details, and usage patterns.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide and improve our wardrobe management services</li>
                <li>Generate personalized outfit recommendations</li>
                <li>Send weather-based styling suggestions</li>
                <li>Process payments for premium features</li>
                <li>Communicate with you about your account and our services</li>
                <li>Ensure the security and integrity of our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information 
                only in the following circumstances: with your consent, to comply with legal obligations, 
                to protect our rights and safety, or with service providers who assist us in operating our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption and security practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, update, or delete your personal information. You can manage your account settings 
                directly through the app or contact us at{" "}
                <a href="mailto:syncstyleonline@gmail.com" className="text-primary hover:underline">
                  syncstyleonline@gmail.com
                </a>{" "}
                for assistance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date below.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{" "}
                <a href="mailto:syncstyleonline@gmail.com" className="text-primary hover:underline">
                  syncstyleonline@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;