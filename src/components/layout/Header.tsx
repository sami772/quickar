/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, User } from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  role: UserRole;
  onRoleSwitch: () => void;
  onLogout: () => void;
}

export default function Header({ role, onRoleSwitch }: HeaderProps) {
  return (
    <header className="bg-primary text-white sticky top-0 z-50 px-5 pt-6 pb-4 rounded-b-[32px] shadow-2xl shadow-primary/20">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onRoleSwitch}
            className="bg-accent p-2 rounded-xl shadow-lg shadow-accent/20 active:scale-95 transition-transform"
          >
            <span className="font-poppins font-bold text-xl leading-none">Q</span>
          </button>
          <div>
            <h1 className="font-poppins font-bold text-lg tracking-tight leading-none">Quickar</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mt-0.5 font-bold">
              {role === 'vendor' ? 'Merchant Portal' : 'Rider Base'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 relative active:scale-95 transition-transform">
            <Bell className="w-5 h-5 text-white/80" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-primary" />
          </button>
          <button 
            onClick={onRoleSwitch}
            className="p-0.5 rounded-xl bg-gradient-to-tr from-accent to-orange-400 active:scale-95 transition-transform"
          >
            <div className="bg-primary p-2 rounded-xl">
              <User className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
