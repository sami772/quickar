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
  orderBy,
  getDoc,
  setDoc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Order, Product, OrderStatus, VendorProfile, RiderProfile, UserProfile } from '../types';

// User Profile Service
export const subscribeToUserProfile = (userId: string, callback: (profile: UserProfile | null) => void) => {
  return onSnapshot(doc(db, 'users', userId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...snapshot.data(), id: snapshot.id } as UserProfile);
    } else {
      callback(null);
    }
  });
};

export const registerUserRole = async (userId: string, role: UserRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      const roles = data.roles || [];
      if (!roles.includes(role)) {
        await updateDoc(userRef, {
          roles: [...roles, role]
        });
      }
    } else {
      await setDoc(userRef, {
        id: userId,
        roles: [role],
        displayName: role === 'vendor' ? 'Merchant' : 'Rider'
      });
    }

    // Also ensure the actual role profile exists
    if (role === 'vendor') {
      await getOrCreateVendorProfile(userId, `${userId}@quickar.com`);
    } else {
      await getOrCreateRiderProfile(userId, `${userId}@quickar.com`);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
};

// Profile Service
export const getOrCreateVendorProfile = async (vendorId: string, email: string) => {
  try {
    const docRef = doc(db, 'vendors', vendorId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as VendorProfile;
    } else {
      const newProfile: VendorProfile = {
        id: vendorId,
        name: email.split('@')[0],
        email,
        plan: 'free',
        dailyOrderCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `vendors/${vendorId}`);
  }
};

export const getOrCreateRiderProfile = async (riderId: string, email: string) => {
  try {
    const docRef = doc(db, 'riders', riderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as RiderProfile;
    } else {
      const newProfile: RiderProfile = {
        id: riderId,
        name: email.split('@')[0],
        email,
        isOnline: true, // New riders start online
        dailyDeliveries: 0,
        weeklyDeliveries: 0,
        totalEarnings: 0,
        currentIncentiveTier: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `riders/${riderId}`);
  }
};

export const toggleRiderOnlineStatus = async (riderId: string, isOnline: boolean) => {
  try {
    await updateDoc(doc(db, 'riders', riderId), { isOnline });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `riders/${riderId}`);
  }
};

export const subscribeToRiderProfile = (riderId: string, callback: (rider: RiderProfile) => void) => {
  return onSnapshot(doc(db, 'riders', riderId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...snapshot.data(), id: snapshot.id } as RiderProfile);
    }
  });
};

export const subscribeToVendorProfile = (vendorId: string, callback: (vendor: VendorProfile) => void) => {
  return onSnapshot(doc(db, 'vendors', vendorId), (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...snapshot.data(), id: snapshot.id } as VendorProfile);
    }
  });
};

export const upgradeVendorPlan = async (vendorId: string) => {
  try {
    await updateDoc(doc(db, 'vendors', vendorId), { plan: 'pro' });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `vendors/${vendorId}`);
  }
};

export const toggleVendorSponsorship = async (vendorId: string, isSponsored: boolean) => {
  try {
    await updateDoc(doc(db, 'vendors', vendorId), { isSponsored });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `vendors/${vendorId}`);
  }
};

// Surge Calculation (Simulated)
export const getActiveSurgeMultiplier = (vendorOrderCount: number) => {
  // Mock logic: more vendor orders = higher local demand
  if (vendorOrderCount > 8) return 1.8;
  if (vendorOrderCount > 5) return 1.5;
  if (vendorOrderCount > 2) return 1.2;
  return 1.0;
};

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
  // Riders should see orders that are "placed" (immediate broadcast) 
  // and "accepted" (vendor confirmed and ready for courier)
  const q = query(
    collection(db, 'orders'), 
    where('status', 'in', ['placed', 'accepted']),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    // Only show orders that don't have a rider assigned yet
    const orders = snapshot.docs
      .map(d => ({ ...d.data(), id: d.id }) as Order)
      .filter(order => !order.riderId);
    callback(orders);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  });
};

export const subscribeToRiderOrders = (riderId: string, callback: (orders: Order[]) => void) => {
  const q = query(
    collection(db, 'orders'), 
    where('riderId', '==', riderId),
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

    // If delivered, update rider stats for incentives
    if (status === 'delivered' && riderId) {
      const orderSnap = await getDoc(orderRef);
      const orderData = orderSnap.data() as Order;
      const earnings = (orderData.deliveryFee || 40) + 10; // Fee + base tip

      const riderRef = doc(db, 'riders', riderId);
      await updateDoc(riderRef, {
        dailyDeliveries: increment(1),
        weeklyDeliveries: increment(1),
        totalEarnings: increment(earnings)
      });
    }
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

export const reassignOrder = async (orderId: string) => {
  try {
    const expiresAt = new Date(Date.now() + 120000).toISOString(); // + 2 mins
    await updateDoc(doc(db, 'orders', orderId), { 
      expiresAt,
      reassignments: increment(1) 
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
};

export const createSampleOrder = async (vendorId: string, customData?: Partial<Order>) => {
  try {
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorSnap = await getDoc(vendorRef);
    
    if (vendorSnap.exists()) {
      const vendor = vendorSnap.data() as VendorProfile;
      const today = new Date().toISOString().split('T')[0];
      
      // Reset count if it's a new day
      if (vendor.lastResetDate !== today) {
        await updateDoc(vendorRef, {
          dailyOrderCount: 0,
          lastResetDate: today
        });
        vendor.dailyOrderCount = 0;
      }

      // Check limits for Free Plan (5 orders per day)
      if (vendor.plan === 'free' && vendor.dailyOrderCount >= 5) {
        throw new Error('Daily limit reached on Free Plan. Upgrade to Pro for unlimited dispatch.');
      }

      // Logic to count the order
      await updateDoc(vendorRef, {
        dailyOrderCount: increment(1)
      });
      
      const surgeMultiplier = getActiveSurgeMultiplier(vendor.dailyOrderCount);
      const baseDeliveryFee = 45;
      const expiresAt = new Date(Date.now() + 120000).toISOString(); // 2 minute countdown
      
      // Simulated Lahore coordinates
      const baseLat = 31.5204;
      const baseLng = 74.3587;
      
      const newOrder: Omit<Order, 'id'> = {
        customerName: customData?.customerName || 'Customer ' + Math.floor(Math.random() * 1000),
        customerPhone: customData?.customerPhone || '+92 300 0000000',
        address: customData?.address || 'Street ' + Math.floor(Math.random() * 100) + ', Gulberg III',
        items: customData?.items || [{ id: 'S1', name: 'Premium Milk 1L', quantity: 2, price: 420 }],
        total: customData?.total || 420,
        status: 'placed',
        createdAt: new Date().toISOString(),
        expiresAt,
        vendorId,
        isPriority: vendor.plan === 'pro', 
        isSponsored: vendor.isSponsored || false,
        surgeMultiplier,
        deliveryFee: baseDeliveryFee * surgeMultiplier,
        pickupCoords: {
          lat: baseLat + (Math.random() - 0.5) * 0.01,
          lng: baseLng + (Math.random() - 0.5) * 0.01,
        },
        deliveryCoords: {
          lat: baseLat + (Math.random() - 0.5) * 0.02,
          lng: baseLng + (Math.random() - 0.5) * 0.02,
        },
        ...customData
      };
      await addDoc(collection(db, 'orders'), newOrder);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('limit reached')) {
      throw error; // Let UI handle limit error
    }
    handleFirestoreError(error, OperationType.CREATE, 'orders');
  }
};
