/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Product, OrderStatus, VendorProfile, RiderProfile, UserProfile } from './types';
import { subscribeToAvailableOrders, subscribeToRiderOrders, subscribeToRiderProfile, getOrCreateRiderProfile, subscribeToUserProfile, registerUserRole } from './services/firestore';
import { getPartnerId, getUserEmail } from './firebase';
import Header from './components/layout/Header';
import RoleSelector from './components/shared/RoleSelector';
import VendorDashboard from './components/vendor/Dashboard';
import ProductManager from './components/vendor/ProductManager';
import RiderDashboard from './components/rider/Dashboard';
import SettingsScreen from './components/shared/Settings';
import { AnimatePresence, motion } from 'motion/react';
import { LayoutDashboard, Store, ClipboardList, Map, History, Settings, UserPlus, Plus } from 'lucide-react';

export default function App() {
  const [partnerId] = useState(getPartnerId());
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check if we have a saved role locally
    const savedRole = localStorage.getItem('quickar_partner_role') as UserRole;
    if (savedRole) {
      setRole(savedRole);
    }
    
    // Subscribe to multi-role profile
    const unsub = subscribeToUserProfile(partnerId, (profile) => {
      setUserProfile(profile);
      setLoading(false);
      
      // If we have a profile but no active role set, pick the first one
      if (profile && !role && profile.roles.length > 0) {
        setRole(profile.roles[0]);
        localStorage.setItem('quickar_partner_role', profile.roles[0]);
      }
    });

    return () => unsub();
  }, [partnerId]);

  const handleRegistration = async (selectedRole: UserRole) => {
    await registerUserRole(partnerId, selectedRole);
    setRole(selectedRole);
    localStorage.setItem('quickar_partner_role', selectedRole);
  };

  const handleSwitchRole = (targetRole: UserRole) => {
    setRole(targetRole);
    localStorage.setItem('quickar_partner_role', targetRole);
    setActiveTab('dashboard');
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
    if (!role) {
      return (
        <div className="h-full bg-primary flex flex-col pt-20 px-6 text-center text-white">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-accent w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-accent/40"
          >
            <span className="font-poppins font-bold text-4xl">Q</span>
          </motion.div>
          
          <h1 className="text-3xl font-poppins font-bold mb-2">Partner Hub</h1>
          <p className="text-white/40 mb-12 text-sm font-medium uppercase tracking-[0.2em]">Pakistan's Delivery Engine</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleRegistration('vendor')}
              className="w-full bg-white text-primary p-5 rounded-3xl font-bold flex items-center justify-between active:scale-95 transition-all shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary/5 p-3 rounded-2xl">
                  <Store className="w-6 h-6" />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-base">Merchant</div>
                  <div className="text-[9px] opacity-40 uppercase tracking-widest font-bold mt-0.5">Manage Store</div>
                </div>
              </div>
              <UserPlus className="w-5 h-5 opacity-20" />
            </button>

            <button 
              onClick={() => handleRegistration('rider')}
              className="w-full bg-white/5 border border-white/10 text-white p-5 rounded-3xl font-bold flex items-center justify-between active:scale-95 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <Map className="w-6 h-6" />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-base">Delivery Rider</div>
                  <div className="text-[9px] opacity-40 uppercase tracking-widest font-bold mt-0.5">Earn on Road</div>
                </div>
              </div>
              <UserPlus className="w-5 h-5 opacity-20" />
            </button>
          </div>
          
          <div className="mt-auto pb-12">
            <p className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-bold italic font-poppins">Delivered Before You Blink</p>
          </div>

          {showInstallTip && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="mb-8 bg-white text-primary p-4 rounded-3xl shadow-2xl border border-accent/20 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-accent p-2.5 rounded-2xl text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Native Experience</div>
                  <div className="text-[9px] opacity-70 uppercase tracking-tight">Add to home screen</div>
                </div>
              </div>
              <button 
                onClick={() => setShowInstallTip(false)}
                className="text-primary/20 p-2"
              >
                <Settings className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      );
    }

    if (role === 'vendor') {
      switch (activeTab) {
        case 'dashboard': return <VendorDashboard onTabChange={setActiveTab} />;
        case 'inventory': return <ProductManager />;
        case 'settings': return (
          <SettingsScreen 
            role={role} 
            userProfile={userProfile}
            onLogout={handleLogout} 
            onSwitchRole={handleSwitchRole}
            onRegisterOtherRole={handleRegistration}
          />
        );
        default: return <VendorDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <RiderDashboard />;
        case 'settings': return (
          <SettingsScreen 
            role={role} 
            userProfile={userProfile}
            onLogout={handleLogout} 
            onSwitchRole={handleSwitchRole}
            onRegisterOtherRole={handleRegistration}
          />
        );
        default: return <RiderDashboard />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex justify-center p-0 md:p-6 lg:p-12 selection:bg-accent/30">
      {/* 
          The Master Native Container Shell
          Enforces the mobile-app aspect ratio (Pixel 7 / iPhone 14-ish)
      */}
      <div className="w-full max-w-[440px] bg-secondary min-h-screen md:min-h-[850px] md:h-[850px] md:rounded-[3.5rem] md:shadow-[0_0_0_12px_rgba(20,20,30,1),0_30px_60px_rgba(0,0,0,0.4),0_0_100px_rgba(242,125,38,0.1)] relative overflow-hidden flex flex-col border-0">
        
        {/* Mobile Header Shell - Only visible when logged in and not in settings */}
        {role && activeTab !== 'settings' && (
          <Header 
            role={role} 
            onRoleSwitch={() => handleSwitchRole(role === 'vendor' ? 'rider' : 'vendor')} 
            onLogout={handleLogout}
            hasBothRoles={userProfile?.roles.length === 2}
          />
        )}
        
        {/* Mobile-First Main View Viewport */}
        <main 
          className={`flex-1 overflow-y-auto scrollbar-hide bg-secondary relative ${
            role && activeTab !== 'settings' ? 'pb-24' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={(activeTab || 'auth') + (role || 'none')}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating App Navigation - Only when logged in */}
        {role && (
          <nav className="absolute bottom-6 left-5 right-5 h-20 bg-white/60 backdrop-blur-3xl border border-white/40 flex justify-around items-center z-50 rounded-[2.5rem] shadow-[0_15px_35px_rgba(0,0,0,0.1)] px-4">
            {navItems[role].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-14 h-12 rounded-2xl transition-all relative ${
                  activeTab === item.id ? 'text-primary' : 'text-text-secondary opacity-30'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-accent rounded-[1.2rem] -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white scale-110' : 'scale-90'} transition-transform`} />
                {activeTab !== item.id && (
                  <span className="text-[7px] font-bold mt-1 uppercase tracking-widest">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
