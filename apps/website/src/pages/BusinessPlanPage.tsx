import { ArrowLeft, Building2, Users, Target, Package, DollarSign, Rocket, Lightbulb, Settings, PieChart, Swords, Award, TrendingUp, MessageCircle, ShoppingCart, Wallet, LineChart, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom Buzzee Logo Icon
function BuzzeeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="12" y="17" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">B</text>
    </svg>
  );
}

// Table of Contents
function TableOfContents() {
  const sections = [
    { id: 'overview', title: '1. Business Name & Services Overview' },
    { id: 'customer-profile', title: '2. Intended Customer Profile' },
    { id: 'goals', title: '3. Business Goals & Aspirations' },
    { id: 'products', title: '4. Products & Services Description' },
    { id: 'pricing', title: '5. Pricing Structure' },
    { id: 'development', title: '6. Development Stage Assessment' },
    { id: 'research', title: '7. Research & Development' },
    { id: 'production', title: '8. Manufacturing & Production Process' },
    { id: 'market', title: '9. Market & Customer Analysis' },
    { id: 'competitive', title: '10. Competitive Analysis' },
    { id: 'advantages', title: '11. Competitive Advantages' },
    { id: 'growth', title: '12. Growth Strategy' },
    { id: 'communications', title: '13. Customer Communications Plan' },
    { id: 'sales', title: '14. Sales Strategy' },
    { id: 'current-financials', title: '15. Current Financial Situation' },
    { id: 'prospective', title: '16. Prospective Financials' },
    { id: 'statements', title: '17. The Financials (Statements)' },
  ];

  return (
    <nav className="bg-gray-50 rounded-2xl p-6 mb-12 border border-gray-100">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h2>
      <div className="grid md:grid-cols-2 gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-sm text-gray-600 hover:text-primary-500 transition-colors py-1"
          >
            {section.title}
          </a>
        ))}
      </div>
    </nav>
  );
}

// Section Component
function Section({
  id,
  number,
  title,
  icon: Icon,
  children
}: {
  id: string;
  number: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-sm text-primary-500 font-semibold">Section {number}</span>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="prose prose-gray max-w-none">
        {children}
      </div>
    </section>
  );
}

// Section 1: Business Name & Services Overview
function BusinessOverview() {
  return (
    <Section id="overview" number="1" title="Business Name & Services Overview" icon={Building2}>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Buzzee</h3>
        <p className="text-primary-500 font-medium mb-4">Real-Time Deal Discovery Platform</p>
        <p className="text-gray-600 leading-relaxed">
          Buzzee is a mobile-first platform that connects consumers with time-sensitive deals from local venues including bars, restaurants, clubs, and entertainment establishments. Unlike traditional coupon apps, Buzzee focuses on <strong>live, ephemeral offers</strong> that create urgency and drive immediate foot traffic.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Core Services</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">For Consumers (B2C)</h4>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>• Real-time deal discovery feed</li>
            <li>• Location-based venue recommendations</li>
            <li>• Push notifications for favorite venues</li>
            <li>• QR code-based deal redemption</li>
            <li>• Deal saving and sharing features</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">For Businesses (B2B)</h4>
          <ul className="text-gray-600 space-y-2 text-sm">
            <li>• Self-service deal creation dashboard</li>
            <li>• Time-limited deal scheduling</li>
            <li>• Real-time analytics and insights</li>
            <li>• Customer engagement tools</li>
            <li>• AI-powered optimization recommendations</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Business Model</h3>
      <p className="text-gray-600 leading-relaxed">
        Buzzee operates on a <strong>B2B2C SaaS model</strong>. Venues pay a monthly subscription fee to access the platform and create unlimited deals. Consumers download and use the app for free, creating a network effect that increases value for all participants.
      </p>
    </Section>
  );
}

// Section 2: Intended Customer Profile
function CustomerProfile() {
  return (
    <Section id="customer-profile" number="2" title="Intended Customer Profile" icon={Users}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Customers (B2B - Venues)</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Bars & Nightclubs</h4>
            <p className="text-sm text-gray-600">Happy hour promotions, event nights, slow period specials</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Restaurants</h4>
            <p className="text-sm text-gray-600">Lunch specials, early bird discounts, last-minute table fills</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Entertainment Venues</h4>
            <p className="text-sm text-gray-600">Event promotions, group deals, off-peak incentives</p>
          </div>
        </div>
      </div>

      <h4 className="font-semibold text-gray-900 mb-3">Ideal Venue Profile:</h4>
      <ul className="text-gray-600 space-y-2 mb-8">
        <li>• Located in urban or suburban areas with high foot traffic potential</li>
        <li>• Revenue between $500K - $5M annually</li>
        <li>• Experiences variable demand throughout the day/week</li>
        <li>• Has capacity to handle increased traffic during promotions</li>
        <li>• Tech-savvy ownership or management willing to adopt digital tools</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">End Users (B2C - Consumers)</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Demographics</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Age: 21-45 years old</li>
              <li>• Income: $40K-$120K annually</li>
              <li>• Urban and suburban residents</li>
              <li>• Smartphone users (iOS & Android)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Psychographics</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Value-conscious but not cheap</li>
              <li>• Spontaneous decision-makers</li>
              <li>• Socially active, enjoys dining/nightlife</li>
              <li>• FOMO-driven, responds to urgency</li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 3: Business Goals & Aspirations
function BusinessGoals() {
  return (
    <Section id="goals" number="3" title="Business Goals & Aspirations" icon={Target}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Short-Term Goals (Year 1)</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
            <div>
              <p className="font-medium text-gray-900">Launch MVP in 3 pilot cities</p>
              <p className="text-sm text-gray-500">Target: 100 venue partners, 10,000 active users per city</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
            <div>
              <p className="font-medium text-gray-900">Achieve product-market fit</p>
              <p className="text-sm text-gray-500">Target: 40%+ monthly user retention, NPS 50+</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
            <div>
              <p className="font-medium text-gray-900">Generate $500K ARR</p>
              <p className="text-sm text-gray-500">Through venue subscriptions and premium features</p>
            </div>
          </li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Medium-Term Goals (Years 2-3)</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <ul className="text-gray-600 space-y-2">
          <li>• Expand to 25 major metropolitan areas</li>
          <li>• Reach 5,000+ venue partners nationwide</li>
          <li>• Achieve 1 million monthly active users</li>
          <li>• Generate $5M ARR with path to profitability</li>
          <li>• Raise Series A funding ($10-15M)</li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Long-Term Vision (Years 4-5)</h3>
      <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
        <p className="text-gray-700 leading-relaxed mb-4">
          Become the <strong>go-to platform for real-time local commerce</strong>, expanding beyond food and beverage to include retail, entertainment, wellness, and service industries.
        </p>
        <ul className="text-gray-600 space-y-2">
          <li>• IPO or strategic acquisition ($500M+ valuation)</li>
          <li>• International expansion to 10+ countries</li>
          <li>• Platform ecosystem with third-party integrations</li>
          <li>• AI-driven autonomous deal optimization</li>
        </ul>
      </div>
    </Section>
  );
}

// Section 4: Products & Services Description
function ProductsServices() {
  return (
    <Section id="products" number="4" title="Products & Services Description" icon={Package}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumer Mobile App</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <p className="text-gray-600 mb-4">Available on iOS and Android, the Buzzee consumer app delivers:</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-sm">📍</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Live Deal Feed</p>
                <p className="text-sm text-gray-500">Real-time stream of active deals nearby</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-sm">🔔</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Smart Notifications</p>
                <p className="text-sm text-gray-500">Alerts when favorite venues go live</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-sm">📱</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">QR Redemption</p>
                <p className="text-sm text-gray-500">Instant verification at venue</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 text-sm">❤️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Favorites & History</p>
                <p className="text-sm text-gray-500">Save venues and track redemptions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Dashboard (Web)</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <p className="text-gray-600 mb-4">Comprehensive venue management platform:</p>
        <ul className="text-gray-600 space-y-2">
          <li><strong>Deal Creator:</strong> Intuitive interface to create, schedule, and manage time-limited offers</li>
          <li><strong>Analytics Dashboard:</strong> Real-time metrics on views, saves, redemptions, and revenue impact</li>
          <li><strong>Customer Insights:</strong> Demographic and behavioral data on deal redeemers</li>
          <li><strong>AI Recommendations:</strong> Suggested optimal deal times, pricing, and targeting</li>
          <li><strong>QR Scanner:</strong> Mobile-optimized scanner for quick deal verification</li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Mobile App</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <p className="text-gray-600 mb-4">On-the-go management for venue owners and staff:</p>
        <ul className="text-gray-600 space-y-2">
          <li>• Quick deal creation for spontaneous promotions</li>
          <li>• Push notifications for deal activity</li>
          <li>• Built-in QR scanner for redemption</li>
          <li>• Real-time performance metrics</li>
          <li>• Staff account management</li>
        </ul>
      </div>
    </Section>
  );
}

// Section 5: Pricing Structure
function PricingStructure() {
  return (
    <Section id="pricing" number="5" title="Pricing Structure" icon={DollarSign}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Subscription Tiers</h3>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-1">Starter</h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">$99<span className="text-sm font-normal text-gray-500">/mo</span></div>
          <p className="text-sm text-gray-500 mb-4">For small venues testing the platform</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Up to 10 deals/month</li>
            <li>• Basic analytics</li>
            <li>• Email support</li>
            <li>• 1 user account</li>
          </ul>
        </div>
        <div className="bg-primary-50 rounded-xl p-6 border-2 border-primary-500 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">POPULAR</span>
          <h4 className="font-bold text-gray-900 mb-1">Pro</h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">$199<span className="text-sm font-normal text-gray-500">/mo</span></div>
          <p className="text-sm text-gray-500 mb-4">For active venues maximizing traffic</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Unlimited deals</li>
            <li>• Advanced analytics & AI insights</li>
            <li>• Priority support</li>
            <li>• Up to 5 user accounts</li>
            <li>• Custom branding</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-1">Enterprise</h4>
          <div className="text-3xl font-bold text-gray-900 mb-2">Custom</div>
          <p className="text-sm text-gray-500 mb-4">For chains and large groups</p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Multi-location management</li>
            <li>• API access</li>
            <li>• Dedicated account manager</li>
            <li>• Custom integrations</li>
            <li>• SLA guarantees</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Consumer Pricing</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <p className="text-gray-600 mb-4">The consumer app is <strong>free to download and use</strong>. This maximizes user acquisition and creates value for venue partners.</p>
        <h4 className="font-semibold text-gray-900 mb-2">Future Monetization Options:</h4>
        <ul className="text-gray-600 space-y-1 text-sm">
          <li>• Premium tier with exclusive early access to deals</li>
          <li>• No-ads experience subscription</li>
          <li>• Loyalty rewards program with partner venues</li>
        </ul>
      </div>
    </Section>
  );
}

// Section 6: Development Stage Assessment
function DevelopmentStage() {
  return (
    <Section id="development" number="6" title="Development Stage Assessment" icon={Rocket}>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold rounded-full text-sm">MVP Complete</span>
          <span className="text-gray-500 text-sm">December 2025</span>
        </div>
        <p className="text-gray-600 leading-relaxed">
          Buzzee has completed its Minimum Viable Product phase with a fully functional consumer app, venue dashboard, and core deal creation/redemption flow. The platform is ready for pilot launch.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Milestones</h3>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Phase 1: Foundation (Completed)</p>
            <p className="text-sm text-gray-500">Core platform architecture, authentication, database design</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Phase 2: Consumer App (Completed)</p>
            <p className="text-sm text-gray-500">Deal discovery, QR redemption, notifications, user profiles</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">✓</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Phase 3: Business Dashboard (Completed)</p>
            <p className="text-sm text-gray-500">Deal creation, analytics, venue management, QR scanner</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">→</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Phase 4: AI Integration (In Progress)</p>
            <p className="text-sm text-gray-500">Smart recommendations, demand forecasting, auto-optimization</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">○</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Phase 5: Scale & Expansion (Planned)</p>
            <p className="text-sm text-gray-500">Multi-region support, enterprise features, third-party integrations</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 7: Research & Development
function ResearchDevelopment() {
  return (
    <Section id="research" number="7" title="Research & Development" icon={Lightbulb}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ongoing R&D Initiatives</h3>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">AI & Machine Learning</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Predictive demand modeling</li>
            <li>• Personalized deal recommendations</li>
            <li>• Dynamic pricing optimization</li>
            <li>• Anomaly detection for fraud prevention</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">User Experience</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• A/B testing framework</li>
            <li>• Heat mapping and behavior analysis</li>
            <li>• Accessibility improvements</li>
            <li>• Performance optimization</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Platform Scalability</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Real-time infrastructure improvements</li>
            <li>• Global CDN deployment</li>
            <li>• Database sharding strategies</li>
            <li>• Edge computing for low latency</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Integration Ecosystem</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• POS system integrations</li>
            <li>• Reservation platform partnerships</li>
            <li>• Payment processor connections</li>
            <li>• Marketing automation tools</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">R&D Investment</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <p className="text-gray-600 mb-4">
          Buzzee allocates <strong>25% of operating budget</strong> to research and development, ensuring continuous innovation and competitive advantage.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-500">40%</div>
            <div className="text-xs text-gray-500">AI/ML Development</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-500">35%</div>
            <div className="text-xs text-gray-500">Platform Engineering</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-500">25%</div>
            <div className="text-xs text-gray-500">UX Research</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 8: Manufacturing & Production Process
function ProductionProcess() {
  return (
    <Section id="production" number="8" title="Manufacturing & Production Process" icon={Settings}>
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 mb-6">
        <p className="text-blue-800">
          <strong>Note:</strong> As a software platform, Buzzee's "production process" refers to our software development lifecycle and infrastructure operations rather than physical manufacturing.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Software Development Lifecycle</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold">1</span>
            </div>
            <p className="font-medium text-gray-900 text-sm">Plan</p>
            <p className="text-xs text-gray-500">Requirements & Design</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <p className="font-medium text-gray-900 text-sm">Develop</p>
            <p className="text-xs text-gray-500">Code & Review</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <p className="font-medium text-gray-900 text-sm">Test</p>
            <p className="text-xs text-gray-500">QA & Staging</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-600 font-bold">4</span>
            </div>
            <p className="font-medium text-gray-900 text-sm">Deploy</p>
            <p className="text-xs text-gray-500">Release & Monitor</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Infrastructure & Operations</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Cloud Infrastructure</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Supabase for backend services</li>
            <li>• Vercel for web deployments</li>
            <li>• AWS/GCP for scalable compute</li>
            <li>• Cloudflare for CDN and security</li>
          </ul>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">DevOps Practices</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• CI/CD with automated testing</li>
            <li>• Infrastructure as Code (Terraform)</li>
            <li>• 24/7 monitoring and alerting</li>
            <li>• Blue-green deployments</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Release Cadence</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <ul className="text-gray-600 space-y-2">
          <li><strong>Web Dashboard:</strong> Continuous deployment (multiple times daily)</li>
          <li><strong>Mobile Apps:</strong> Bi-weekly releases with hotfix capability</li>
          <li><strong>API:</strong> Versioned releases with backward compatibility</li>
          <li><strong>Infrastructure:</strong> Monthly maintenance windows</li>
        </ul>
      </div>
    </Section>
  );
}

// Section 9: Market & Customer Analysis
function MarketAnalysis() {
  return (
    <Section id="market" number="9" title="Market & Customer Analysis" icon={PieChart}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Addressable Market (TAM)</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-500 mb-1">$180B</div>
            <div className="text-sm text-gray-500">US & Canada Restaurant & Bar Industry</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-500 mb-1">$15B</div>
            <div className="text-sm text-gray-500">Restaurant Marketing Spend</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-500 mb-1">760K+</div>
            <div className="text-sm text-gray-500">Bars & Restaurants in US & Canada</div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Serviceable Addressable Market (SAM)</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <p className="text-gray-600 mb-4">
          Focusing on venues in top metropolitan areas across the US and Canada that actively use digital marketing:
        </p>
        <ul className="text-gray-600 space-y-2">
          <li><strong>Target Venues:</strong> ~230,000 establishments</li>
          <li><strong>At $199/month:</strong> $549M annual potential revenue</li>
          <li><strong>Target Consumers:</strong> 55M urban adults (21-45) in target metros</li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Trends</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-green-600 mb-2">Favorable Trends</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Mobile-first consumer behavior</li>
            <li>• Rising demand for local experiences</li>
            <li>• Real-time expectation economy</li>
            <li>• Shift from mass to micro-targeted marketing</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-amber-600 mb-2">Market Challenges</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Fragmented venue industry</li>
            <li>• Tech adoption resistance in SMBs</li>
            <li>• Economic sensitivity of dining out</li>
            <li>• High venue churn rate</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

// Section 10: Competitive Analysis
function CompetitiveAnalysis() {
  return (
    <Section id="competitive" number="10" title="Competitive Analysis" icon={Swords}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Landscape</h3>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Competitor</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Model</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Weakness vs Buzzee</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-900">Groupon</td>
              <td className="py-3 px-4 text-gray-600">Daily deals, revenue share</td>
              <td className="py-3 px-4 text-gray-600">High fees, not real-time, brand dilution</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-900">Yelp</td>
              <td className="py-3 px-4 text-gray-600">Reviews + ads</td>
              <td className="py-3 px-4 text-gray-600">No live deals, expensive ads, review fatigue</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-900">OpenTable</td>
              <td className="py-3 px-4 text-gray-600">Reservations + perks</td>
              <td className="py-3 px-4 text-gray-600">Restaurant-only, per-cover fees</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-900">Local Flavor</td>
              <td className="py-3 px-4 text-gray-600">Gift certificate deals</td>
              <td className="py-3 px-4 text-gray-600">Not mobile-first, not time-limited</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-900">Instagram/Social</td>
              <td className="py-3 px-4 text-gray-600">Organic & paid posts</td>
              <td className="py-3 px-4 text-gray-600">No redemption tracking, algorithm-dependent</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Buzzee's Differentiation</h3>
      <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
        <p className="text-gray-700 mb-4">
          Buzzee occupies a unique position as the <strong>only platform focused exclusively on real-time, ephemeral deals</strong> for the hospitality industry.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">What We Do Differently:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Live deals with countdown timers</li>
              <li>• Flat subscription (no revenue share)</li>
              <li>• Real-time analytics for venues</li>
              <li>• QR-based instant redemption</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Why It Matters:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Creates urgency and FOMO</li>
              <li>• Predictable costs for venues</li>
              <li>• Immediate feedback loop</li>
              <li>• Frictionless customer experience</li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 11: Competitive Advantages
function CompetitiveAdvantages() {
  return (
    <Section id="advantages" number="11" title="Competitive Advantages" icon={Award}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-xl">⚡</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">First-Mover in Real-Time Deals</h4>
              <p className="text-gray-600 text-sm">
                No major competitor focuses on live, time-limited deals. We're building the category and defining consumer expectations.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xl">🔄</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Network Effects</h4>
              <p className="text-gray-600 text-sm">
                More users attract more venues. More venues create more deals. More deals attract more users. This flywheel creates a defensible moat.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 text-xl">🧠</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Proprietary Data & AI</h4>
              <p className="text-gray-600 text-sm">
                Every deal creates data on consumer behavior, timing effectiveness, and pricing optimization. Our AI learns what works and helps venues optimize automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 text-xl">💰</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Venue-Friendly Economics</h4>
              <p className="text-gray-600 text-sm">
                Flat monthly fee vs. revenue share. Venues keep 100% of deal revenue, making Buzzee the preferred partner for margin-conscious operators.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 text-xl">📱</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Mobile-Native Experience</h4>
              <p className="text-gray-600 text-sm">
                Built from day one for mobile, with push notifications, location services, and instant QR redemption. Competitors retrofitting mobile can't match our UX.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 12: Growth Strategy
function GrowthStrategy() {
  return (
    <Section id="growth" number="12" title="Growth Strategy" icon={TrendingUp}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 1: City-by-City Launch (Year 1)</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <p className="text-gray-600 mb-4">Concentrated market penetration in 3 pilot cities:</p>
        <ul className="text-gray-600 space-y-2">
          <li><strong>Target Cities:</strong> Austin, Nashville, Denver (vibrant nightlife, tech-savvy demographics)</li>
          <li><strong>Strategy:</strong> Sign 50-100 anchor venues before consumer launch</li>
          <li><strong>Goal:</strong> 15% venue penetration in target neighborhoods</li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 2: Regional Expansion (Year 2)</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <ul className="text-gray-600 space-y-2">
          <li>• Expand to 15-20 additional metros</li>
          <li>• Develop repeatable city launch playbook</li>
          <li>• Build regional sales teams</li>
          <li>• Introduce enterprise tier for chains</li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Channels</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">Venue Acquisition (B2B)</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Direct sales team</li>
            <li>• Restaurant association partnerships</li>
            <li>• Referral incentives</li>
            <li>• Industry event presence</li>
            <li>• Content marketing (case studies)</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">User Acquisition (B2C)</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Venue-driven downloads (signage, receipts)</li>
            <li>• Social media marketing</li>
            <li>• Influencer partnerships</li>
            <li>• Referral program</li>
            <li>• App store optimization</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Growth Metrics</h3>
      <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">15%</div>
            <div className="text-xs text-gray-600">MoM Venue Growth</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">20%</div>
            <div className="text-xs text-gray-600">MoM User Growth</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">&lt;5%</div>
            <div className="text-xs text-gray-600">Monthly Churn</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-600">$150</div>
            <div className="text-xs text-gray-600">Target CAC</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 13: Customer Communications Plan
function CustomerCommunications() {
  return (
    <Section id="communications" number="13" title="Customer Communications Plan" icon={MessageCircle}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Channels</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">For Venues (B2B)</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><strong>Onboarding:</strong> Dedicated success manager, video tutorials, in-app guides</li>
            <li><strong>Ongoing:</strong> Monthly performance reports, email newsletters, webinars</li>
            <li><strong>Support:</strong> In-app chat, email, phone (Pro+)</li>
            <li><strong>Updates:</strong> Product changelog, feature announcements</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-2">For Consumers (B2C)</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><strong>Push Notifications:</strong> Deal alerts, favorites updates</li>
            <li><strong>In-App:</strong> Personalized deal feed, venue messaging</li>
            <li><strong>Email:</strong> Weekly digest, special promotions</li>
            <li><strong>Social:</strong> Instagram, TikTok, Twitter engagement</li>
          </ul>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Cadence</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-900">Daily</span>
            <span className="text-sm text-gray-600">Push notifications for live deals (user preference)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-900">Weekly</span>
            <span className="text-sm text-gray-600">Email digest, venue performance summary</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="font-medium text-gray-900">Monthly</span>
            <span className="text-sm text-gray-600">Venue analytics report, product newsletter</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-medium text-gray-900">Quarterly</span>
            <span className="text-sm text-gray-600">Business review calls (Pro+), roadmap preview</span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Loops</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <ul className="text-gray-600 space-y-2">
          <li>• In-app feedback widgets and NPS surveys</li>
          <li>• User interviews and focus groups (quarterly)</li>
          <li>• Venue advisory board (top partners)</li>
          <li>• Public roadmap with voting</li>
          <li>• Social media listening and response</li>
        </ul>
      </div>
    </Section>
  );
}

// Section 14: Sales Strategy
function SalesStrategy() {
  return (
    <Section id="sales" number="14" title="Sales Strategy" icon={ShoppingCart}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Model</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-primary-600 mb-2">Starter & Pro Tiers</h4>
            <p className="text-sm text-gray-600 mb-2">Self-serve + Inside Sales Hybrid</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Online signup with 14-day free trial</li>
              <li>• Inside sales team for demos</li>
              <li>• Inbound lead nurturing</li>
              <li>• Self-service onboarding</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary-600 mb-2">Enterprise Tier</h4>
            <p className="text-sm text-gray-600 mb-2">Direct Field Sales</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Account executives for chains</li>
              <li>• Custom proposals and negotiations</li>
              <li>• Executive presentations</li>
              <li>• White-glove implementation</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Process</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <div className="grid md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold text-sm">1</span>
            </div>
            <p className="text-xs font-medium text-gray-900">Lead Gen</p>
            <p className="text-xs text-gray-500">Inbound/Outbound</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold text-sm">2</span>
            </div>
            <p className="text-xs font-medium text-gray-900">Qualify</p>
            <p className="text-xs text-gray-500">SDR Call</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold text-sm">3</span>
            </div>
            <p className="text-xs font-medium text-gray-900">Demo</p>
            <p className="text-xs text-gray-500">Product Tour</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-600 font-bold text-sm">4</span>
            </div>
            <p className="text-xs font-medium text-gray-900">Trial</p>
            <p className="text-xs text-gray-500">14-Day Free</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold text-sm">5</span>
            </div>
            <p className="text-xs font-medium text-gray-900">Close</p>
            <p className="text-xs text-gray-500">Subscription</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Targets</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">50+</div>
            <div className="text-xs text-gray-500">Demos/Month (SDR)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">25%</div>
            <div className="text-xs text-gray-500">Demo-to-Trial Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">60%</div>
            <div className="text-xs text-gray-500">Trial-to-Paid Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">$2,388</div>
            <div className="text-xs text-gray-500">Avg. ACV (Pro)</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 15: Current Financial Situation
function CurrentFinancials() {
  return (
    <Section id="current-financials" number="15" title="Current Financial Situation" icon={Wallet}>
      <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 mb-6">
        <p className="text-amber-800">
          <strong>Stage:</strong> Pre-revenue startup with MVP complete, preparing for pilot launch.
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding History</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Bootstrapped / Self-Funded</p>
              <p className="text-sm text-gray-500">Q3-Q4 2025</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">$50,000</p>
              <p className="text-xs text-gray-500">Founder capital</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Seeking Pre-Seed</p>
              <p className="text-sm text-gray-500">Q2 2026</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary-600">$500,000</p>
              <p className="text-xs text-gray-500">Target raise</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Expenses (Monthly)</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Infrastructure (Supabase, Vercel, etc.)</span>
            <span className="font-medium text-gray-900">$200</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Development Tools & Subscriptions</span>
            <span className="font-medium text-gray-900">$150</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Legal & Administrative</span>
            <span className="font-medium text-gray-900">$100</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
            <span className="font-semibold text-gray-900">Total Monthly Burn</span>
            <span className="font-bold text-gray-900">~$450</span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Use of Pre-Seed Funds</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Team (2 hires)</span>
              <span className="font-medium text-gray-900">$250,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Marketing & Sales</span>
              <span className="font-medium text-gray-900">$100,000</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Product Development</span>
              <span className="font-medium text-gray-900">$100,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Operations & Legal</span>
              <span className="font-medium text-gray-900">$50,000</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Runway: 12-15 months to reach $25K MRR milestone</p>
      </div>
    </Section>
  );
}

// Section 16: Prospective Financials
function ProspectiveFinancials() {
  return (
    <Section id="prospective" number="16" title="Prospective Financials" icon={LineChart}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Projections</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-900">Metric</th>
                <th className="text-right py-2 font-semibold text-gray-900">Year 1</th>
                <th className="text-right py-2 font-semibold text-gray-900">Year 2</th>
                <th className="text-right py-2 font-semibold text-gray-900">Year 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Venue Partners</td>
                <td className="py-2 text-right text-gray-900">300</td>
                <td className="py-2 text-right text-gray-900">1,500</td>
                <td className="py-2 text-right text-gray-900">5,000</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">Avg. Revenue/Venue</td>
                <td className="py-2 text-right text-gray-900">$150/mo</td>
                <td className="py-2 text-right text-gray-900">$175/mo</td>
                <td className="py-2 text-right text-gray-900">$185/mo</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600">MRR (end of year)</td>
                <td className="py-2 text-right text-gray-900">$45K</td>
                <td className="py-2 text-right text-gray-900">$262K</td>
                <td className="py-2 text-right text-gray-900">$925K</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-600 font-medium">ARR</td>
                <td className="py-2 text-right font-bold text-primary-600">$540K</td>
                <td className="py-2 text-right font-bold text-primary-600">$3.15M</td>
                <td className="py-2 text-right font-bold text-primary-600">$11.1M</td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Consumer MAU</td>
                <td className="py-2 text-right text-gray-900">50K</td>
                <td className="py-2 text-right text-gray-900">300K</td>
                <td className="py-2 text-right text-gray-900">1.2M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Assumptions</h3>
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
        <ul className="text-gray-600 space-y-2 text-sm">
          <li>• Monthly venue churn rate: 5%</li>
          <li>• Trial-to-paid conversion: 60%</li>
          <li>• Consumer-to-venue ratio: 150:1</li>
          <li>• Average customer acquisition cost: $150</li>
          <li>• Gross margin: 85% (software SaaS)</li>
        </ul>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Path to Profitability</h3>
      <div className="bg-primary-50 rounded-xl p-6 border border-primary-100">
        <p className="text-gray-700 mb-4">
          Buzzee targets <strong>break-even at ~$200K MRR</strong> (approximately 1,100 Pro subscribers), expected in Year 2.
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-primary-600">18 mo</div>
            <div className="text-xs text-gray-600">To Break-even</div>
          </div>
          <div>
            <div className="text-xl font-bold text-primary-600">85%</div>
            <div className="text-xs text-gray-600">Gross Margin</div>
          </div>
          <div>
            <div className="text-xl font-bold text-primary-600">16x</div>
            <div className="text-xs text-gray-600">LTV:CAC Ratio</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Section 17: The Financials (Statements)
function FinancialStatements() {
  return (
    <Section id="statements" number="17" title="The Financials (Statements)" icon={FileText}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Projected Income Statement (Year 1-3)</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-semibold text-gray-900"></th>
              <th className="text-right py-2 font-semibold text-gray-900">Year 1</th>
              <th className="text-right py-2 font-semibold text-gray-900">Year 2</th>
              <th className="text-right py-2 font-semibold text-gray-900">Year 3</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 bg-green-50">
              <td className="py-2 font-medium text-gray-900">Revenue</td>
              <td className="py-2 text-right text-gray-900">$540,000</td>
              <td className="py-2 text-right text-gray-900">$3,150,000</td>
              <td className="py-2 text-right text-gray-900">$11,100,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-600 pl-4">Cost of Goods Sold (15%)</td>
              <td className="py-2 text-right text-gray-600">($81,000)</td>
              <td className="py-2 text-right text-gray-600">($472,500)</td>
              <td className="py-2 text-right text-gray-600">($1,665,000)</td>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50">
              <td className="py-2 font-medium text-gray-900">Gross Profit</td>
              <td className="py-2 text-right font-medium text-gray-900">$459,000</td>
              <td className="py-2 text-right font-medium text-gray-900">$2,677,500</td>
              <td className="py-2 text-right font-medium text-gray-900">$9,435,000</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-600 pl-4">Sales & Marketing</td>
              <td className="py-2 text-right text-gray-600">($300,000)</td>
              <td className="py-2 text-right text-gray-600">($1,200,000)</td>
              <td className="py-2 text-right text-gray-600">($3,500,000)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-600 pl-4">Product & Engineering</td>
              <td className="py-2 text-right text-gray-600">($350,000)</td>
              <td className="py-2 text-right text-gray-600">($800,000)</td>
              <td className="py-2 text-right text-gray-600">($2,000,000)</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-600 pl-4">General & Admin</td>
              <td className="py-2 text-right text-gray-600">($100,000)</td>
              <td className="py-2 text-right text-gray-600">($250,000)</td>
              <td className="py-2 text-right text-gray-600">($500,000)</td>
            </tr>
            <tr className="bg-primary-50">
              <td className="py-2 font-bold text-gray-900">Net Income (Loss)</td>
              <td className="py-2 text-right font-bold text-red-600">($291,000)</td>
              <td className="py-2 text-right font-bold text-green-600">$427,500</td>
              <td className="py-2 text-right font-bold text-green-600">$3,435,000</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Financial Metrics</h3>
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">Unit Economics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">CAC (Customer Acquisition Cost)</span>
              <span className="font-medium text-gray-900">$150</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LTV (Lifetime Value)</span>
              <span className="font-medium text-gray-900">$2,400</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">LTV:CAC Ratio</span>
              <span className="font-medium text-green-600">16:1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payback Period</span>
              <span className="font-medium text-gray-900">~1 month</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">SaaS Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Margin</span>
              <span className="font-medium text-gray-900">85%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Churn</span>
              <span className="font-medium text-gray-900">5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Net Revenue Retention</span>
              <span className="font-medium text-gray-900">105%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Magic Number</span>
              <span className="font-medium text-gray-900">0.8</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Requirements</h3>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Pre-Seed Round</p>
              <p className="text-sm text-gray-600">Q2 2026 - Pilot launch & initial traction</p>
            </div>
            <p className="text-xl font-bold text-amber-600">$500K</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Seed Round</p>
              <p className="text-sm text-gray-600">Q1 2027 - Scale to 10+ cities</p>
            </div>
            <p className="text-xl font-bold text-gray-600">$2-3M</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Series A</p>
              <p className="text-sm text-gray-600">2028 - US & Canada expansion</p>
            </div>
            <p className="text-xl font-bold text-gray-600">$10-15M</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

// Main Business Plan Page
export default function BusinessPlanPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white py-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                <BuzzeeIcon className="w-5 h-5" />
              </div>
              <span className="font-bold">Buzzee</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium mb-4">
            Confidential Document
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Business Plan</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Comprehensive business strategy for Buzzee - The Real-Time Deal Discovery Platform
          </p>
          <p className="text-gray-400 mt-4">Last Updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <TableOfContents />

        {/* Sections 1-4 */}
        <BusinessOverview />
        <CustomerProfile />
        <BusinessGoals />
        <ProductsServices />

        {/* Sections 5-8 */}
        <PricingStructure />
        <DevelopmentStage />
        <ResearchDevelopment />
        <ProductionProcess />

        {/* Sections 9-12 */}
        <MarketAnalysis />
        <CompetitiveAnalysis />
        <CompetitiveAdvantages />
        <GrowthStrategy />

        {/* Sections 13-17 */}
        <CustomerCommunications />
        <SalesStrategy />
        <CurrentFinancials />
        <ProspectiveFinancials />
        <FinancialStatements />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Buzzee. All rights reserved. This document is confidential.
          </p>
        </div>
      </footer>
    </div>
  );
}
