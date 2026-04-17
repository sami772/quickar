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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Orders', value: stats.dailyCount.toString(), icon: Package, color: 'text-blue-600' },
          { label: 'Revenue (Delivered)', value: `Rs. ${stats.revenue}`, icon: DollarSign, color: 'text-green-600' },
          { label: 'Pending Orders', value: stats.pending.toString(), icon: Clock, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-poppins font-bold">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-poppins font-bold">Recent Orders</h2>
            <button 
              onClick={handleCreateSampleOrder}
              className="text-accent text-[10px] font-bold px-3 py-1 bg-accent/10 rounded-lg hover:bg-accent/20 transition-colors uppercase tracking-wider"
            >
              + Create Sample Order
            </button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-accent/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-mono text-text-secondary mb-1">{order.id.slice(-6)}</div>
                        <h3 className="font-bold text-lg">{order.customerName}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-text-secondary">
                        {order.items.length} items • Rs. {order.total}
                      </div>
                      <div className="flex space-x-2">
                        {order.status === 'placed' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'accepted')}
                            className="bg-accent text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                          >
                            Accept Order
                          </button>
                        )}
                        <button className="bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">
                          Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-100">
                  <Package className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-20" />
                  <p className="text-text-secondary italic">No orders found yet</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Actions & Inventory Mini */}
        <div>
          <h2 className="text-xl font-poppins font-bold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 bg-primary text-white p-4 rounded-2xl font-bold hover:bg-primary/90 transition-all">
              <Plus className="w-5 h-5" />
              <span>Add New Product</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-primary text-primary p-4 rounded-2xl font-bold hover:bg-primary/5 transition-all">
              <Package className="w-5 h-5" />
              <span>Inventory Sync</span>
            </button>
          </div>

          <div className="mt-8 p-6 bg-accent/5 rounded-2xl border border-accent/10">
            <h3 className="font-bold mb-4">Store Status</h3>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl mb-3 shadow-sm">
              <span className="text-sm">Store Online</span>
              <div className="w-10 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </div>
            <p className="text-xs text-text-secondary">Toggle to stop receiving new orders temporarily.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
