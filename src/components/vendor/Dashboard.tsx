/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Package, DollarSign, Clock, Plus, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../types';
import { subscribeToVendorOrders, updateOrderStatus, createSampleOrder } from '../../services/firestore';
import { getPartnerId } from '../../firebase';

const statusColors: Record<OrderStatus, string> = {
  placed: 'bg-orange-100 text-orange-600',
  accepted: 'bg-blue-100 text-blue-600',
  picked: 'bg-purple-100 text-purple-600',
  out_for_delivery: 'bg-indigo-100 text-indigo-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function VendorDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const partnerId = getPartnerId();

  useEffect(() => {
    const unsubscribe = subscribeToVendorOrders(partnerId, (newOrders) => {
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, [partnerId]);

  const handleCreateSampleOrder = async () => {
    await createSampleOrder(partnerId);
  };

  const stats = {
    dailyCount: orders.length,
    revenue: orders.reduce((sum, o) => o.status === 'delivered' ? sum + o.total : sum, 0),
    pending: orders.filter(o => o.status === 'placed' || o.status === 'accepted').length
  };

  return (
    <div className="px-5 py-6 space-y-8">
      {/* Stats Cards */}
      <div className="space-y-4">
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
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Recent Flow</h2>
          <button 
            onClick={handleCreateSampleOrder}
            className="text-[9px] font-bold px-3 py-1.5 bg-accent text-white rounded-xl active:scale-95 transition-all uppercase tracking-wider shadow-lg shadow-accent/20"
          >
            + Create Order
          </button>
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
                      <button className="bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all">
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

      {/* Quick Ops */}
      <div className="space-y-4 pb-4">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary px-2">Store Ops</h2>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center justify-center bg-primary text-white p-5 rounded-[2rem] space-y-2 active:scale-95 transition-all shadow-xl shadow-primary/20">
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Add Product</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-white border border-gray-100 text-primary p-5 rounded-[2rem] space-y-2 active:scale-95 transition-all shadow-sm">
            <Package className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Inventory</span>
          </button>
        </div>

        <div className="p-8 bg-secondary/50 rounded-[2.5rem] mt-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
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
