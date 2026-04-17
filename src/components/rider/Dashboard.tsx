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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Earnings Overview */}
      <div className="bg-primary text-white p-8 rounded-3xl mb-8 flex flex-col md:flex-row justify-between items-center shadow-xl">
        <div className="mb-6 md:mb-0">
          <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">Today's Earnings</p>
          <div className="flex items-baseline">
            <span className="text-4xl font-poppins font-bold">Rs. 0</span>
            <span className="ml-2 text-green-400 text-sm font-bold">Start delivering to earn</span>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-1">
              <Truck className="w-4 h-4 text-accent" />
              <span className="text-sm">0 Deliveries</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm">New Rider</span>
            </div>
          </div>
        </div>
        <button className="bg-accent text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all">
          Cash Out Now
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Requests */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-poppins font-bold mb-6 flex items-center">
            <DollarSign className="w-5 h-5 text-accent mr-2" />
            Available for Pickup
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {availableOrders.length > 0 ? (
                availableOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-accent/30 transition-all flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <div className="flex items-start space-x-4 mb-4 md:mb-0">
                      <div className="bg-secondary p-3 rounded-xl">
                        <Truck className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Estimate: Rs. {(order.total * 0.1).toFixed(0)}</span>
                          <span className="text-text-secondary text-xs">Nearby</span>
                        </div>
                        <h3 className="font-bold text-base mb-1">{order.address}</h3>
                        <div className="flex items-center text-xs text-text-secondary">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>Store Order</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="bg-accent text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      Accept & Navigate <Navigation className="w-4 h-4 ml-2" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200"
                >
                  <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-text-secondary animate-pulse" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Searching for orders...</h3>
                  <p className="text-text-secondary text-sm">New delivery requests will appear here automatically.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Status & Active Shift */}
        <div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
            <h3 className="font-bold mb-6">Status: <span className="text-green-500">Online</span></h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-secondary">Current Shift</span>
                <span className="font-medium">4h 20m</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-text-secondary">Acceptance Rate</span>
                <span className="font-medium text-green-600">98%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-text-secondary">Fuel Allowance</span>
                <span className="font-medium">Rs. 450</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-all">
              Go Offline
            </button>
          </div>

          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <h3 className="font-bold mb-4 flex items-center text-primary">
              <Navigation className="w-4 h-4 mr-2" />
              Hotzones
            </h3>
            <p className="text-xs text-text-secondary mb-4">Higher demand detected in Gulberg and Model Town. Move there for more orders.</p>
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-3/4" />
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                <span>Low</span>
                <span className="text-accent">High Demand</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
