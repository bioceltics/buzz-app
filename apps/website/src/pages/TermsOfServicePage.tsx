import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronRight, FileText, Mail, MapPin, Globe, Calendar, AlertTriangle } from 'lucide-react';

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

function ImportantNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-amber-800 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

const tocItems = [
  { id: 'acceptance', title: 'Acceptance of Terms' },
  { id: 'service', title: 'Description of Service' },
  { id: 'accounts', title: 'User Accounts' },
  { id: 'redemption', title: 'Deal Redemption' },
  { id: 'conduct', title: 'User Conduct' },
  { id: 'intellectual-property', title: 'Intellectual Property' },
  { id: 'disclaimers', title: 'Disclaimers' },
  { id: 'liability', title: 'Limitation of Liability' },
  { id: 'indemnification', title: 'Indemnification' },
  { id: 'governing-law', title: 'Governing Law' },
  { id: 'changes', title: 'Changes to Terms' },
  { id: 'contact', title: 'Contact Us' },
];

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 bg-gradient-to-b from-gray-50 via-white to-white">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Terms of Service</span>
          </nav>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Terms of Service</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>

          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            Welcome to Buzzee! These Terms of Service govern your use of the Buzzee mobile application and website operated by Chant Projects Inc. By using our service, you agree to these terms.
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

          <Section number={1} title="Acceptance of Terms" id="acceptance">
            <P>By creating an account, accessing, or using Buzzee, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use the Service.</P>
            <ImportantNotice>
              You must be at least 18 years old or the age of majority in your jurisdiction to use this Service. By using Buzzee, you represent and warrant that you meet this requirement.
            </ImportantNotice>
          </Section>

          <Section number={2} title="Description of Service" id="service">
            <P>Buzzee is a mobile platform that connects users with time-limited deals and offers from local bars, restaurants, and entertainment venues ("Venues"). Our service enables:</P>
            <BulletList items={[
              "Discovery of live, time-sensitive deals from participating venues",
              "Saving and tracking deals that interest you",
              "Redeeming deals at venues through QR code verification",
              "Receiving notifications about new deals and special offers"
            ]} />
          </Section>

          <Section number={3} title="User Accounts" id="accounts">
            <Subsection title="Account Registration">
              <P>To access certain features of Buzzee, you must create an account. You agree to:</P>
              <BulletList items={[
                "Provide accurate, current, and complete information during registration",
                "Maintain and update your information to keep it accurate",
                "Maintain the security of your account credentials",
                "Accept responsibility for all activities under your account",
                "Notify us immediately of any unauthorized use of your account"
              ]} />
            </Subsection>

            <Subsection title="Account Termination">
              <P>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason at our sole discretion. You may also delete your account at any time through the app settings.</P>
            </Subsection>
          </Section>

          <Section number={4} title="Deal Redemption" id="redemption">
            <Subsection title="General Terms">
              <BulletList items={[
                "Deals are subject to availability and may be limited in quantity",
                "Each deal has specific terms, conditions, and expiration times set by the Venue",
                "Deals are non-transferable unless explicitly stated otherwise",
                "One redemption per deal per user unless otherwise specified",
                "Deals cannot be combined with other offers unless explicitly permitted"
              ]} />
            </Subsection>

            <Subsection title="Redemption Process">
              <P>To redeem a deal, you must:</P>
              <BulletList items={[
                "Present your unique QR code at the participating Venue",
                "Redeem the deal during the specified active time period",
                "Meet any minimum purchase requirements specified in the deal",
                "Be physically present at the Venue location"
              ]} />
            </Subsection>

            <Subsection title="Venue Responsibilities">
              <P>While we work with Venues to ensure deal accuracy, Chants is not responsible for:</P>
              <BulletList items={[
                "Venue operational decisions or closures",
                "Quality of products or services provided by Venues",
                "Disputes between users and Venues",
                "Changes to deals made by Venues without notice"
              ]} />
            </Subsection>
          </Section>

          <Section number={5} title="User Conduct" id="conduct">
            <P>You agree not to engage in any of the following prohibited activities:</P>
            <BulletList items={[
              "Use the Service for any unlawful purpose",
              "Attempt to gain unauthorized access to any part of the Service",
              "Create multiple accounts for fraudulent purposes",
              "Share, sell, or transfer deals in violation of deal terms",
              "Use automated systems or bots to access the Service",
              "Interfere with or disrupt the Service or servers",
              "Impersonate any person or entity",
              "Harass, abuse, or harm other users or Venue staff",
              "Submit false or misleading information",
              "Engage in any form of fraud or abuse of the deal system"
            ]} />
          </Section>

          <Section number={6} title="Intellectual Property" id="intellectual-property">
            <P>The Service and its original content, features, and functionality are owned by Chant Projects Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</P>
            <P>You may not:</P>
            <BulletList items={[
              "Copy, modify, or distribute any part of the Service",
              "Use our trademarks or branding without written permission",
              "Reverse engineer or attempt to extract source code",
              "Remove any copyright or proprietary notices"
            ]} />
          </Section>

          <Section number={7} title="Disclaimers" id="disclaimers">
            <ImportantNotice>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
            </ImportantNotice>
            <P>We disclaim all warranties including:</P>
            <BulletList items={[
              "Merchantability and fitness for a particular purpose",
              "Non-infringement of third-party rights",
              "Accuracy or reliability of content",
              "Uninterrupted or error-free operation"
            ]} />
            <P>We do not guarantee that deals will always be available, accurate, or honored by Venues.</P>
          </Section>

          <Section number={8} title="Limitation of Liability" id="liability">
            <ImportantNotice>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, CHANT PROJECTS INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
            </ImportantNotice>
            <P>This includes but is not limited to:</P>
            <BulletList items={[
              "Loss of profits, revenue, data, or business opportunities",
              "Damages arising from your use or inability to use the Service",
              "Actions or omissions of Venues or third parties",
              "Any unauthorized access to or alteration of your data"
            ]} />
            <P>Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim, or $100 CAD, whichever is greater.</P>
          </Section>

          <Section number={9} title="Indemnification" id="indemnification">
            <P>You agree to indemnify, defend, and hold harmless Chant Projects Inc., its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</P>
            <BulletList items={[
              "Your use of the Service",
              "Your violation of these Terms",
              "Your violation of any rights of another party",
              "Your conduct in connection with the Service"
            ]} />
          </Section>

          <Section number={10} title="Governing Law" id="governing-law">
            <P>These Terms shall be governed by and construed in accordance with the laws of the Province of British Columbia, Canada, without regard to its conflict of law provisions.</P>
            <P>Any disputes arising from these Terms or the Service shall be resolved through:</P>
            <BulletList items={[
              "Good faith negotiations between the parties",
              "If unresolved, binding arbitration in Vancouver, British Columbia",
              "The courts of British Columbia shall have exclusive jurisdiction for matters not subject to arbitration"
            ]} />
          </Section>

          <Section number={11} title="Changes to Terms" id="changes">
            <P>We reserve the right to modify these Terms at any time. When we make material changes:</P>
            <BulletList items={[
              "We will post the updated Terms on the Service",
              "We will update the \"Last updated\" date at the top",
              "We will notify you through the app or via email for significant changes"
            ]} />
            <P>Your continued use of Buzzee after changes constitutes acceptance of the modified Terms.</P>
          </Section>

          <Section number={12} title="Contact Us" id="contact">
            <P>If you have questions about these Terms of Service, we're here to help.</P>

            <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h3 className="text-xl font-semibold mb-6">Get in Touch</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <a href="mailto:legal@chants.ca" className="text-white hover:text-primary-400 transition-colors">legal@chants.ca</a>
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
