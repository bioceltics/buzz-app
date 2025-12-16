import { useState } from 'react';
import { Building2, Clock, Image, Bell, CreditCard } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Venue Profile', icon: Building2 },
    { id: 'hours', name: 'Operating Hours', icon: Clock },
    { id: 'media', name: 'Photos & Media', icon: Image },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your venue settings and preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 shrink-0">
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
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Venue Profile</h3>
              <form className="space-y-4">
                <div>
                  <label className="label">Venue Name</label>
                  <input type="text" className="input" placeholder="Your venue name" />
                </div>
                <div>
                  <label className="label">Venue Type</label>
                  <select className="input">
                    <option value="bar">Bar</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="club">Club</option>
                    <option value="hotel">Hotel</option>
                    <option value="cafe">Cafe</option>
                  </select>
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea className="input min-h-[100px]" placeholder="Describe your venue..." />
                </div>
                <div>
                  <label className="label">Address</label>
                  <input type="text" className="input" placeholder="Street address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" className="input" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input type="url" className="input" placeholder="https://..." />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Operating Hours</h3>
              <p className="text-gray-600">Configure your operating hours here.</p>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Photos & Media</h3>
              <p className="text-gray-600">Upload and manage your venue photos.</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
              <p className="text-gray-600">Manage your notification settings.</p>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">Free</p>
              </div>
              <button className="btn btn-primary">Upgrade to Premium</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
