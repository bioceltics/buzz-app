import {
  Zap,
  Bell,
  QrCode,
  Clock,
  TrendingUp,
  BarChart3,
  ChevronRight,
  Apple,
  Play,
  Menu,
  X,
  Check,
  Timer,
  Radio,
} from 'lucide-react';
import { useState } from 'react';

// Navigation Component
function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-gradient">Buzz</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              How It Works
            </a>
            <a href="#for-venues" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              For Venues
            </a>
            <a href="#download" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Download
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://dashboard.buzz.app/login"
              className="text-gray-700 font-semibold hover:text-primary-600 transition-colors"
            >
              Venue Login
            </a>
            <a
              href="#download"
              className="px-5 py-2.5 bg-gradient-primary text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Get the App
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 font-medium py-2">Features</a>
              <a href="#how-it-works" className="text-gray-600 font-medium py-2">How It Works</a>
              <a href="#for-venues" className="text-gray-600 font-medium py-2">For Venues</a>
              <a href="#download" className="text-gray-600 font-medium py-2">Download</a>
              <a href="https://dashboard.buzz.app/login" className="text-primary-600 font-semibold py-2">
                Venue Login
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-primary-50 via-white to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 font-medium text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
              </span>
              Live deals happening now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Catch{' '}
              <span className="text-gradient">Live Deals</span>{' '}
              Before They're Gone
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              Real-time, time-limited offers from bars, restaurants, and clubs near you. Deals go live daily and expire fast — be there when it happens.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-xl"
              >
                <Apple className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-xl"
              >
                <Play className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8">
              <div>
                <div className="text-2xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-500">Live Deals Daily</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500">Partner Venues</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900">2-4 hrs</div>
                <div className="text-sm text-gray-500">Avg. Deal Duration</div>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-72 h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl animate-float">
                <div className="w-full h-full bg-gradient-to-b from-primary-50 to-white rounded-[2.5rem] overflow-hidden">
                  {/* App Header */}
                  <div className="p-4 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                      <span className="font-bold text-gradient">Buzz</span>
                      <span className="ml-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-semibold rounded">
                        BETA
                      </span>
                    </div>
                  </div>
                  {/* Mock Deal Cards */}
                  <div className="p-4 space-y-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 border-l-4 border-l-green-500">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">2-for-1 Cocktails</div>
                          <div className="text-xs text-gray-500">The Velvet Lounge</div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                              LIVE NOW
                            </span>
                            <span className="text-[10px] text-gray-400">Ends 8PM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-200 border-l-4 border-l-green-500">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">50% Off Appetizers</div>
                          <div className="text-xs text-gray-500">Urban Kitchen</div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                              LIVE NOW
                            </span>
                            <span className="text-[10px] text-red-500 font-medium">1hr left!</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">Free Entry + Drink</div>
                          <div className="text-xs text-gray-500">Club Neon</div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full">
                              STARTS 9PM
                            </span>
                            <span className="text-[10px] text-gray-400">Today only</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-8 w-20 h-20 bg-primary-500 rounded-2xl opacity-20 animate-pulse-slow" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary-500 rounded-full opacity-20 animate-pulse-slow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Radio,
      title: 'Live Deal Feed',
      description: 'See deals as they go live. Our real-time feed shows you what\'s happening right now at venues nearby.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Timer,
      title: 'Time-Limited Offers',
      description: 'Every deal has an expiration. Catch happy hours, lunch specials, and flash deals before time runs out.',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Bell,
      title: 'Go-Live Alerts',
      description: 'Get notified the moment your favorite venues drop a new deal. Be first in line, every time.',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: QrCode,
      title: 'Instant Redemption',
      description: 'Show your QR code, get your deal. No coupons to clip, no codes to remember.',
      color: 'from-primary-500 to-secondary-500',
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Deals That Are{' '}
            <span className="text-gradient">Actually Live</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No expired coupons. No "while supplies last" disappointments. Just real deals happening right now at venues near you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Venues Post Daily Deals',
      description: 'Local bars, restaurants, and clubs create time-limited offers — happy hours, lunch specials, flash deals.',
      color: 'from-primary-500 to-secondary-500',
    },
    {
      number: '02',
      title: 'Deals Go Live',
      description: 'When a deal starts, it appears in your feed instantly. You see exactly when it ends.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      number: '03',
      title: 'You Show Up & Save',
      description: 'Head to the venue, show your QR code, and enjoy the deal before it expires.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How{' '}
            <span className="text-gradient">Live Deals</span>{' '}
            Work
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            It's simple: deals are posted daily, they're live for a limited time, and when they're gone — they're gone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
              )}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Example Timeline */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-lg max-w-3xl mx-auto">
          <h4 className="font-semibold text-gray-900 mb-6 text-center">Example: A Typical Day on Buzz</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-500 w-20">11:30 AM</div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">Urban Kitchen</span> posts "50% Off Lunch" — <span className="text-green-600 font-medium">Live until 2PM</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-500 w-20">4:00 PM</div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">The Velvet Lounge</span> posts "2-for-1 Cocktails" — <span className="text-green-600 font-medium">Live until 7PM</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-sm font-semibold text-gray-500 w-20">8:00 PM</div>
              <div className="flex-1">
                <span className="font-medium text-gray-900">Club Neon</span> posts "Free Entry + First Drink" — <span className="text-green-600 font-medium">Live until 11PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// For Venues Section
function ForVenuesSection() {
  const benefits = [
    {
      icon: Zap,
      title: 'Go Live Instantly',
      description: 'Create a deal in seconds. Set your start time, end time, and it goes live automatically.',
    },
    {
      icon: Timer,
      title: 'Set Daily Limits',
      description: 'Control exactly how many redemptions per deal. 50 spots? 100? You decide. When they\'re gone, they\'re gone.',
    },
    {
      icon: Clock,
      title: 'Full Schedule Control',
      description: 'Set precise start and end times. Pause or stop any deal instantly whenever you need to.',
    },
    {
      icon: BarChart3,
      title: 'Track Everything',
      description: 'See views, saves, and redemptions in real-time. Know exactly how your deals perform.',
    },
  ];

  const pricingFeatures = [
    'Unlimited daily deals',
    'Set redemption limits per deal',
    'Schedule start & end times',
    'Pause or stop deals anytime',
    'Real-time analytics dashboard',
    'QR code verification',
  ];

  return (
    <section id="for-venues" className="py-20 px-4 bg-gradient-dark text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-primary-300 font-medium text-sm mb-6">
              <TrendingUp className="w-4 h-4" />
              For Venue Owners
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Fill Seats with{' '}
              <span className="text-gradient">Live Deals</span>
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Slow night? Launch a deal and drive traffic instantly. Buzz lets you create time-limited offers that bring customers through the door — today, not someday.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://dashboard.buzz.app/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Right Content - Pricing Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-sm font-medium rounded-full mb-4">
                Most Popular
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Buzz Pro</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$49</span>
                <span className="text-gray-400">/month</span>
              </div>
              <p className="text-gray-400 mt-2">per venue location</p>
            </div>

            <ul className="space-y-4 mb-8">
              {pricingFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="https://dashboard.buzz.app/register"
              className="block w-full py-4 bg-white text-gray-900 font-semibold rounded-2xl text-center hover:bg-gray-100 transition-colors"
            >
              Start 14-Day Free Trial
            </a>
            <p className="text-center text-sm text-gray-500 mt-4">No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Download Section
function DownloadSection() {
  return (
    <section id="download" className="py-20 px-4 bg-gradient-to-b from-white to-primary-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Don't Miss Today's Deals
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          New deals go live every day. Download Buzz and start catching live offers at venues near you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-xl"
          >
            <Apple className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs text-gray-400">Download on the</div>
              <div className="text-xl font-semibold">App Store</div>
            </div>
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-xl"
          >
            <Play className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs text-gray-400">Get it on</div>
              <div className="text-xl font-semibold">Google Play</div>
            </div>
          </a>
        </div>

        {/* QR Code */}
        <div className="inline-block p-6 bg-white rounded-3xl shadow-xl">
          <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <QrCode className="w-24 h-24 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Scan to download</p>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 px-4 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold">Buzz</span>
            </div>
            <p className="text-gray-400 text-sm">
              Catch live deals at local venues. Daily, time-limited offers from bars, restaurants, and clubs near you.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#for-venues" className="hover:text-white transition-colors">For Venues</a></li>
              <li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Buzz. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main App
function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ForVenuesSection />
      <DownloadSection />
      <Footer />
    </div>
  );
}

export default App;
