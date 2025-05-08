import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, GitCompare as Compare, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // adjust path as needed
// adjust the path accordingly

interface UserSettings {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function Settings() {
  const { user } = useAuth();

  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    name: 'John Doe',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: settings.email })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Account deleted successfully.');
        navigate('/login');
      } else {
        alert(data.message || 'Failed to delete account.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    }
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (settings.newPassword !== settings.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    try {
      console.log("your email : ", settings.email);
      const response = await fetch('http://localhost:5000/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: settings.email,
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password updated successfully!');
        navigate('/');
      } else {
        alert(data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    }
  };


  const updateSettings = (field: keyof UserSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compare className="h-8 w-8 text-blue-500" />
              <h1 className="text-2xl font-bold">Profile Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSave}>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

              <div className="space-y-4">


                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>YOUR EMAIL</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings('email', e.target.value)}
                    className="w-full bg-gray-900 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Change Password</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Current Password</span>
                    </div>
                  </label>
                  <input
                    type="password"
                    value={settings.currentPassword}
                    onChange={(e) => updateSettings('currentPassword', e.target.value)}
                    className="w-full bg-gray-900 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>New Password</span>
                    </div>
                  </label>
                  <input
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => updateSettings('newPassword', e.target.value)}
                    className="w-full bg-gray-900 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Confirm New Password</span>
                    </div>
                  </label>
                  <input
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => updateSettings('confirmPassword', e.target.value)}
                    className="w-full bg-gray-900 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between space-x-4 mt-6">
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Delete account</span>
              </button>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}

export default Settings;