/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'vendor' | 'rider';

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
  coordinates?: {
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
