/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, List, Search, Plus, Trash2, Edit2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { subscribeToVendorProducts, addProduct, deleteProduct } from '../../services/firestore';
import { getPartnerId } from '../../firebase';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const partnerId = getPartnerId();

  useEffect(() => {
    const unsubscribe = subscribeToVendorProducts(partnerId, (newProducts) => {
      setProducts(newProducts);
    });
    return () => unsubscribe();
  }, [partnerId]);

  const handleAddSample = async () => {
    const newProduct: Omit<Product, 'id'> = {
      name: 'Fresh Apples 1kg',
      description: 'Crunchy and sweet apples',
      price: 250,
      stock: 30,
      category: 'Fruits',
      vendorId: partnerId
    };
    await addProduct(newProduct);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-poppins font-bold">Inventory</h1>
          <p className="text-text-secondary">Manage your store catalog and stock levels</p>
        </div>
        <button 
          onClick={handleAddSample}
          className="flex items-center space-x-2 bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-105 transition-all self-start md:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Sample Product</span>
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {products.length > 0 ? (
              products.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-secondary rounded-xl mb-4 relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-100 transition-opacity">
                      <button className="bg-white p-2 rounded-lg shadow-sm text-red-500 hover:bg-red-50 transition-colors" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Placeholder for real image */}
                    <div className="w-full h-full flex items-center justify-center text-text-secondary/20 font-bold text-4xl">
                      {product.name[0]}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-lg leading-tight transition-colors">{product.name}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xl font-poppins font-bold text-primary">Rs. {product.price}</span>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-lg ${product.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock} in stock
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                 <Package className="w-16 h-16 text-text-secondary/20 mx-auto mb-4" />
                 <p className="text-text-secondary">Your inventory is empty</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
