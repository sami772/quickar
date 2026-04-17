/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Navigation, DollarSign, Star, Clock, X, Home, CheckCircle2, Package, Zap, TrendingUp, Trophy, Power } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order, RiderProfile } from '../../types';
import { subscribeToAvailableOrders, subscribeToRiderOrders, updateOrderStatus, subscribeToRiderProfile, getOrCreateRiderProfile, toggleRiderOnlineStatus } from '../../services/firestore';
import { getPartnerId, getUserEmail } from '../../firebase';
import DeliveryMap from '../shared/DeliveryMap';
import CountdownTimer from './CountdownTimer';

export default function RiderDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [riderProfile, setRiderProfile] = useState<RiderProfile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [tab, setTab] = useState<'available' | 'active'>('available');
  const partnerId = getPartnerId();
  const email = getUserEmail() || `${partnerId}@quickar.com`;

  useEffect(() => {
    // Ensure profile exists
    getOrCreateRiderProfile(partnerId, email);

    const unsubProfile = subscribeToRiderProfile(partnerId, setRiderProfile);
    const unsubActive = subscribeToRiderOrders(partnerId, setActiveOrders);
    
    let unsubAvailable: () => void = () => {};
    
    if (riderProfile?.isOnline) {
      unsubAvailable = subscribeToAvailableOrders(setAvailableOrders);
    } else {
      setAvailableOrders([]);
    }
    
    return () => {
      unsubAvailable();
      unsubActive();
      unsubProfile();
    };
  }, [partnerId, email, riderProfile?.isOnline]);

  const handleAcceptOrder = async (orderId: string) => {
    if (!riderProfile?.isOnline) return;
    await updateOrderStatus(orderId, 'accepted', partnerId);
  };

  const handleToggleOnline = async () => {
    if (riderProfile) {
      await toggleRiderOnlineStatus(partnerId, !riderProfile.isOnline);
    }
  };

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Earnings & Incentive Overview */}
      <div className="bg-primary text-white p-6 rounded-[2.5rem] flex flex-col shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-24 h-24 rotate-12" />
        </div>
        
        <div className="text-center mb-6">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Earnings</p>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-poppins font-bold">Rs. {riderProfile?.totalEarnings || 0}</span>
            <span className="mt-2 text-green-400 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full flex items-center">
              <Star className="w-3 h-3 mr-1 fill-green-400" />
              Pro Partner
            </span>
          </div>
        </div>

        {/* Incentive Tracker */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Daily Target</p>
              <p className="text-sm font-bold">{riderProfile?.dailyDeliveries || 0} / 10 Deliveries</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-accent font-bold uppercase tracking-widest">+ Rs. 500 Bonus</p>
            </div>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(((riderProfile?.dailyDeliveries || 0) / 10) * 100, 100)}%` }}
              className="h-full bg-accent rounded-full"
            />
          </div>
          <p className="text-[8px] text-white/30 mt-2 uppercase tracking-tighter font-bold font-poppins italic">Deliver 10 orders today to unlock your daily incentive bonus</p>
        </div>

        <button className="w-full bg-accent text-white py-5 rounded-3xl font-bold shadow-lg shadow-accent/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
          Withdraw Funds
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-secondary rounded-3xl border border-gray-100">
        <button 
          onClick={() => setTab('available')}
          className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'available' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Available ({availableOrders.length})
        </button>
        <button 
          onClick={() => setTab('active')}
          className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}`}
        >
          Ongoing ({activeOrders.filter(o => o.status !== 'delivered').length})
        </button>
      </div>

      <div className="space-y-8">
        {/* Orders List */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center px-2">
            <DollarSign className="w-4 h-4 text-accent mr-2" />
            {tab === 'available' ? 'Broadcast Requests' : 'Ongoing Deliveries'}
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {tab === 'available' ? (
                // Available View
                availableOrders.length > 0 ? (
                  availableOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100, delay: i * 0.05 }}
                      className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 active:bg-gray-50 transition-colors relative overflow-hidden"
                    >
                      {i === 0 && (
                        <div className="absolute top-0 right-0 p-2">
                          <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
                        </div>
                      )}
                      
                      <div 
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-start space-x-4 mb-4"
                      >
                        <div className="bg-primary/5 p-4 rounded-3xl">
                          <Truck className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex flex-wrap gap-2">
                              {order.isSponsored && (
                                <span className="bg-yellow-400 text-black text-[7px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest flex items-center shadow-sm">
                                  <Star className="w-2 h-2 mr-1 fill-black" />
                                  Sponsored
                                </span>
                              )}
                              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                                order.status === 'accepted' 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-accent/10 text-accent'
                              }`}>
                                {order.status === 'accepted' ? 'Vendor Confirmed' : 'Live Broadcast'}
                              </span>
                              {order.isPriority && (
                                <span className="bg-primary text-white text-[7px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest flex items-center shadow-lg shadow-primary/20">
                                  <Zap className="w-2 h-2 mr-1 fill-white" />
                                  Priority
                                </span>
                              )}
                              {order.surgeMultiplier && order.surgeMultiplier > 1 && (
                                <span className="bg-orange-500 text-white text-[7px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest flex items-center shadow-lg shadow-orange-500/20">
                                  <TrendingUp className="w-2 h-2 mr-1" />
                                  {order.surgeMultiplier}x Surge
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-[9px] font-bold text-text-secondary/60 uppercase">
                              <Navigation className="w-2.5 h-2.5 mr-1" />
                              <span>{(Math.random() * 2 + 0.5).toFixed(1)} km</span>
                            </div>
                          </div>
                          <h3 className="font-bold text-base leading-tight truncate">{order.address}</h3>
                          <div className="flex items-center text-[10px] font-bold text-text-secondary uppercase tracking-tight mt-1 opacity-60">
                            <MapPin className="w-3 h-3 mr-1 text-primary" />
                            <span>{order.status === 'accepted' ? 'Ready for Pickup' : 'Merchant Portal Broadcast'}</span>
                          </div>
                        </div>
                      </div>
                      
        {/* Order Payout & Timer */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-text-secondary uppercase">Payout</span>
            <span className="text-lg font-poppins font-bold text-primary">Rs. {order.deliveryFee?.toFixed(0) || (order.total * 0.1).toFixed(0)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-text-secondary uppercase mb-1">Time Remaining</span>
            {order.expiresAt && <CountdownTimer expiresAt={order.expiresAt} orderId={order.id} />}
          </div>
        </div>

        <button 
          onClick={() => handleAcceptOrder(order.id)}
          disabled={!riderProfile?.isOnline}
          className={`w-full py-4 rounded-[1.5rem] font-bold active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-lg ${
            riderProfile?.isOnline 
              ? 'bg-primary text-white shadow-primary/10' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>{riderProfile?.isOnline ? 'Grab Delivery' : 'Connect to Start'}</span>
          <Navigation className="w-4 h-4" />
        </button>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white p-12 rounded-[2.5rem] text-center border border-gray-100"
                  >
                    <div className="bg-secondary w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-text-secondary/40 animate-pulse" />
                    </div>
                    <h3 className="font-bold text-base mb-1">Scanning Areas...</h3>
                    <p className="text-text-secondary text-[11px] px-2 font-medium">New tasks will automatically appear here as they come in.</p>
                  </motion.div>
                )
              ) : (
                // Ongoing View
                activeOrders.filter(o => o.status !== 'delivered').length > 0 ? (
                  activeOrders.filter(o => o.status !== 'delivered').map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest mb-2 inline-block ${
                            order.status === 'picked' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {order.status === 'picked' ? 'Heading to Dropoff' : 'Heading to Merchant'}
                          </div>
                          <h3 className="font-bold text-lg leading-tight">{order.customerName}</h3>
                          <div className="text-[10px] font-bold text-text-secondary uppercase mt-1">{order.address}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-text-secondary uppercase block">Profit</span>
                          <span className="text-base font-poppins font-bold text-primary">Rs. {(order.total * 0.1).toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="h-40 relative rounded-[1.5rem] overflow-hidden">
                        <DeliveryMap 
                          pickup={order.pickupCoords} 
                          delivery={order.deliveryCoords}
                          rider={order.riderCoords}
                        />
                      </div>

                      <div className="flex space-x-3">
                        {order.status !== 'picked' ? (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'picked')}
                            className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-all text-xs uppercase"
                          >
                            Picked Up
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold active:scale-95 transition-all text-xs uppercase flex items-center justify-center space-x-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Delivered</span>
                          </button>
                        )}
                        <button className="bg-secondary text-primary px-5 rounded-2xl active:scale-95 transition-all">
                          <Navigation className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white p-12 rounded-[2.5rem] text-center border border-gray-100">
                    <Package className="w-12 h-12 text-text-secondary/20 mx-auto mb-4" />
                    <p className="text-[11px] text-text-secondary font-bold uppercase tracking-widest">No Active Deliveries</p>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Tracking Modal */}
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
              className="bg-white w-full max-w-md rounded-[3rem] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-poppins font-bold">Route Preview</h3>
                  <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">Broadcast ID: {selectedOrder.id.slice(-6).toUpperCase()}</p>
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
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-accent/10 p-2.5 rounded-2xl">
                      <MapPin className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Pickup From</p>
                      <p className="text-base font-bold">Merchant Hub • Gulberg III</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/5 p-2.5 rounded-2xl">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Deliver To</p>
                      <p className="text-base font-bold">{selectedOrder.address}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 p-6 rounded-[2rem] flex justify-between items-center">
                   <div>
                     <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Est. Payout</p>
                     <p className="text-2xl font-poppins font-bold text-primary">Rs. {(selectedOrder.total * 0.1).toFixed(0)}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Total Distance</p>
                     <p className="text-base font-bold">~ 3.2 km</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 shrink-0">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="bg-secondary text-primary py-5 rounded-3xl font-bold active:scale-95 transition-all text-xs uppercase"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => {
                    handleAcceptOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="bg-primary text-white py-5 rounded-3xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-all text-xs uppercase flex items-center justify-center space-x-2"
                >
                  <span>Grab Task</span>
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Status & Active Shift */}
          <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold">Courier Availability</h3>
              <button 
                onClick={handleToggleOnline}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl transition-all ${
                  riderProfile?.isOnline 
                    ? 'bg-green-50 text-green-600 border border-green-100' 
                    : 'bg-red-50 text-red-600 border border-red-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${riderProfile?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{riderProfile?.isOnline ? 'Online' : 'Offline'}</span>
                <Power className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-5">
              {[
                { label: 'Platform Status', value: riderProfile?.isOnline ? 'Scanning Tasks' : 'Paused' },
                { label: 'Shift Duration', value: '4h 20m' },
                { label: 'Acceptance Rate', value: '98%' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</span>
                  <span className="text-sm font-bold text-primary">{stat.value}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleToggleOnline}
              className={`w-full mt-10 py-4 rounded-3xl font-bold active:scale-95 transition-all border ${
                riderProfile?.isOnline 
                  ? 'bg-red-50 text-red-600 border-red-100/50' 
                  : 'bg-primary text-white shadow-xl shadow-primary/20'
              }`}
            >
              {riderProfile?.isOnline ? 'Go Offline' : 'Go Online'}
            </button>
          </div>

          <div className="p-8 bg-accent/5 rounded-[2.5rem] border border-accent/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Navigation className="w-32 h-32 rotate-12" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 flex items-center">
              <Navigation className="w-4 h-4 mr-2" />
              Hotzones
            </h3>
            <p className="text-[10px] text-text-secondary mb-6 leading-relaxed font-bold uppercase tracking-tighter opacity-80">Gulberg demand detected. High profit tasks available now.</p>
            <div className="space-y-2">
              <div className="h-3 bg-white rounded-full overflow-hidden p-0.5 border border-accent/10 shadow-inner">
                <div className="h-full bg-accent rounded-full w-3/4" />
              </div>
              <div className="flex justify-between text-[7px] font-bold uppercase tracking-[0.2em] text-text-secondary px-1">
                <span>Medium</span>
                <span className="text-accent">Peak Demand</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
