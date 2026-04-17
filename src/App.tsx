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
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Store, ClipboardList, Map, History, Settings, UserPlus } from 'lucide-react';
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
        </div>
      </div>
    );
  }

  const navItems = {
    vendor: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory', icon: Store },
      { id: 'orders', label: 'Orders', icon: ClipboardList },
      { id: 'settings', label: 'Store Settings', icon: Settings },
    ],
    rider: [
      { id: 'dashboard', label: 'Earnings', icon: LayoutDashboard },
      { id: 'delivery', label: 'Active Delivery', icon: Map },
      { id: 'history', label: 'History', icon: History },
      { id: 'settings', label: 'Profile', icon: Settings },
    ]
  };

  const renderContent = () => {
    if (role === 'vendor') {
      switch (activeTab) {
        case 'dashboard': return <VendorDashboard />;
        case 'inventory': return <ProductManager />;
        default: return <VendorDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <RiderDashboard />;
        default: return <RiderDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-secondary pb-20 md:pb-0">
      <Header 
        role={role} 
        onRoleSwitch={() => setRole(role === 'vendor' ? 'rider' : 'vendor')} 
        onLogout={handleLogout}
      />
      
      <div className="flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-64px)] bg-white border-r border-gray-100 p-4 sticky top-16">
          <nav className="space-y-2 flex-1">
            {navItems[role].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-text-secondary hover:bg-secondary hover:text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 bg-primary/5 rounded-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-1">Status</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold">Active & Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + role}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation Rail */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems[role].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${
              activeTab === item.id ? 'text-accent' : 'text-text-secondary'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
