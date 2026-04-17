/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'vendor' | 'rider';

export type SubscriptionPlan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  roles: UserRole[];
  displayName: string;
}

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  dailyOrderCount: number;
  isSponsored?: boolean;
  lastResetDate: string; // ISO date to reset daily limit
}

export interface RiderProfile {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  dailyDeliveries: number;
  weeklyDeliveries: number;
  totalEarnings: number;
  currentIncentiveTier: number;
  lastResetDate: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  vendorId: string;
  riderId?: string;
  isPriority?: boolean;
  isSponsored?: boolean; // New: Sponsored dispatch
  surgeMultiplier?: number; // New: Surge pricing
  deliveryFee?: number; // New: Dynamically calculated fee
  expiresAt?: string; // New: Expiration timer
  pickupCoords?: {
    lat: number;
    lng: number;
  };
  deliveryCoords?: {
    lat: number;
    lng: number;
  };
  riderCoords?: {
    lat: number;
    lng: number;
  };
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'placed' 
  | 'accepted' 
  | 'picked' 
  | 'out_for_delivery' 
  | 'delivered'
  | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  vendorId: string;
  image?: string;
}

export interface VendorStats {
  dailyOrders: number;
  revenue: number;
  pendingOrders: number;
}

export interface RiderStats {
  totalDeliveries: number;
  earnings: number;
}
