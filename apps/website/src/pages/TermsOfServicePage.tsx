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

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Terms of Service</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-lg">
          <p className="lead text-xl text-gray-600">
            Welcome to Buzzee! These Terms of Service ("Terms") govern your use of the Buzzee mobile application and website (the "Service") operated by Chant Projects Inc. ("Chants", "we", "us", or "our"). By accessing or using the Service, you agree to be bound by these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use the Service.</p>
          <p>You must be at least 18 years old or the age of majority in your jurisdiction to use this Service. By using the Service, you represent and warrant that you meet this requirement.</p>

          <h2>2. Description of Service</h2>
          <p>Buzzee is a mobile platform that connects users with time-limited deals and offers from local bars, restaurants, and entertainment venues ("Venues"). The Service enables:</p>
          <ul>
            <li>Discovery of live, time-sensitive deals from participating Venues</li>
            <li>Saving and tracking deals of interest</li>
            <li>Redeeming deals at Venues through QR code verification</li>
            <li>Receiving notifications about new deals and offers</li>
          </ul>

          <h2>3. User Accounts</h2>

          <h3>Account Registration</h3>
          <p>To access certain features of the Service, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h3>Account Termination</h3>
          <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our sole discretion.</p>

          <h2>4. Deal Redemption Terms</h2>

          <h3>General Terms</h3>
          <ul>
            <li>Deals are subject to availability and may be limited in quantity</li>
            <li>Each deal has specific terms, conditions, and expiration times set by the Venue</li>
            <li>Deals are non-transferable unless explicitly stated otherwise</li>
            <li>One redemption per deal per user unless otherwise specified</li>
            <li>Deals cannot be combined with other offers unless explicitly permitted</li>
          </ul>

          <h3>Redemption Process</h3>
          <p>To redeem a deal, you must:</p>
          <ul>
            <li>Present your unique QR code at the participating Venue</li>
            <li>Redeem the deal during the specified active time period</li>
            <li>Meet any minimum purchase requirements specified in the deal</li>
            <li>Be physically present at the Venue location</li>
          </ul>

          <h3>Venue Responsibilities</h3>
          <p>While we work with Venues to ensure deal accuracy, Chants is not responsible for:</p>
          <ul>
            <li>Venue operational decisions or closures</li>
            <li>Quality of products or services provided by Venues</li>
            <li>Disputes between users and Venues</li>
            <li>Changes to deals made by Venues</li>
          </ul>

          <h2>5. User Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Create multiple accounts for fraudulent purposes</li>
            <li>Share, sell, or transfer deals in violation of deal terms</li>
            <li>Use automated systems or bots to access the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Impersonate any person or entity</li>
            <li>Harass, abuse, or harm other users or Venue staff</li>
            <li>Submit false or misleading information</li>
            <li>Engage in any form of fraud or abuse of the deal system</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>The Service and its original content, features, and functionality are owned by Chant Projects Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          <p>You may not:</p>
          <ul>
            <li>Copy, modify, or distribute any part of the Service</li>
            <li>Use our trademarks or branding without permission</li>
            <li>Reverse engineer or attempt to extract source code</li>
            <li>Remove any copyright or proprietary notices</li>
          </ul>

          <h2>7. Disclaimers</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING:</p>
          <ul>
            <li>MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE</li>
            <li>NON-INFRINGEMENT</li>
            <li>ACCURACY OR RELIABILITY OF CONTENT</li>
            <li>UNINTERRUPTED OR ERROR-FREE OPERATION</li>
          </ul>
          <p>We do not guarantee that deals will always be available, accurate, or honored by Venues.</p>

          <h2>8. Limitation of Liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHANT PROJECTS INC. SHALL NOT BE LIABLE FOR:</p>
          <ul>
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Damages arising from your use or inability to use the Service</li>
            <li>Actions or omissions of Venues or third parties</li>
          </ul>
          <p>Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim, or $100 CAD, whichever is greater.</p>

          <h2>9. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Chant Projects Inc., its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
            <li>Your conduct in connection with the Service</li>
          </ul>

          <h2>10. Governing Law and Disputes</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the Province of British Columbia, Canada, without regard to its conflict of law provisions.</p>
          <p>Any disputes arising from these Terms or the Service shall be resolved through:</p>
          <ul>
            <li>Good faith negotiations between the parties</li>
            <li>If unresolved, binding arbitration in Vancouver, British Columbia</li>
            <li>The courts of British Columbia shall have exclusive jurisdiction for any matters not subject to arbitration</li>
          </ul>

          <h2>11. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms at any time. We will notify you of material changes by:</p>
          <ul>
            <li>Posting the updated Terms on the Service</li>
            <li>Updating the "Last updated" date</li>
            <li>Sending you a notification through the app or email</li>
          </ul>
          <p>Your continued use of the Service after changes constitutes acceptance of the modified Terms.</p>

          <h2>12. General Provisions</h2>
          <ul>
            <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions will continue in effect.</li>
            <li><strong>Waiver:</strong> Failure to enforce any right does not waive that right.</li>
            <li><strong>Assignment:</strong> You may not assign these Terms without our consent. We may assign our rights freely.</li>
            <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Chants regarding the Service.</li>
          </ul>

          <h2>13. Contact Us</h2>
          <p>If you have questions about these Terms of Service, please contact us:</p>
          <div className="bg-gray-50 p-6 rounded-xl not-prose">
            <p className="font-semibold text-gray-900 mb-2">Chant Projects Inc.</p>
            <p className="text-gray-600">Vancouver, British Columbia, Canada</p>
            <p className="text-gray-600">Website: <a href="https://www.chants.ca" className="text-primary-600 hover:underline">www.chants.ca</a></p>
            <p className="text-gray-600">Email: <a href="mailto:legal@chants.ca" className="text-primary-600 hover:underline">legal@chants.ca</a></p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
