import React from 'react';
import { Settings, Bell, Shield, Heart, Clock, MapPin, Phone, Mail, ChevronRight, Award, LogOut, User, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfilePageProps {
  onLogout: () => void;
  onOpenFriends: () => void;
}

export function ProfilePage({ onLogout, onOpenFriends }: ProfilePageProps) {
  const { user } = useAuth();
  const displayName = user?.displayName || 'User';
  const emailAddress = user?.email || 'user@example.com';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const userStats = [
    { icon: Heart, label: 'Lives Saved', value: '5' },
    { icon: Clock, label: 'Response Time', value: '3m' },
    { icon: Award, label: 'Rank', value: 'Gold' }
  ];

  const menuItems = [
    { icon: Bell, label: 'Notifications', badge: '3' },
    { icon: Shield, label: 'Emergency Contacts', badge: '4' },
    { icon: MapPin, label: 'Saved Locations', badge: '2' },
    { icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Header with gradient and top Friends button */}
      <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Profile</h1>
            <p className="text-red-100 text-sm">Manage your information</p>
          </div>
          <button
            onClick={onOpenFriends}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors backdrop-blur px-3 py-2 rounded-lg"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Friends</span>
          </button>
        </div>

        <div className="flex items-center mt-6">
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white flex items-center justify-center">
            <span className="text-2xl font-bold">{initials}</span>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <p className="text-red-100">{emailAddress}</p>
            <span className="inline-block mt-1 px-2 py-1 bg-white/20 text-white text-xs rounded-full">
              Active Volunteer
            </span>
          </div>
        </div>
      </div>

      {/* Contact card */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <div className="space-y-2">
            <div className="flex items-center text-gray-700">
              <Phone className="w-4 h-4 mr-2 text-red-500" />
              <span>+1 234 567 8900</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Mail className="w-4 h-4 mr-2 text-red-500" />
              <span>{emailAddress}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {userStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-2xl text-center shadow-sm border">
            <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-red-50 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Certifications</h2>
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">First Aid Certified</h3>
              <p className="text-sm text-gray-600">Valid until Dec 2025</p>
            </div>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">CPR Specialist</h3>
              <p className="text-sm text-gray-600">Valid until Nov 2025</p>
            </div>
            <Award className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow border">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 text-red-500" />
                <span className="ml-3">{item.label}</span>
              </div>
              <div className="flex items-center">
                {item.badge && (
                  <span className="mr-2 bg-red-50 text-red-600 px-2 py-1 rounded-full text-xs">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <button 
          onClick={onLogout}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-medium shadow-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}