/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Navigation, DollarSign, Star, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from '../../types';
import { subscribeToAvailableOrders, updateOrderStatus } from '../../services/firestore';
import { getPartnerId } from '../../firebase';

export default function RiderDashboard() {
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const partnerId = getPartnerId();

  useEffect(() => {
    const unsubscribe = subscribeToAvailableOrders((newOrders) => {
      setAvailableOrders(newOrders);
    });
    return () => unsubscribe();
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
    await updateOrderStatus(orderId, 'accepted', partnerId);
  };

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Earnings Overview */}
      <div className="bg-primary text-white p-6 rounded-[2.5rem] flex flex-col justify-between items-center shadow-xl shadow-primary/20">
        <div className="text-center mb-6">
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Today's Earnings</p>
          <div className="flex flex-col items-center">
            <span className="text-5xl font-poppins font-bold">Rs. 0</span>
            <span className="mt-2 text-green-400 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full">Active Partner</span>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/5">
              <Truck className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-bold">0 Tasks</span>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/5">
              <Star className="w-3 h-3 text-accent fill-accent" />
              <span className="text-[10px] font-bold">New Rider</span>
            </div>
          </div>
        </div>
        <button className="w-full bg-accent text-white py-5 rounded-3xl font-bold shadow-lg shadow-accent/20 active:scale-95 transition-all">
          Cash Out Now
        </button>
      </div>

      <div className="space-y-8">
        {/* Available Requests */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mb-4 flex items-center px-2">
            <DollarSign className="w-4 h-4 text-accent mr-2" />
            Available Tasks
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence>
              {availableOrders.length > 0 ? (
                availableOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="bg-secondary p-3.5 rounded-2xl">
                        <Truck className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="bg-green-100 text-green-600 text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase">Earn Rs. {(order.total * 0.1).toFixed(0)}</span>
                          <span className="text-[9px] font-bold text-text-secondary uppercase">2.4 km</span>
                        </div>
                        <h3 className="font-bold text-sm leading-tight truncate">{order.address}</h3>
                        <div className="flex items-center text-[10px] font-bold text-text-secondary uppercase tracking-tighter mt-1">
                          <MapPin className="w-3 h-3 mr-1 text-accent" />
                          <span>Quickar Merchant</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Accept Task</span>
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
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status & Active Shift */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold">System Status</h3>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider">Online</span>
              </div>
            </div>
            
            <div className="space-y-5">
              {[
                { label: 'Current Shift', value: '4h 20m' },
                { label: 'Acceptance', value: '98%' },
                { label: 'Safety Index', value: '4.9' }
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</span>
                  <span className="text-sm font-bold text-primary">{stat.value}</span>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 bg-red-50 text-red-600 py-4 rounded-3xl font-bold active:scale-95 transition-all border border-red-100/50">
              End Active Session
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
