/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Product } from './types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Samir Ali',
    customerPhone: '+92 300 1234567',
    address: 'Phase 5, DHA, Lahore',
    items: [
      { id: 'P1', name: 'Milk 1L', quantity: 2, price: 210 },
      { id: 'P2', name: 'Eggs 12', quantity: 1, price: 340 }
    ],
    total: 760,
    status: 'placed',
    createdAt: new Date().toISOString(),
    vendorId: 'V1',
    pickupCoords: { lat: 31.52, lng: 74.35 },
    deliveryCoords: { lat: 31.48, lng: 74.38 }
  },
  {
    id: 'ORD-002',
    customerName: 'John Doe',
    customerPhone: '+92 321 7654321',
    address: 'Model Town, Lahore',
    items: [
      { id: 'P3', name: 'Bread', quantity: 1, price: 120 },
      { id: 'P4', name: 'Butter 200g', quantity: 1, price: 450 }
    ],
    total: 570,
    status: 'accepted',
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
    vendorId: 'V1',
    riderId: 'R1',
    pickupCoords: { lat: 31.52, lng: 74.35 },
    deliveryCoords: { lat: 31.49, lng: 74.35 }
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'P1',
    name: 'Milk 1L',
    description: 'Fresh cow milk',
    price: 210,
    stock: 50,
    category: 'Dairy',
    vendorId: 'V1'
  },
  {
    id: 'P2',
    name: 'Eggs 12',
    description: 'Large farm eggs',
    price: 340,
    stock: 20,
    category: 'Dairy',
    vendorId: 'V1'
  },
  {
    id: 'P3',
    name: 'Bread',
    description: 'Whole wheat bread',
    price: 120,
    stock: 30,
    category: 'Bakery',
    vendorId: 'V1'
  }
];
