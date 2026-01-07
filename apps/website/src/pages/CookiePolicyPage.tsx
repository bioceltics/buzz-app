import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

// Custom Buzzee Logo Icon
function BuzzeeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="17" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">B</text>
    </svg>
  );
}

// Navigation Component
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <BuzzeeIcon className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Buzzee</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Home</Link>
            <Link to="/blog" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">Blog</Link>
            <a href="https://business.buzzee.ca" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">For Business</a>
          </div>

          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">Home</Link>
              <Link to="/blog" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">Blog</Link>
              <a href="https://business.buzzee.ca" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">For Business</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="py-12 px-4 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center">
                <BuzzeeIcon className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">Buzzee</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Catch live deals at local venues. A product of Chant Projects Inc.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><a href="https://business.buzzee.ca" className="hover:text-white transition-colors">For Business</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="https://www.chants.ca" className="hover:text-white transition-colors">About Chants</a></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Chant Projects Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Cookie Policy</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-lg">
          <p className="lead text-xl text-gray-600">
            This Cookie Policy explains how Chant Projects Inc. ("Chants", "we", "us", or "our") uses cookies and similar technologies when you visit our website or use the Buzzee mobile application (collectively, the "Service"). By using our Service, you consent to the use of cookies as described in this policy.
          </p>

          <h2>1. What Are Cookies?</h2>
          <p>Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners useful information about how their site is being used.</p>
          <p>Similar technologies include:</p>
          <ul>
            <li><strong>Local Storage:</strong> Allows websites to store data locally on your device</li>
            <li><strong>Session Storage:</strong> Similar to local storage but cleared when the browser session ends</li>
            <li><strong>Pixels/Web Beacons:</strong> Small images embedded in web pages or emails to track user behavior</li>
            <li><strong>Device Identifiers:</strong> Unique identifiers associated with your mobile device</li>
          </ul>

          <h2>2. Types of Cookies We Use</h2>

          <h3>Essential Cookies</h3>
          <p>These cookies are necessary for the Service to function properly. They enable core functionality such as:</p>
          <ul>
            <li>User authentication and account access</li>
            <li>Security features and fraud prevention</li>
            <li>Load balancing and server optimization</li>
            <li>Remembering your preferences and settings</li>
          </ul>
          <p>Without these cookies, certain features of the Service may not be available.</p>

          <h3>Analytics Cookies</h3>
          <p>These cookies help us understand how visitors interact with our Service by collecting and reporting information anonymously. We use this data to:</p>
          <ul>
            <li>Measure and analyze traffic and usage patterns</li>
            <li>Understand which pages and features are most popular</li>
            <li>Identify errors and improve Service performance</li>
            <li>Test new features and design changes</li>
          </ul>

          <h3>Functional Cookies</h3>
          <p>These cookies enable enhanced functionality and personalization, such as:</p>
          <ul>
            <li>Remembering your language and region preferences</li>
            <li>Storing your saved deals and favorite venues</li>
            <li>Customizing content based on your interests</li>
            <li>Enabling social media sharing features</li>
          </ul>

          <h3>Marketing Cookies</h3>
          <p>These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing campaigns. They may be used to:</p>
          <ul>
            <li>Show you personalized ads based on your interests</li>
            <li>Limit the number of times you see an advertisement</li>
            <li>Measure the effectiveness of advertising campaigns</li>
            <li>Remember that you have visited our Service when browsing other websites</li>
          </ul>

          <h2>3. Third-Party Cookies</h2>
          <p>We may allow third-party service providers to place cookies on your device to help us with various functions. These providers include:</p>

          <h3>Analytics Providers</h3>
          <ul>
            <li><strong>Google Analytics:</strong> Helps us understand how users interact with our Service</li>
            <li><strong>Mixpanel:</strong> Provides detailed analytics on user behavior and engagement</li>
          </ul>

          <h3>Advertising Partners</h3>
          <ul>
            <li><strong>Google Ads:</strong> For targeted advertising and conversion tracking</li>
            <li><strong>Meta (Facebook):</strong> For social media advertising and audience insights</li>
          </ul>

          <h3>Other Service Providers</h3>
          <ul>
            <li><strong>Stripe:</strong> For secure payment processing</li>
            <li><strong>Intercom:</strong> For customer support and communication</li>
          </ul>

          <p>These third parties have their own privacy policies and may collect information about your online activities over time and across different websites.</p>

          <h2>4. Cookie Duration</h2>
          <p>Cookies can remain on your device for different periods of time:</p>
          <ul>
            <li><strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser. They are used to maintain your session while you navigate the Service.</li>
            <li><strong>Persistent Cookies:</strong> These cookies remain on your device for a set period of time (ranging from days to years) or until you delete them. They are used to remember your preferences and recognize you when you return.</li>
          </ul>

          <h2>5. Managing Your Cookie Preferences</h2>
          <p>You have several options for managing cookies:</p>

          <h3>Browser Settings</h3>
          <p>Most web browsers allow you to control cookies through their settings. You can:</p>
          <ul>
            <li>View cookies stored on your device</li>
            <li>Delete all or specific cookies</li>
            <li>Block all cookies or only third-party cookies</li>
            <li>Set preferences for specific websites</li>
          </ul>
          <p>Please note that blocking or deleting cookies may affect the functionality of the Service.</p>

          <h3>Browser-Specific Instructions</h3>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
          </ul>

          <h3>Mobile Devices</h3>
          <p>For the Buzzee mobile app:</p>
          <ul>
            <li><strong>iOS:</strong> Settings → Privacy → Tracking to control app tracking</li>
            <li><strong>Android:</strong> Settings → Privacy → Ads to manage ad personalization</li>
          </ul>

          <h3>Opt-Out Tools</h3>
          <p>You can also opt out of certain types of cookies using these tools:</p>
          <ul>
            <li><strong>Google Analytics Opt-out:</strong> Install the Google Analytics Opt-out Browser Add-on</li>
            <li><strong>Digital Advertising Alliance:</strong> Visit optout.aboutads.info</li>
            <li><strong>Network Advertising Initiative:</strong> Visit optout.networkadvertising.org</li>
          </ul>

          <h2>6. Do Not Track Signals</h2>
          <p>Some browsers have a "Do Not Track" (DNT) feature that sends a signal to websites you visit indicating you do not wish to be tracked. Our Service currently does not respond to DNT signals, but we honor your cookie preferences as described in this policy.</p>

          <h2>7. Updates to This Cookie Policy</h2>
          <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by:</p>
          <ul>
            <li>Posting the updated policy on this page</li>
            <li>Updating the "Last updated" date at the top</li>
            <li>Sending you a notification through the app or email for significant changes</li>
          </ul>
          <p>We encourage you to review this policy periodically to stay informed about our use of cookies.</p>

          <h2>8. Contact Us</h2>
          <p>If you have any questions about this Cookie Policy or our use of cookies, please contact us:</p>
          <div className="bg-gray-50 p-6 rounded-xl not-prose">
            <p className="font-semibold text-gray-900 mb-2">Chant Projects Inc.</p>
            <p className="text-gray-600">Vancouver, British Columbia, Canada</p>
            <p className="text-gray-600">Website: <a href="https://www.chants.ca" className="text-primary-600 hover:underline">www.chants.ca</a></p>
            <p className="text-gray-600">Email: <a href="mailto:privacy@chants.ca" className="text-primary-600 hover:underline">privacy@chants.ca</a></p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
