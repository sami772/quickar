/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { User, Bell, Shield, Smartphone, HelpCircle, LogOut, ChevronRight, Store, Truck } from 'lucide-react';
import { UserRole } from '../../types';

interface SettingsProps {
  role: UserRole;
  onLogout: () => void;
}

export default function Settings({ role, onLogout }: SettingsProps) {
  const sections = [
    {
      title: 'Profile',
      items: [
        { icon: role === 'vendor' ? Store : Truck, label: role === 'vendor' ? 'Store Details' : 'Rider Info', value: role === 'vendor' ? 'Quickar Fresh Store' : 'Active Partner' },
        { icon: User, label: 'Account Information', value: 'samiranaskp786@gmail.com' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: 'Enabled' },
        { icon: Smartphone, label: 'App Settings', value: 'v1.0.4' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Shield, label: 'Privacy Policy' },
        { icon: HelpCircle, label: 'Support Center' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <div className="bg-primary pt-12 pb-8 px-6 rounded-b-[40px] shadow-lg shadow-primary/10 mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-accent/20">
            {role === 'vendor' ? 'S' : 'R'}
          </div>
          <div className="text-white">
            <h2 className="text-xl font-poppins font-bold">Samir Partner</h2>
            <p className="text-white/60 text-sm italic">{role === 'vendor' ? 'Elite Merchant' : 'Verified Rider'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary mb-4 px-2">{section.title}</h3>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              {section.items.map((item, idx) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    idx !== section.items.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-secondary text-primary">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold">{item.label}</div>
                      {item.value && <div className="text-[10px] text-text-secondary">{item.value}</div>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 p-5 bg-red-50 text-red-600 rounded-3xl font-bold border border-red-100 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Close Application Context</span>
        </button>
      </div>
    </div>
  );
}
