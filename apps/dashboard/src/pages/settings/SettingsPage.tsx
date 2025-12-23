import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Clock, Image, Bell, CreditCard, Save, Upload, Check, Crown } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DEFAULT_HOURS = DAYS_OF_WEEK.reduce((acc, day) => ({
  ...acc,
  [day]: { isOpen: true, openTime: '09:00', closeTime: '17:00' }
}), {} as Record<string, { isOpen: boolean; openTime: string; closeTime: string }>);

interface ProfileFormData {
  name: string;
  type: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  website: string;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { venue, isLoading, updateVenueProfile, updateOperatingHours, updateNotificationPreferences } = useSettings();

  // Operating Hours state
  const [hours, setHours] = useState(DEFAULT_HOURS);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    newMessages: true,
    dealRedemptions: true,
    weeklyReport: false,
  });

  // Profile form
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      type: 'restaurant',
      description: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      phone: '',
      website: '',
    }
  });

  // Load venue data into form
  useEffect(() => {
    if (venue) {
      reset({
        name: venue.name || '',
        type: venue.type || 'restaurant',
        description: venue.description || '',
        address: venue.address || '',
        city: venue.city || '',
        province: venue.province || '',
        postal_code: venue.postal_code || '',
        phone: venue.phone || '',
        website: venue.website || '',
      });

      // Load operating hours if available
      if (venue.hours) {
        setHours(venue.hours);
      }
    }
  }, [venue, reset]);

  const tabs = [
    { id: 'profile', name: 'Venue Profile', icon: Building2 },
    { id: 'hours', name: 'Operating Hours', icon: Clock },
    { id: 'media', name: 'Photos & Media', icon: Image },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  const onSubmitProfile = async (data: ProfileFormData) => {
    const success = await updateVenueProfile(data);
    if (success) {
      reset(data);
    }
  };

  const handleSaveHours = async () => {
    await updateOperatingHours(hours);
  };

  const handleSaveNotifications = async () => {
    await updateNotificationPreferences(notifications);
  };

  const toggleDay = (day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen }
    }));
  };

  const updateTime = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your venue settings and preferences</p>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar - Desktop Only */}
        <div className="hidden lg:block w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Venue Profile</h3>
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4">
                <div>
                  <label className="label">Venue Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your venue name"
                    {...register('name', { required: true })}
                  />
                </div>
                <div>
                  <label className="label">Venue Type</label>
                  <select className="input" {...register('type')}>
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="club">Club</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Cafe</option>
                  </select>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-[100px]"
                    placeholder="Describe your venue..."
                    {...register('description')}
                  />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Street address"
                    {...register('address')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="City"
                      {...register('city')}
                    />
                  </div>
                  <div>
                    <label className="label">Province/State</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Province"
                      {...register('province')}
                    />
                  </div>
                  <div>
                    <label className="label">Postal Code</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Postal code"
                      {...register('postal_code')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      placeholder="+1 (555) 000-0000"
                      {...register('phone')}
                    />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      type="url"
                      className="input"
                      placeholder="https://..."
                      {...register('website')}
                    />
                  </div>
                </div>
                <div className="pt-4 flex items-center gap-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || !isDirty}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  {!isDirty && venue && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      All changes saved
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Operating Hours Tab */}
          {activeTab === 'hours' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Operating Hours</h3>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between sm:w-32">
                      <span className="font-medium text-gray-900 capitalize">{day}</span>
                      <button
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`sm:hidden px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          hours[day]?.isOpen
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {hours[day]?.isOpen ? 'Open' : 'Closed'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`hidden sm:block px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        hours[day]?.isOpen
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {hours[day]?.isOpen ? 'Open' : 'Closed'}
                    </button>
                    {hours[day]?.isOpen && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={hours[day]?.openTime || '09:00'}
                          onChange={(e) => updateTime(day, 'openTime', e.target.value)}
                          className="input w-28 sm:w-32 text-sm"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="time"
                          value={hours[day]?.closeTime || '17:00'}
                          onChange={(e) => updateTime(day, 'closeTime', e.target.value)}
                          className="input w-28 sm:w-32 text-sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={handleSaveHours}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Hours'}
                </button>
              </div>
            </div>
          )}

          {/* Photos & Media Tab */}
          {activeTab === 'media' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Photos & Media</h3>

              {/* Logo Upload */}
              <div className="mb-8">
                <label className="label">Venue Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {venue?.logo_url ? (
                      <img src={venue.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <button className="btn btn-outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="mb-8">
                <label className="label">Cover Image</label>
                <div className="w-full h-48 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden mb-3">
                  {venue?.cover_image_url ? (
                    <img src={venue.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="btn btn-outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Cover Image
                </button>
                <p className="text-sm text-gray-500 mt-2">Recommended size: 1200x400px</p>
              </div>

              {/* Gallery */}
              <div>
                <label className="label">Gallery Images</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-3">
                  {venue?.images?.map((img: string, idx: number) => (
                    <div key={idx} className="aspect-square rounded-lg bg-gray-100 overflow-hidden">
                      <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Add up to 10 images to showcase your venue</p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                  { key: 'newMessages', label: 'New Messages', desc: 'Get notified when customers message you' },
                  { key: 'dealRedemptions', label: 'Deal Redemptions', desc: 'Alerts when deals are redeemed' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly performance summary' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications]
                          ? 'bg-primary-500'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          notifications[item.key as keyof typeof notifications]
                            ? 'left-6'
                            : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={handleSaveNotifications}
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h3>

              {/* Current Plan Display */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current Plan</p>
                    <p className="text-2xl font-bold text-gray-900">{venue?.subscription_tier || 'Starter'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {venue?.subscription_tier === 'pro'
                        ? 'Full access to all features'
                        : venue?.subscription_tier === 'enterprise'
                        ? 'Custom enterprise solution'
                        : 'For small venues testing the platform'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Pricing Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {/* Starter Plan */}
                <div className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                  <h4 className="text-lg font-semibold text-gray-900">Starter</h4>
                  <p className="text-sm text-gray-500 mt-1">For small venues testing the platform</p>
                  <p className="text-3xl font-bold text-gray-900 mt-4">
                    $49.99<span className="text-lg font-normal text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Up to 10 deals/month
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Basic analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Email support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      1 user account
                    </li>
                  </ul>
                  <button className="btn btn-outline w-full mt-6">
                    Current Plan
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="border-2 border-purple-500 rounded-xl p-6 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-500" />
                    <h4 className="text-lg font-semibold text-gray-900">Pro</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">For active venues maximizing traffic</p>
                  <p className="text-3xl font-bold text-gray-900 mt-4">
                    $99.99<span className="text-lg font-normal text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Unlimited deals
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Advanced analytics & AI insights
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Up to 5 user accounts
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Custom branding
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Featured placement
                    </li>
                  </ul>
                  <button className="btn btn-primary w-full mt-6">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-700" />
                    <h4 className="text-lg font-semibold text-gray-900">Enterprise</h4>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">For chains and large groups</p>
                  <p className="text-3xl font-bold text-gray-900 mt-4">
                    Custom
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Multi-location management
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      API access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Dedicated account manager
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      Custom integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      SLA guarantees
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      White-label options
                    </li>
                  </ul>
                  <button className="btn btn-outline w-full mt-6">
                    Contact Sales
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Questions about billing? <a href="#" className="text-purple-600 hover:underline">Contact support</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
