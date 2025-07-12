import Navigation from "@/components/Navigation";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using SyncStyle, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Use License</h2>
              <p className="text-muted-foreground leading-relaxed">
                Permission is granted to temporarily download one copy of SyncStyle for personal, non-commercial transitory viewing only. 
                This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained in SyncStyle</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept 
                responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">User Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you upload to SyncStyle, including photos and wardrobe information. 
                By uploading content, you grant SyncStyle a license to use, display, and process this content solely for 
                the purpose of providing our services to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may not use SyncStyle for any unlawful purpose or to solicit others to perform unlawful acts. 
                You may not violate any international, federal, provincial, or state regulations, rules, or laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Premium features require a subscription fee. Payments are processed securely through Stripe. 
                Subscription fees are charged monthly or annually as selected. You may cancel your subscription at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall SyncStyle or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use SyncStyle, even if SyncStyle or a SyncStyle authorized representative has been notified orally or 
                in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                SyncStyle may revise these terms of service at any time without notice. By using this service, 
                you are agreeing to be bound by the then current version of these terms of service.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions about the Terms of Service should be sent to us at{" "}
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

export default TermsOfService;