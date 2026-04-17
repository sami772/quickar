/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ShoppingBag, Truck } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-accent text-xs font-bold uppercase tracking-widest tracking-tighter">"Delivered Before You Blink"</span>
          </div>
          <h1 className="text-4xl font-poppins font-bold mb-4">Welcome to Quickar Partner</h1>
          <p className="text-text-secondary">Choose how you want to use the platform today</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('vendor')}
            className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-accent group transition-all"
          >
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
              <ShoppingBag className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
            </div>
            <h2 className="text-2xl font-poppins font-bold mb-2">Merchant Partner</h2>
            <p className="text-text-secondary mb-6 text-sm">Manage your store, products, and incoming orders in real-time.</p>
            <div className="text-accent font-semibold flex items-center">
              Enter Store Panel
              <span className="ml-2">→</span>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect('rider')}
            className="bg-white p-8 rounded-2xl shadow-sm border-2 border-transparent hover:border-accent group transition-all"
          >
            <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
              <Truck className="w-8 h-8 text-primary group-hover:text-accent transition-colors" />
            </div>
            <h2 className="text-2xl font-poppins font-bold mb-2">Delivery Rider</h2>
            <p className="text-text-secondary mb-6 text-sm">Earn by delivering essentials to customers across your city.</p>
            <div className="text-accent font-semibold flex items-center">
              Start Delivery
              <span className="ml-2">→</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
