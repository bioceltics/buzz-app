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

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Privacy Policy</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-gray prose-lg">
          <p className="lead text-xl text-gray-600">
            Chant Projects Inc. ("Chants", "we", "us", or "our") operates the Buzzee mobile application and website (collectively, the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Personal Information</h3>
          <p>When you create an account or use our Service, we may collect:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
            <li><strong>Profile Information:</strong> Profile photo, preferences, and saved venues</li>
            <li><strong>Payment Information:</strong> If you make purchases, we collect billing information (processed securely by our payment providers)</li>
          </ul>

          <h3>Usage Data</h3>
          <p>We automatically collect certain information when you use the Service:</p>
          <ul>
            <li>Device information (device type, operating system, unique device identifiers)</li>
            <li>Log data (access times, pages viewed, app features used)</li>
            <li>Deal interactions (deals viewed, saved, and redeemed)</li>
          </ul>

          <h3>Location Data</h3>
          <p>With your consent, we collect precise location data to:</p>
          <ul>
            <li>Show you nearby deals and venues</li>
            <li>Verify deal redemptions at venue locations</li>
            <li>Provide location-based notifications</li>
          </ul>
          <p>You can disable location services through your device settings at any time.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Providing and maintaining the Service</li>
            <li>Personalizing your experience and showing relevant deals</li>
            <li>Processing transactions and sending related information</li>
            <li>Sending promotional communications (with your consent)</li>
            <li>Analyzing usage patterns to improve our Service</li>
            <li>Detecting, preventing, and addressing technical issues or fraud</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2>3. Information Sharing and Disclosure</h2>
          <p>We may share your information in the following situations:</p>

          <h3>With Venue Partners</h3>
          <p>When you redeem a deal, we share necessary information with the venue to validate your redemption. This includes your name and redemption details.</p>

          <h3>With Service Providers</h3>
          <p>We work with third-party companies to help us operate and improve our Service, including:</p>
          <ul>
            <li>Cloud hosting and storage providers</li>
            <li>Analytics and monitoring services</li>
            <li>Payment processors</li>
            <li>Customer support tools</li>
          </ul>

          <h3>For Legal Reasons</h3>
          <p>We may disclose information if required by law, legal process, or government request, or to protect the rights, property, or safety of Chants, our users, or others.</p>

          <h3>Business Transfers</h3>
          <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</p>

          <h2>4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls and authentication measures</li>
            <li>Employee training on data protection</li>
          </ul>
          <p>However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</p>

          <h2>5. Your Rights and Choices</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
          </ul>
          <p>To exercise these rights, contact us at privacy@chants.ca</p>

          <h2>6. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain information as required by law or for legitimate business purposes.</p>

          <h2>7. Children's Privacy</h2>
          <p>Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.</p>

          <h2>8. International Data Transfers</h2>
          <p>Your information may be transferred to and processed in countries other than Canada. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.</p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically.</p>

          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
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
