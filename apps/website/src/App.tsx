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
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Wine,
  UtensilsCrossed,
  PartyPopper,
  MapPin,
} from 'lucide-react';
import { useState } from 'react';

// Business portal URLs (subdomain)
const BUSINESS_LOGIN_URL = 'https://business.buzzee.ca/login';
const BUSINESS_REGISTER_URL = 'https://business.buzzee.ca/register';

// Custom Buzzee Logo Icon - Simple B letter
function BuzzeeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="12"
        y="17"
        fontSize="18"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        B
      </text>
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
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <BuzzeeIcon className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Buzzee</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              How It Works
            </a>
            <a href="#for-business" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              For Business
            </a>
            <a href="#download" className="text-gray-600 hover:text-primary-500 font-medium transition-colors">
              Download
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={BUSINESS_LOGIN_URL}
              className="text-gray-700 font-semibold hover:text-primary-500 transition-colors"
            >
              Business Login
            </a>
            <a
              href="#download"
              className="px-5 py-2.5 bg-primary-500 text-white font-semibold rounded-full shadow-lg shadow-primary-500/25 hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
            >
              Get the App
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-slide-up">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">How It Works</a>
              <a href="#for-business" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">For Business</a>
              <a href="#download" className="text-gray-600 font-medium py-2 hover:text-primary-500 transition-colors">Download</a>
              <a href={BUSINESS_LOGIN_URL} className="text-primary-500 font-semibold py-2">
                Business Login
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
    <section className="pt-28 pb-20 px-4 bg-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50/50 -skew-x-12 transform origin-top-right" />
      <div className="absolute top-40 right-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 font-medium text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live deals happening now
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Catch{' '}
              <span className="text-primary-500">Live Deals</span>{' '}
              Before They're Gone
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Real-time, time-limited offers from bars, restaurants, and clubs near you. Deals go live daily and expire fast — be there when it happens.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                <Apple className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
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
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900">100+</div>
                <div className="text-sm text-gray-500">Live Deals Daily</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-500">Partner Venues</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-gray-900">2-4 hrs</div>
                <div className="text-sm text-gray-500">Avg. Duration</div>
              </div>
            </div>
          </div>

          {/* Right Content - Photorealistic Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 rounded-[4rem] blur-3xl" />

              {/* Multi-layer Phone Shadow */}
              <div className="absolute inset-0 translate-x-6 translate-y-8 bg-black/30 rounded-[3.5rem] blur-3xl" />
              <div className="absolute inset-0 translate-x-3 translate-y-4 bg-black/20 rounded-[3.5rem] blur-2xl" />

              {/* Phone Frame - iPhone 15 Pro Style */}
              <div className="relative w-[280px] h-[580px] animate-float">
                {/* Titanium Frame - Enhanced with realistic metal gradient */}
                <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-gray-400 via-gray-600 to-gray-800 p-[3px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4),0_0_40px_rgba(139,92,246,0.1)]">
                  {/* Inner Frame with Brushed Metal Effect */}
                  <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-br from-gray-500 via-gray-700 to-gray-900 opacity-60" />
                  {/* Highlight edge */}
                  <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-white/20 via-transparent to-transparent" />
                </div>

                {/* Side Buttons - Left - Enhanced */}
                <div className="absolute -left-[2px] top-28 w-[3px] h-8 bg-gradient-to-b from-gray-500 to-gray-700 rounded-l-sm shadow-sm" />
                <div className="absolute -left-[2px] top-44 w-[3px] h-12 bg-gradient-to-b from-gray-500 to-gray-700 rounded-l-sm shadow-sm" />
                <div className="absolute -left-[2px] top-60 w-[3px] h-12 bg-gradient-to-b from-gray-500 to-gray-700 rounded-l-sm shadow-sm" />

                {/* Side Button - Right - Enhanced */}
                <div className="absolute -right-[2px] top-40 w-[3px] h-16 bg-gradient-to-b from-gray-500 to-gray-700 rounded-r-sm shadow-sm" />

                {/* Screen Container */}
                <div className="absolute inset-[3px] rounded-[3.2rem] bg-black overflow-hidden">
                  {/* Screen */}
                  <div className="absolute inset-[2px] rounded-[3rem] bg-gray-50 overflow-hidden">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[100px] h-[32px] bg-black rounded-full z-20 flex items-center justify-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-800 ring-1 ring-gray-700" /> {/* Camera */}
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-700" /> {/* Sensor */}
                    </div>

                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-white z-10 flex items-end justify-between px-6 pb-1">
                      <span className="text-xs font-semibold text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3C8.5 3 5.5 4.5 3.5 7L12 21l8.5-14C18.5 4.5 15.5 3 12 3z"/>
                        </svg>
                        <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2 9h3v12H2V9zm5-4h3v16H7V5zm5 8h3v8h-3v-8zm5-4h3v12h-3V9z"/>
                        </svg>
                        <div className="flex items-center">
                          <div className="w-6 h-3 rounded-sm border border-gray-900 relative">
                            <div className="absolute inset-[2px] bg-gray-900 rounded-[1px]" style={{width: '80%'}} />
                          </div>
                          <div className="w-0.5 h-1.5 bg-gray-900 rounded-r-sm" />
                        </div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="absolute inset-0 top-12 bg-gray-50">
                      {/* App Header */}
                      <div className="p-4 bg-white border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center shadow-lg shadow-primary-500/30">
                              <BuzzeeIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-900">Buzzee</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative">
                              <Bell className="w-4 h-4 text-gray-600" />
                              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Live Deals Header */}
                      <div className="px-4 pt-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">Live Deals</span>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              3 Active
                            </span>
                          </div>
                          <span className="text-xs text-primary-500 font-semibold">See All</span>
                        </div>
                      </div>

                      {/* Mock Deal Cards - Enhanced with Icons & Progress */}
                      <div className="px-4 space-y-2.5">
                        {/* Deal Card 1 - Cocktails */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg shadow-black/5 border border-white/50 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600" />
                          <div className="flex items-start gap-2.5 pl-1">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                              <Wine className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold text-gray-900">2-for-1 Cocktails</div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span>The Velvet Lounge</span>
                                <span className="text-gray-300">•</span>
                                <MapPin className="w-2.5 h-2.5" />
                                <span>0.3 mi</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded-full flex items-center gap-1">
                                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                  LIVE
                                </span>
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{width: '68%'}} />
                                </div>
                                <span className="text-[8px] text-gray-400">34/50</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-gray-400">Save</div>
                              <div className="text-sm font-bold text-green-600">$15</div>
                            </div>
                          </div>
                        </div>

                        {/* Deal Card 2 - Appetizers */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg shadow-black/5 border border-white/50 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 to-green-600" />
                          <div className="flex items-start gap-2.5 pl-1">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                              <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold text-gray-900">50% Off Appetizers</div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span>Urban Kitchen</span>
                                <span className="text-gray-300">•</span>
                                <MapPin className="w-2.5 h-2.5" />
                                <span>0.5 mi</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded-full flex items-center gap-1">
                                  <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                  LIVE
                                </span>
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{width: '70%'}} />
                                </div>
                                <span className="text-[8px] text-red-500 font-semibold">1hr left</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-gray-400">Save</div>
                              <div className="text-sm font-bold text-green-600">$12</div>
                            </div>
                          </div>
                        </div>

                        {/* Deal Card 3 - Club Entry */}
                        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg shadow-black/5 border border-white/50 relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500" />
                          <div className="flex items-start gap-2.5 pl-1">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                              <PartyPopper className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold text-gray-900">Free Entry + Drink</div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span>Club Neon</span>
                                <span className="text-gray-300">•</span>
                                <MapPin className="w-2.5 h-2.5" />
                                <span>0.8 mi</span>
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[8px] font-bold rounded-full">
                                  STARTS 9PM
                                </span>
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{width: '89%'}} />
                                </div>
                                <span className="text-[8px] text-gray-400">89/100</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[9px] text-gray-400">Save</div>
                              <div className="text-sm font-bold text-green-600">$25</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Navigation */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-6 h-6 rounded-lg bg-primary-500 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="text-[9px] font-semibold text-primary-500">Deals</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-50">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <span className="text-[9px] font-medium text-gray-400">Explore</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-50">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <span className="text-[9px] font-medium text-gray-400">Saved</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 opacity-50">
                          <div className="w-6 h-6 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-[9px] font-medium text-gray-400">Profile</span>
                        </div>
                      </div>

                      {/* Home Indicator */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full" />
                    </div>

                    {/* Enhanced Screen Reflection Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent pointer-events-none rounded-[3rem]" />
                    {/* Secondary reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[3rem]" />
                  </div>
                </div>
              </div>

              {/* Floating Notification Badge - Enhanced */}
              <div className="absolute -top-6 -right-6 px-4 py-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 border border-white/50 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/40">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Deal Claimed!</div>
                  <div className="text-base font-bold text-gray-900">$12 saved</div>
                </div>
              </div>

              {/* Secondary floating element - Enhanced */}
              <div className="absolute -bottom-4 -left-8 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-pink-500 rounded-xl shadow-xl shadow-primary-500/40 flex items-center gap-2 text-white">
                <Bell className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-semibold">New deal nearby!</span>
              </div>
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
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Timer,
      title: 'Time-Limited Offers',
      description: 'Every deal has an expiration. Catch happy hours, lunch specials, and flash deals before time runs out.',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
    {
      icon: Bell,
      title: 'Go-Live Alerts',
      description: 'Get notified the moment your favorite venues drop a new deal. Be first in line, every time.',
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: QrCode,
      title: 'Instant Redemption',
      description: 'Show your QR code, get your deal. No coupons to clip, no codes to remember.',
      color: 'bg-primary-500',
      bgColor: 'bg-primary-50',
    },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-medium text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            Why Choose Buzzee
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Deals That Are{' '}
            <span className="text-primary-500">Actually Live</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No expired coupons. No "while supplies last" disappointments. Just real deals happening right now at venues near you.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
      color: 'bg-primary-500',
    },
    {
      number: '02',
      title: 'Deals Go Live',
      description: 'When a deal starts, it appears in your feed instantly. You see exactly when it ends.',
      color: 'bg-green-500',
    },
    {
      number: '03',
      title: 'You Show Up & Save',
      description: 'Head to the venue, show your QR code, and enjoy the deal before it expires.',
      color: 'bg-amber-500',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How{' '}
            <span className="text-primary-500">Live Deals</span>{' '}
            Work
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            It's simple: deals are posted daily, they're live for a limited time, and when they're gone — they're gone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gray-200">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              )}
              <div className="text-center relative">
                <div className={`w-20 h-20 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Example Timeline */}
        <div className="bg-gray-50 rounded-3xl p-8 max-w-3xl mx-auto border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-6 text-center text-lg">A Typical Day on Buzzee</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🌮</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-400">11:30 AM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                </div>
                <span className="font-semibold text-gray-900">Urban Kitchen</span>
                <span className="text-gray-600"> posts "50% Off Lunch"</span>
                <div className="text-sm text-green-600 font-medium mt-1">Live until 2PM</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🍸</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-400">4:00 PM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                </div>
                <span className="font-semibold text-gray-900">The Velvet Lounge</span>
                <span className="text-gray-600"> posts "2-for-1 Cocktails"</span>
                <div className="text-sm text-green-600 font-medium mt-1">Live until 7PM</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
              <div className="w-16 h-16 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎵</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-400">8:00 PM</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                </div>
                <span className="font-semibold text-gray-900">Club Neon</span>
                <span className="text-gray-600"> posts "Free Entry + First Drink"</span>
                <div className="text-sm text-green-600 font-medium mt-1">Live until 11PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// For Business Section
function ForBusinessSection() {
  const benefits = [
    {
      icon: Zap,
      title: 'Go Live Instantly',
      description: 'Create a deal in seconds. Set your start time, end time, and it goes live automatically.',
    },
    {
      icon: Timer,
      title: 'Set Daily Limits',
      description: 'Control exactly how many redemptions per deal. 50 spots? 100? You decide.',
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

  return (
    <section id="for-business" className="py-24 px-4 bg-gray-900 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-primary-300 font-medium text-sm mb-6 border border-white/10">
              <TrendingUp className="w-4 h-4" />
              For Business Owners
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Fill Seats with{' '}
              <span className="text-primary-400">Live Deals</span>
            </h2>
            <p className="text-lg text-gray-300 mb-10 leading-relaxed">
              Slow night? Launch a deal and drive traffic instantly. Buzzee lets you create time-limited offers that bring customers through the door — today, not someday.
            </p>

            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500 transition-colors">
                    <benefit.icon className="w-6 h-6 text-primary-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={BUSINESS_REGISTER_URL}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary-500 text-white font-semibold rounded-full shadow-lg shadow-primary-500/25 hover:bg-primary-400 transition-all hover:shadow-xl"
            >
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          {/* Right Content - Pricing Cards */}
          <div className="space-y-6">
            {/* Starter Plan */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Starter</h3>
                  <p className="text-sm text-gray-400">For small venues testing the platform</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white">$49.99</span>
                  <span className="text-gray-400">/mo</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {['10 deals/month', 'Basic analytics', 'Email support', '1 user'].map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">{feature}</span>
                ))}
              </div>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-gradient-to-br from-primary-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-primary-500 relative">
              <div className="absolute -top-3 right-6">
                <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full">POPULAR</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  <p className="text-sm text-gray-300">For active venues maximizing traffic</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-white">$99.99</span>
                  <span className="text-gray-300">/mo</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Unlimited deals', 'AI insights', 'Priority support', '5 users', 'Custom branding'].map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-200">{feature}</span>
                ))}
              </div>
              <a
                href={BUSINESS_REGISTER_URL}
                className="block w-full py-3 bg-primary-500 text-white font-semibold rounded-xl text-center hover:bg-primary-400 transition-colors"
              >
                Start Free Trial
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Enterprise</h3>
                  <p className="text-sm text-gray-400">For chains and large groups</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">Custom</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Multi-location', 'API access', 'Dedicated manager', 'SLA'].map((feature, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">{feature}</span>
                ))}
              </div>
              <a
                href="#contact"
                className="block w-full py-3 bg-white/10 text-white font-semibold rounded-xl text-center hover:bg-white/20 transition-colors border border-white/20"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Social Proof Section
function SocialProofSection() {
  const stats = [
    { icon: Users, value: '50,000+', label: 'Active Users' },
    { icon: Zap, value: '1M+', label: 'Deals Redeemed' },
    { icon: Shield, value: '99.9%', label: 'Uptime' },
  ];

  return (
    <section className="py-16 px-4 bg-primary-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-primary-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Download Section
function DownloadSection() {
  return (
    <section id="download" className="py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Don't Miss Today's Deals
        </h2>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          New deals go live every day. Download Buzzee and start catching live offers at venues near you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <Apple className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs text-gray-400">Download on the</div>
              <div className="text-xl font-semibold">App Store</div>
            </div>
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            <Play className="w-8 h-8" />
            <div className="text-left">
              <div className="text-xs text-gray-400">Get it on</div>
              <div className="text-xl font-semibold">Google Play</div>
            </div>
          </a>
        </div>

        {/* QR Code */}
        <div className="inline-block p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="w-40 h-40 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-100">
            <QrCode className="w-24 h-24 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Scan to download</p>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-16 px-4 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-pink-400 flex items-center justify-center">
                <BuzzeeIcon className="w-7 h-7" />
              </div>
              <span className="text-2xl font-bold">Buzzee</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Catch live deals at local venues. Daily, time-limited offers from bars, restaurants, and clubs near you.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#for-business" className="hover:text-white transition-colors">For Business</a></li>
              <li><a href="#download" className="hover:text-white transition-colors">Download</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Buzzee. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
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
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ForBusinessSection />
      <SocialProofSection />
      <DownloadSection />
      <Footer />
    </div>
  );
}

export default App;
