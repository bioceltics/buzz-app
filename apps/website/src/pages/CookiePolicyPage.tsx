import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, Cookie, Mail, MapPin, Globe, Calendar, Settings, Info } from 'lucide-react';

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

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg flex items-start gap-3">
      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-blue-800 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function CookieTypeCard({ title, description, icon: Icon, items }: { title: string; description: string; icon: React.ElementType; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-pink-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span className="w-1 h-1 rounded-full bg-primary-500 mt-2 flex-shrink-0"></span>
            <span className="text-gray-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const tocItems = [
  { id: 'what-are-cookies', title: 'What Are Cookies' },
  { id: 'types', title: 'Types of Cookies' },
  { id: 'third-party', title: 'Third-Party Cookies' },
  { id: 'duration', title: 'Cookie Duration' },
  { id: 'managing', title: 'Managing Cookies' },
  { id: 'do-not-track', title: 'Do Not Track' },
  { id: 'changes', title: 'Policy Updates' },
  { id: 'contact', title: 'Contact Us' },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-gray-50 via-white to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Cookie Policy</span>
          </nav>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Cookie className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Cookie Policy</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            This Cookie Policy explains how Chant Projects Inc. uses cookies and similar technologies when you visit our website or use the Buzzee mobile application. By using our service, you consent to cookies as described here.
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

          <Section number={1} title="What Are Cookies?" id="what-are-cookies">
            <P>Cookies are small text files stored on your device when you visit a website. They help websites work efficiently, provide a better user experience, and give site owners insights into usage patterns.</P>

            <Subsection title="Similar Technologies">
              <P>In addition to cookies, we also use:</P>
              <BulletList items={[
                "Local Storage - Stores data locally on your device for improved performance",
                "Session Storage - Temporary storage cleared when you close your browser",
                "Pixels/Web Beacons - Small images that track user behavior",
                "Device Identifiers - Unique IDs associated with your mobile device"
              ]} />
            </Subsection>
          </Section>

          <Section number={2} title="Types of Cookies We Use" id="types">
            <P>We use different types of cookies to provide and improve our service:</P>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <CookieTypeCard
                title="Essential Cookies"
                description="Required for the service to function properly."
                icon={Settings}
                items={[
                  "User authentication and login",
                  "Security and fraud prevention",
                  "Load balancing and performance",
                  "Remembering your preferences"
                ]}
              />
              <CookieTypeCard
                title="Analytics Cookies"
                description="Help us understand how you use Buzzee."
                icon={Info}
                items={[
                  "Traffic and usage patterns",
                  "Popular pages and features",
                  "Error identification",
                  "Performance monitoring"
                ]}
              />
              <CookieTypeCard
                title="Functional Cookies"
                description="Enable enhanced features and personalization."
                icon={Cookie}
                items={[
                  "Language preferences",
                  "Saved deals and favorites",
                  "Customized content",
                  "Social sharing features"
                ]}
              />
              <CookieTypeCard
                title="Marketing Cookies"
                description="Deliver relevant ads and measure campaign effectiveness."
                icon={Globe}
                items={[
                  "Personalized advertisements",
                  "Ad frequency limits",
                  "Campaign measurement",
                  "Cross-site recognition"
                ]}
              />
            </div>

            <InfoBox>
              Essential cookies cannot be disabled as they are necessary for the service to function. You can manage other cookie types through your browser settings.
            </InfoBox>
          </Section>

          <Section number={3} title="Third-Party Cookies" id="third-party">
            <P>We work with trusted third-party providers who may place cookies on your device:</P>

            <Subsection title="Analytics Providers">
              <BulletList items={[
                "Google Analytics - Helps us understand user interactions",
                "Mixpanel - Provides detailed behavior and engagement analytics"
              ]} />
            </Subsection>

            <Subsection title="Advertising Partners">
              <BulletList items={[
                "Google Ads - Targeted advertising and conversion tracking",
                "Meta (Facebook) - Social media advertising and audience insights"
              ]} />
            </Subsection>

            <Subsection title="Service Providers">
              <BulletList items={[
                "Stripe - Secure payment processing",
                "Intercom - Customer support and communication"
              ]} />
            </Subsection>

            <P>These third parties have their own privacy policies and may collect information about your activities across different websites.</P>
          </Section>

          <Section number={4} title="Cookie Duration" id="duration">
            <P>Cookies remain on your device for different periods:</P>

            <Subsection title="Session Cookies">
              <P>Temporary cookies that expire when you close your browser. Used to maintain your session while navigating the service.</P>
            </Subsection>

            <Subsection title="Persistent Cookies">
              <P>Remain on your device for a set period (days to years) or until deleted. Used to remember preferences and recognize returning users.</P>
            </Subsection>
          </Section>

          <Section number={5} title="Managing Your Cookie Preferences" id="managing">
            <P>You have control over cookies on your device:</P>

            <Subsection title="Browser Settings">
              <P>Most browsers let you manage cookies. You can:</P>
              <BulletList items={[
                "View all cookies stored on your device",
                "Delete all or specific cookies",
                "Block all cookies or only third-party cookies",
                "Set preferences for specific websites"
              ]} />
            </Subsection>

            <Subsection title="Browser-Specific Instructions">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm"><span className="font-semibold text-gray-900">Chrome:</span> <span className="text-gray-600">Settings → Privacy and security → Cookies</span></p>
                <p className="text-sm"><span className="font-semibold text-gray-900">Firefox:</span> <span className="text-gray-600">Settings → Privacy & Security → Cookies</span></p>
                <p className="text-sm"><span className="font-semibold text-gray-900">Safari:</span> <span className="text-gray-600">Preferences → Privacy → Cookies</span></p>
                <p className="text-sm"><span className="font-semibold text-gray-900">Edge:</span> <span className="text-gray-600">Settings → Cookies and site permissions</span></p>
              </div>
            </Subsection>

            <Subsection title="Mobile App Settings">
              <BulletList items={[
                "iOS: Settings → Privacy → Tracking",
                "Android: Settings → Privacy → Ads"
              ]} />
            </Subsection>

            <Subsection title="Opt-Out Tools">
              <BulletList items={[
                "Google Analytics Opt-out Browser Add-on",
                "Digital Advertising Alliance: optout.aboutads.info",
                "Network Advertising Initiative: optout.networkadvertising.org"
              ]} />
            </Subsection>

            <InfoBox>
              Blocking or deleting cookies may affect some features of the Buzzee service. Essential cookies are required for basic functionality.
            </InfoBox>
          </Section>

          <Section number={6} title="Do Not Track Signals" id="do-not-track">
            <P>Some browsers offer a "Do Not Track" (DNT) feature that signals websites you do not wish to be tracked. Our service currently does not respond to DNT signals, but we respect your cookie preferences as described in this policy.</P>
          </Section>

          <Section number={7} title="Updates to This Policy" id="changes">
            <P>We may update this Cookie Policy periodically. When we make changes:</P>
            <BulletList items={[
              "We will post the updated policy on this page",
              "We will update the \"Last updated\" date at the top",
              "We will notify you through the app or email for significant changes"
            ]} />
            <P>We encourage you to review this policy periodically to stay informed about our cookie practices.</P>
          </Section>

          <Section number={8} title="Contact Us" id="contact">
            <P>If you have questions about this Cookie Policy or our use of cookies, we're here to help.</P>

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
