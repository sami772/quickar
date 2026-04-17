/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Package, Truck, User } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  role: UserRole;
  onRoleSwitch: () => void;
  onLogout: () => void;
}

export default function Header({ role, onRoleSwitch, onLogout }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-accent p-2 rounded-lg">
              <span className="font-poppins font-bold text-xl leading-none">Q</span>
            </div>
            <span className="font-poppins font-bold text-xl tracking-tight">Quickar Partner</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={onRoleSwitch}
              className="hidden sm:flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-sm font-medium"
            >
              {role === 'vendor' ? (
                <>
                  <Package className="w-4 h-4" />
                  <span>Vendor Mode</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Rider Mode</span>
                </>
              )}
            </button>
            <div 
              onClick={onLogout}
              className="w-8 h-8 rounded-full bg-accent flex items-center justify-center cursor-pointer hover:bg-red-500 transition-colors"
              title="Reset Registration"
            >
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
