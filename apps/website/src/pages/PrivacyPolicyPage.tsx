import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, Shield, Mail, MapPin, Globe, Calendar } from 'lucide-react';

function BuzzeeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="17" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">B</text>
    </svg>
  );
}

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100">
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
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover live deals at local restaurants, cafes, and bars. A product of Chant Projects Inc.
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

function Section({ number, title, id, children }: { number: number; title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-start gap-4 mb-6">
        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-pink-100 text-primary-600 flex items-center justify-center font-bold text-lg shadow-sm">
          {number}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 pt-1">{title}</h2>
      </div>
      <div className="pl-14 space-y-6">
        {children}
      </div>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
        <span className="w-1 h-5 bg-gradient-to-b from-primary-500 to-pink-400 rounded-full"></span>
        {title}
      </h3>
      <div className="pl-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0"></span>
          <span className="text-gray-600 leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 leading-relaxed">{children}</p>;
}

const tocItems = [
  { id: 'information-collect', title: 'Information We Collect' },
  { id: 'how-we-use', title: 'How We Use Your Information' },
  { id: 'information-sharing', title: 'Information Sharing' },
  { id: 'data-security', title: 'Data Security' },
  { id: 'your-rights', title: 'Your Rights & Choices' },
  { id: 'childrens-privacy', title: "Children's Privacy" },
  { id: 'data-retention', title: 'Data Retention' },
  { id: 'international', title: 'International Transfers' },
  { id: 'changes', title: 'Changes to Policy' },
  { id: 'contact', title: 'Contact Us' },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-gray-50 via-white to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </nav>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            At Chant Projects Inc. ("Chants"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Buzzee mobile application and website.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-6 px-4 bg-gray-50 border-y border-gray-100 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-semibold text-gray-900">Quick Navigation</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-16">

          <Section number={1} title="Information We Collect" id="information-collect">
            <Subsection title="Personal Information">
              <P>When you create an account or use Buzzee, we may collect:</P>
              <BulletList items={[
                "Name and email address for account creation and communication",
                "Phone number for account verification and notifications",
                "Profile photo (optional) to personalize your experience",
                "Payment information processed securely through our payment providers"
              ]} />
            </Subsection>

            <Subsection title="Location Data">
              <P>With your permission, we collect precise location data to:</P>
              <BulletList items={[
                "Show you nearby deals and participating venues",
                "Verify your presence at a venue when redeeming deals",
                "Provide location-based recommendations and notifications"
              ]} />
            </Subsection>

            <Subsection title="Usage Information">
              <P>We automatically collect information about how you use Buzzee:</P>
              <BulletList items={[
                "Device information (type, operating system, unique identifiers)",
                "App usage patterns and feature interactions",
                "Deals viewed, saved, and redeemed",
                "Search queries and preferences"
              ]} />
            </Subsection>
          </Section>

          <Section number={2} title="How We Use Your Information" id="how-we-use">
            <P>We use the information we collect to:</P>
            <BulletList items={[
              "Provide, maintain, and improve the Buzzee service",
              "Process transactions and send related notifications",
              "Send promotional communications (with your consent)",
              "Personalize your experience with relevant deals",
              "Analyze usage patterns to enhance our platform",
              "Detect, prevent, and address technical issues or fraud",
              "Comply with legal obligations and protect our rights"
            ]} />
          </Section>

          <Section number={3} title="Information Sharing" id="information-sharing">
            <P>We may share your information in the following circumstances:</P>

            <Subsection title="With Businesses">
              <P>When you redeem a deal, participating businesses receive limited information necessary to honor the deal, such as your name and redemption details.</P>
            </Subsection>

            <Subsection title="Service Providers">
              <P>We work with trusted third-party companies who assist us in operating our platform, including:</P>
              <BulletList items={[
                "Cloud hosting and data storage providers",
                "Payment processing services",
                "Analytics and performance monitoring tools",
                "Customer support platforms"
              ]} />
            </Subsection>

            <Subsection title="Legal Requirements">
              <P>We may disclose information when required by law, legal process, or to protect the rights, property, or safety of Chants, our users, or others.</P>
            </Subsection>
          </Section>

          <Section number={4} title="Data Security" id="data-security">
            <P>We implement industry-standard security measures to protect your information:</P>
            <BulletList items={[
              "Encryption of data in transit and at rest using TLS/SSL",
              "Secure authentication and access controls",
              "Regular security audits and vulnerability assessments",
              "Employee training on data protection best practices"
            ]} />
            <P>While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security.</P>
          </Section>

          <Section number={5} title="Your Rights & Choices" id="your-rights">
            <P>You have control over your personal information:</P>

            <Subsection title="Access & Correction">
              <P>You can access and update your account information through the app settings at any time.</P>
            </Subsection>

            <Subsection title="Location Settings">
              <P>You can enable or disable location services through your device settings. Note that some features require location access to function properly.</P>
            </Subsection>

            <Subsection title="Marketing Communications">
              <P>You can opt out of promotional emails by clicking "unsubscribe" in any marketing email or adjusting your notification preferences in the app.</P>
            </Subsection>

            <Subsection title="Account Deletion">
              <P>You can request deletion of your account and associated data by contacting us at privacy@chants.ca. We will process your request within 30 days.</P>
            </Subsection>
          </Section>

          <Section number={6} title="Children's Privacy" id="childrens-privacy">
            <P>Buzzee is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will promptly delete it.</P>
            <P>If you believe we may have collected information from a child under 13, please contact us immediately at privacy@chants.ca.</P>
          </Section>

          <Section number={7} title="Data Retention" id="data-retention">
            <P>We retain your personal information for as long as necessary to:</P>
            <BulletList items={[
              "Provide you with the Buzzee service",
              "Comply with legal and regulatory requirements",
              "Resolve disputes and enforce our agreements",
              "Support business operations and analytics"
            ]} />
            <P>When you delete your account, we will remove your personal information within 30 days, except where retention is required by law.</P>
          </Section>

          <Section number={8} title="International Data Transfers" id="international">
            <P>Buzzee is operated from Canada. If you access our service from outside Canada, your information may be transferred to and processed in Canada or other countries where our service providers operate.</P>
            <P>We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.</P>
          </Section>

          <Section number={9} title="Changes to This Policy" id="changes">
            <P>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make material changes:</P>
            <BulletList items={[
              "We will update the \"Last updated\" date at the top of this page",
              "We will notify you through the app or via email for significant changes",
              "Continued use of Buzzee after changes constitutes acceptance of the updated policy"
            ]} />
          </Section>

          <Section number={10} title="Contact Us" id="contact">
            <P>If you have questions about this Privacy Policy or our data practices, we're here to help.</P>

            <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold mb-6">Get in Touch</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <a href="mailto:privacy@chants.ca" className="text-white hover:text-primary-400 transition-colors">privacy@chants.ca</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Website</p>
                    <a href="https://www.chants.ca" className="text-white hover:text-primary-400 transition-colors">www.chants.ca</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Address</p>
                    <p className="text-white">Chant Projects Inc.<br />Vancouver, British Columbia, Canada</p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

        </div>
      </section>

      <Footer />
    </div>
  );
}
