/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, Product, OrderStatus } from '../types';

// Orders Service
export const subscribeToVendorOrders = (vendorId: string, callback: (orders: Order[]) => void) => {
  const q = query(
    collection(db, 'orders'), 
    where('vendorId', '==', vendorId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Order);
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  });
};

export const subscribeToAvailableOrders = (callback: (orders: Order[]) => void) => {
  const q = query(
    collection(db, 'orders'), 
    where('status', '==', 'placed'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Order);
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  });
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus, riderId?: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updates: any = { status };
    if (riderId) updates.riderId = riderId;
    await updateDoc(orderRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

// Products Service
export const subscribeToVendorProducts = (vendorId: string, callback: (products: Product[]) => void) => {
  const q = query(
    collection(db, 'products'), 
    where('vendorId', '==', vendorId)
  );

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Product);
    callback(products);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'products');
  });
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    await addDoc(collection(db, 'products'), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
};

export const createSampleOrder = async (vendorId: string) => {
  try {
    const newOrder: Omit<Order, 'id'> = {
      customerName: 'Customer ' + Math.floor(Math.random() * 1000),
      customerPhone: '+92 300 0000000',
      address: 'Test Address, Street ' + Math.floor(Math.random() * 100),
      items: [{ id: 'S1', name: 'Sample Item', quantity: 1, price: 500 }],
      total: 500,
      status: 'placed',
      createdAt: new Date().toISOString(),
      vendorId
    };
    await addDoc(collection(db, 'orders'), newOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
  }
};
