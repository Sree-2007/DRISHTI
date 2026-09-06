import React, { useState } from 'react';

const Settings = () => {
  const [userProfile, setUserProfile] = useState({
    name: 'Officer Rajesh Kumar',
    email: 'rajesh.kumar@police.gov.in',
    phone: '+91 98765 43210',
    badge: 'PS5042',
    rank: 'Inspector',
    zone: 'Central Zone'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    priorityOnly: false
  });

  const [system, setSystem] = useState({
    theme: 'light',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    refreshInterval: '30'
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingNotifications, setEditingNotifications] = useState(false);
  const [editingSystem, setEditingSystem] = useState(false);

  const handleSaveProfile = () => {
    setEditingProfile(false);
    // In real app, save to backend
    alert('Profile saved successfully!');
  };

  const handleSaveNotifications = () => {
    setEditingNotifications(false);
    // In real app, save to backend
    alert('Notification settings saved successfully!');
  };

  const handleSaveSystem = () => {
    setEditingSystem(false);
    // In real app, save to backend
    alert('System settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
        <p className="text-gray-600 mb-4">Configure your profile, notifications, and system preferences.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Profile</h3>
              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({...prev, email: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img className="h-12 w-12 rounded-full" src="https://via.placeholder.com/40" alt="Profile" />
                    <div>
                      <h3 className="font-medium text-gray-800">{userProfile.name}</h3>
                      <p className="text-sm text-gray-600">{userProfile.badge} | {userProfile.rank}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500"><strong>Email:</strong> {userProfile.email}</p>
                    <p className="text-sm text-gray-500"><strong>Phone:</strong> {userProfile.phone}</p>
                    <p className="text-sm text-gray-500"><strong>Zone:</strong> {userProfile.zone}</p>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">Notifications</h3>
              {editingNotifications ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.emailAlerts}
                      onChange={(e) => setNotifications(prev => ({...prev, emailAlerts: e.target.checked}))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">Email Alerts</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.smsAlerts}
                      onChange={(e) => setNotifications(prev => ({...prev, smsAlerts: e.target.checked}))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">SMS Alerts</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.pushNotifications}
                      onChange={(e) => setNotifications(prev => ({...prev, pushNotifications: e.target.checked}))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">Push Notifications</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifications.priorityOnly}
                      onChange={(e) => setNotifications(prev => ({...prev, priorityOnly: e.target.checked}))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">Priority Only (High/Medium severity)</label>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setEditingNotifications(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotifications}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className={`h-4 w-4 ${notifications.emailAlerts ? 'bg-indigo-600' : 'bg-gray-300'} rounded`} />
                    <span className="ml-2 text-sm font-medium text-gray-700">Email Alerts</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`h-4 w-4 ${notifications.smsAlerts ? 'bg-indigo-600' : 'bg-gray-300'} rounded`} />
                    <span className="ml-2 text-sm font-medium text-gray-700">SMS Alerts</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`h-4 w-4 ${notifications.pushNotifications ? 'bg-indigo-600' : 'bg-gray-300'} rounded`} />
                    <span className="ml-2 text-sm font-medium text-gray-700">Push Notifications</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`h-4 w-4 ${notifications.priorityOnly ? 'bg-indigo-600' : 'bg-gray-300'} rounded`} />
                    <span className="ml-2 text-sm font-medium text-gray-700">Priority Only</span>
                  </div>
                  <button
                    onClick={() => setEditingNotifications(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Edit Notifications
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* System Section */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">System Preferences</h3>
              {editingSystem ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <select
                      value={system.theme}
                      onChange={(e) => setSystem(prev => ({...prev, theme: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                    <select
                      value={system.language}
                      onChange={(e) => setSystem(prev => ({...prev, language: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                    <select
                      value={system.dateFormat}
                      onChange={(e) => setSystem(prev => ({...prev, dateFormat: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={system.refreshInterval}
                      onChange={(e) => setSystem(prev => ({...prev, refreshInterval: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setEditingSystem(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSystem}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Theme</span>
                    <span className="text-sm text-gray-500">{(system.theme === 'light' ? 'Light' : (system.theme === 'dark' ? 'Dark' : 'Auto'))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Language</span>
                    <span className="text-sm text-gray-500">{system.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Date Format</span>
                    <span className="text-sm text-gray-500">{system.dateFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Refresh Interval</span>
                    <span className="text-sm text-gray-500">{system.refreshInterval}s</span>
                  </div>
                  <button
                    onClick={() => setEditingSystem(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Edit System
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;