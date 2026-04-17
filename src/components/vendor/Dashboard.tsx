/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Package, DollarSign, Clock, Plus, ExternalLink, X, MapPin, Home, Bell, CheckCircle2, Zap, Shield, TrendingUp, Info, Star } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, VendorProfile } from '../../types';
import { subscribeToVendorOrders, updateOrderStatus, createSampleOrder, subscribeToVendorProfile, upgradeVendorPlan, getOrCreateVendorProfile, toggleVendorSponsorship, getActiveSurgeMultiplier } from '../../services/firestore';
import { getPartnerId, getUserEmail } from '../../firebase';
import DeliveryMap from '../shared/DeliveryMap';

const statusColors: Record<OrderStatus, string> = {
  placed: 'bg-orange-100 text-orange-600',
  accepted: 'bg-blue-100 text-blue-600',
  picked: 'bg-purple-100 text-purple-600',
  out_for_delivery: 'bg-indigo-100 text-indigo-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function VendorDashboard({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevOrdersRef = useRef<Order[]>([]);
  const partnerId = getPartnerId();
  const email = getUserEmail() || 'vendor@example.com';

  useEffect(() => {
    // Ensure profile exists
    getOrCreateVendorProfile(partnerId, email);

    const unsubOrders = subscribeToVendorOrders(partnerId, (newOrders) => {
      // Check for delivery notifications
      newOrders.forEach(newOrder => {
        const prevOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
        if (prevOrder && prevOrder.status !== 'delivered' && newOrder.status === 'delivered') {
          setNotification(`Order #${newOrder.id.slice(-4)} Delivered!`);
          setTimeout(() => setNotification(null), 5000);
        }
      });
      prevOrdersRef.current = newOrders;
      setOrders(newOrders);
    });

    const unsubProfile = subscribeToVendorProfile(partnerId, (profile) => {
      setVendorProfile(profile);
    });

    return () => {
      unsubOrders();
      unsubProfile();
    };
  }, [partnerId]);

  const handleCreateSampleOrder = async () => {
    try {
      setError(null);
      await createSampleOrder(partnerId);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
        setIsUpgradeModalOpen(true);
      }
    }
  };

  const handleUpgrade = async () => {
    await upgradeVendorPlan(partnerId);
    setIsUpgradeModalOpen(false);
  };

  const stats = {
    dailyCount: orders.length,
    revenue: orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.total : sum, 0),
    pending: orders.filter(o => o.status === 'placed' || o.status === 'accepted').length
  };

  const currentSurge = getActiveSurgeMultiplier(vendorProfile?.dailyOrderCount || 0);

  const handleToggleSponsorship = async () => {
    if (vendorProfile) {
      await toggleVendorSponsorship(partnerId, !vendorProfile.isSponsored);
    }
  };

  return (
    <div className="px-5 py-6 space-y-8 relative">
      {/* Upgrade Plan Modal */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-primary/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

              <div className="relative text-center space-y-6">
                <div className="bg-primary/5 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-2 border border-primary/10">
                  <Zap className="w-10 h-10 text-primary fill-primary/20" />
                </div>
                
                <h3 className="text-2xl font-poppins font-bold">Elevate to Pro</h3>
                
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center space-x-2 border border-red-100">
                    <Info className="w-4 h-4 shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-tight text-left">{error}</p>
                  </div>
                )}

                <div className="space-y-4 text-left">
                  {[
                    { icon: TrendingUp, title: 'Unlimited Dispatch', desc: 'No daily limits on live orders' },
                    { icon: Zap, title: 'Priority visibility', desc: 'Your tasks appearing first for riders' },
                    { icon: Bell, title: 'Advanced Pulse', desc: 'Instant notifications for all milestones' }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 mt-0.5">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none mb-1">{feature.title}</p>
                        <p className="text-[10px] text-text-secondary font-medium">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={handleUpgrade}
                    className="w-full bg-primary text-white py-5 rounded-3xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
                  >
                    Upgrade for Rs. 999/mo
                  </button>
                  <button 
                    onClick={() => {
                      setIsUpgradeModalOpen(false);
                      setError(null);
                    }}
                    className="w-full text-text-secondary py-3 text-[10px] font-bold uppercase tracking-widest active:opacity-60"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center space-x-3 border border-green-400/50 min-w-[280px]"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 opacity-80">Rider Dropped Off</p>
              <p className="font-bold text-sm tracking-tight">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="space-y-4">
        {/* Plan & Usage Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-[2.5rem] flex items-center justify-between border ${vendorProfile?.plan === 'pro' ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-200'}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${vendorProfile?.plan === 'pro' ? 'bg-primary text-white' : 'bg-white text-text-secondary border border-gray-100'}`}>
              {vendorProfile?.plan === 'pro' ? <Zap className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-widest">{vendorProfile?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}</span>
                {vendorProfile?.plan === 'free' && (
                  <span className="text-[8px] font-bold bg-accent/10 text-accent px-1.5 py-0.5 rounded uppercase tracking-tighter">Limited</span>
                )}
              </div>
              <div className="text-[10px] text-text-secondary font-medium mt-1">
                {vendorProfile?.plan === 'free' 
                  ? `${vendorProfile.dailyOrderCount}/5 orders dispatched today` 
                  : 'Unlimited daily dispatches active'}
              </div>
            </div>
          </div>
          {vendorProfile?.plan === 'free' && (
            <button 
              onClick={() => setIsUpgradeModalOpen(true)}
              className="bg-primary text-white text-[10px] font-bold px-4 py-2 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest"
            >
              Upgrade
            </button>
          )}
        </motion.div>

        {/* Surge Pricing Indicator */}
        {currentSurge > 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-[2.5rem] bg-orange-500 text-white shadow-xl shadow-orange-500/20 border border-orange-400 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <TrendingUp className="w-16 h-16" />
            </div>
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Surge Active: {currentSurge}x</span>
            </div>
            <p className="text-[10px] font-medium opacity-90 leading-relaxed uppercase tracking-widest">High local demand detected. Delivery fees increased to attract more riders.</p>
          </motion.div>
        )}

        {[
          { label: 'Total Sales', value: stats.dailyCount.toString(), icon: Package, color: 'text-blue-600', unit: 'Orders Today' },
          { label: 'Net Revenue', value: `Rs. ${stats.revenue}`, icon: DollarSign, color: 'text-green-600', unit: 'Confirmed' },
          { label: 'Active Tasks', value: stats.pending.toString(), icon: Clock, color: 'text-orange-600', unit: 'Pending' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center space-x-4 active:scale-[0.98] transition-all"
          >
            <div className={`p-4 rounded-3xl ${stat.color.replace('text', 'bg')}/10`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</div>
              <div className="text-2xl font-poppins font-bold leading-tight">{stat.value}</div>
              <div className="text-[9px] font-bold text-text-secondary/50 uppercase">{stat.unit}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="space-y-4">
        <div className="px-2 space-y-4">
          <div className="p-6 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Plus className="w-24 h-24 rotate-12" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Dispatcher Simulation</h3>
            <p className="text-[10px] text-white/50 mb-6 font-medium leading-relaxed uppercase tracking-widest">Test the network by simulating a real customer order from your store. It will broadcast to all nearby riders.</p>
            <button 
              onClick={handleCreateSampleOrder}
              className="w-full bg-accent text-white py-4 rounded-2xl font-bold active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg shadow-accent/20"
            >
              <span>Dispatch Live Order</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Order Management</h2>
            <div className="flex items-center space-x-1 bg-green-50 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Accepting</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence>
            {orders.length > 0 ? (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] font-mono text-text-secondary/60 mb-1">#{order.id.slice(-6).toUpperCase()}</div>
                      <h3 className="font-bold text-base leading-tight">{order.customerName}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${statusColors[order.status]}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">
                      {order.items.length} Package • Rs. {order.total}
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'placed' && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                        >
                          Accept
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border border-gray-100">
                <Package className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
                <p className="text-[11px] text-text-secondary font-bold uppercase tracking-widest">Waiting for Orders</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-sm flex items-end justify-center p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-[3rem] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-poppins font-bold">Order Tracking</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">#{selectedOrder.id.slice(-6).toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 bg-secondary rounded-2xl active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5 text-primary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-6 scrollbar-hide">
                <div className="h-64 relative rounded-[2.5rem] overflow-hidden">
                  <DeliveryMap 
                    pickup={selectedOrder.pickupCoords} 
                    delivery={selectedOrder.deliveryCoords}
                    rider={selectedOrder.riderCoords}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-accent/10 p-2 rounded-xl">
                      <MapPin className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Pickup Point</p>
                      <p className="text-sm font-bold">Main Market, Gulberg Store</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/5 p-2 rounded-xl">
                      <Home className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Delivery Address</p>
                      <p className="text-sm font-bold">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 p-5 rounded-[2rem] space-y-3">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Summary</h4>
                   {selectedOrder.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between text-sm font-medium">
                       <span>{item.name} x {item.quantity}</span>
                       <span className="font-poppins">Rs. {item.price * item.quantity}</span>
                     </div>
                   ))}
                   <div className="pt-3 border-t border-gray-200 mt-2 flex justify-between font-bold text-lg">
                     <span>Total</span>
                     <span className="text-primary">Rs. {selectedOrder.total}</span>
                   </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-primary text-white py-5 rounded-3xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all mt-6 shrink-0"
              >
                Close Tracking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Ops */}
      <div className="space-y-4 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary px-2">Store Ops</h2>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onTabChange?.('inventory')}
            className="flex flex-col items-center justify-center bg-primary text-white p-5 rounded-[2rem] space-y-2 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Add Product</span>
          </button>
          <button 
            onClick={() => onTabChange?.('inventory')}
            className="flex flex-col items-center justify-center bg-white border border-gray-100 text-primary p-5 rounded-[2rem] space-y-2 active:scale-95 transition-all shadow-sm"
          >
            <Package className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Inventory</span>
          </button>
        </div>

        <div className="p-8 bg-secondary/50 rounded-[2.5rem] mt-4 border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-400/10 rounded-xl">
                <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
              </div>
              <span className="text-sm font-bold">Sponsored Visibility</span>
            </div>
            <button 
              onClick={handleToggleSponsorship}
              className={`w-12 h-7 rounded-full relative p-1 transition-colors ${vendorProfile?.isSponsored ? 'bg-accent' : 'bg-gray-300'}`}
            >
              <motion.div 
                animate={{ x: vendorProfile?.isSponsored ? 20 : 0 }}
                className="w-5 h-5 bg-white rounded-full shadow-md" 
              />
            </button>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed font-bold uppercase tracking-tighter opacity-70">Appear more frequently in rider feeds. Sponsored orders are 3x more likely to be accepted early.</p>

          <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between">
            <span className="text-sm font-bold">Store Visibility</span>
            <div className="w-12 h-7 bg-green-500 rounded-full relative p-1 shadow-inner">
              <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-md" />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed font-bold uppercase tracking-tighter opacity-70">Control your store's availability. Turning off prevents new orders.</p>
        </div>
      </div>
    </div>
  );
}
