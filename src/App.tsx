/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserRole } from './types';
import Header from './components/layout/Header';
import RoleSelector from './components/shared/RoleSelector';
import VendorDashboard from './components/vendor/Dashboard';
import ProductManager from './components/vendor/ProductManager';
import RiderDashboard from './components/rider/Dashboard';
import SettingsScreen from './components/shared/Settings';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Store, ClipboardList, Map, History, Settings, UserPlus, Plus } from 'lucide-react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Helper to get or create a persistent local ID for the "No Login" experience
const getLocalId = () => {
  let id = localStorage.getItem('quickar_partner_id');
  if (!id) {
    id = 'partner_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('quickar_partner_id', id);
  }
  return id;
};

export default function App() {
  const [partnerId] = useState(getLocalId());
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if we have a saved role/session locally
    const savedRole = localStorage.getItem('quickar_partner_role') as UserRole;
    if (savedRole) {
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const handleRegistration = async (selectedRole: UserRole) => {
    setRole(selectedRole);
    localStorage.setItem('quickar_partner_role', selectedRole);
    
    // Save minimal "profile" to firestore so the partner can be found by others
    try {
      await setDoc(doc(db, 'users', partnerId), {
        uid: partnerId,
        role: selectedRole,
        isRegistered: true,
        displayName: selectedRole === 'vendor' ? 'My Local Store' : 'Rider Partner',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error registering partner:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('quickar_partner_role');
    setRole(null);
    setActiveTab('dashboard');
  };

  const [showInstallTip, setShowInstallTip] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isMobile && !isStandalone) {
      setShowInstallTip(true);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-primary">
        <div className="pt-20 px-4 text-center text-white">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-accent w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-accent/40"
          >
            <span className="font-poppins font-bold text-5xl">Q</span>
          </motion.div>
          
          <h1 className="text-4xl font-poppins font-bold mb-4">Quickar Partner</h1>
          <p className="text-white/60 mb-12 max-w-xs mx-auto text-lg leading-relaxed">Join the fastest delivery network in Pakistan.</p>
          
          <div className="max-w-md mx-auto space-y-4">
            <button 
              onClick={() => handleRegistration('vendor')}
              className="w-full bg-white text-primary p-5 rounded-2xl font-bold flex items-center justify-between group hover:bg-accent hover:text-white transition-all shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary/5 p-3 rounded-xl group-hover:bg-white/20">
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-lg">Vendor Registration</div>
                  <div className="text-xs opacity-60 font-medium uppercase tracking-widest">Register Store</div>
                </div>
              </div>
              <UserPlus className="w-6 h-6 opacity-40" />
            </button>

            <button 
              onClick={() => handleRegistration('rider')}
              className="w-full bg-white/10 border border-white/20 text-white p-5 rounded-2xl font-bold flex items-center justify-between group hover:bg-white hover:text-primary transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-xl group-hover:bg-primary/5">
                  <Map className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-lg">Rider Registration</div>
                  <div className="text-xs opacity-60 font-medium uppercase tracking-widest">Register Delivery</div>
                </div>
              </div>
              <UserPlus className="w-6 h-6 opacity-40" />
            </button>
          </div>
          
          <p className="fixed bottom-12 left-0 right-0 text-[10px] text-white/40 uppercase tracking-widest font-bold">"Delivered Before You Blink"</p>

          {showInstallTip && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-4 left-4 right-4 bg-white text-primary p-4 rounded-2xl shadow-2xl border border-accent/20 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-accent p-2 rounded-lg text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold">Install Quickar App</div>
                  <div className="text-[10px] opacity-70">Add to home screen for native experience</div>
                </div>
              </div>
              <button 
                onClick={() => setShowInstallTip(false)}
                className="text-primary/40 hover:text-primary"
              >
                <Settings className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  const navItems = {
    vendor: [
      { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { id: 'inventory', label: 'Stock', icon: Store },
      { id: 'orders', label: 'Orders', icon: ClipboardList },
      { id: 'settings', label: 'Profile', icon: Settings },
    ],
    rider: [
      { id: 'dashboard', label: 'Earn', icon: LayoutDashboard },
      { id: 'delivery', label: 'Live', icon: Map },
      { id: 'history', label: 'Log', icon: History },
      { id: 'settings', label: 'User', icon: Settings },
    ]
  };

  const renderContent = () => {
    if (role === 'vendor') {
      switch (activeTab) {
        case 'dashboard': return <VendorDashboard />;
        case 'inventory': return <ProductManager />;
        case 'settings': return <SettingsScreen role={role} onLogout={handleLogout} />;
        default: return <VendorDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <RiderDashboard />;
        case 'settings': return <SettingsScreen role={role} onLogout={handleLogout} />;
        default: return <RiderDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary overflow-x-hidden">
      {/* Mobile Header Shell */}
      {activeTab !== 'settings' && (
        <Header 
          role={role} 
          onRoleSwitch={() => setRole(role === 'vendor' ? 'rider' : 'vendor')} 
          onLogout={handleLogout}
        />
      )}
      
      {/* Mobile-First Main View */}
      <main className={`min-h-screen ${activeTab === 'settings' ? '' : 'pb-24 pt-4'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating App Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center p-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-20 px-6">
        {navItems[role].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all relative ${
              activeTab === item.id ? 'text-accent' : 'text-text-secondary opacity-50'
            }`}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-accent/10 rounded-2xl -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'scale-110' : ''} transition-transform`} />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
