/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, List, Search, Plus, Trash2, Edit2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import React from 'react';
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

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Groceries'
  });

  const categories = ['Groceries', 'Fruits', 'Vegetables', 'Bakery', 'Dairy', 'Snacks', 'Beverages'];

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    await addProduct({
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock) || 0,
      vendorId: partnerId
    });

    setNewProduct({ name: '', description: '', price: '', stock: '', category: 'Groceries' });
    setShowForm(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const renderProductList = () => (
    <div className="space-y-4">
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500 text-white p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center shadow-lg shadow-green-500/20"
          >
            Product Published Successfully
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between px-2">
        <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary">Stock Inventory</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-accent text-white p-2.5 rounded-2xl shadow-lg shadow-accent/20 active:scale-90 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/40" />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {products.length > 0 ? (
            products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-4 rounded-[2rem] border border-gray-50 shadow-sm flex items-center space-x-4 active:bg-gray-50 transition-colors"
              >
                <div className="w-16 h-16 bg-secondary rounded-[1.2rem] flex items-center justify-center text-primary/30 font-bold text-xl">
                  {product.name[0]}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-accent/60 mb-0.5">{product.category}</span>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-red-400 active:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-sm truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-poppins font-bold">Rs. {product.price}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${product.stock < 10 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {product.stock} units
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center opacity-40">
               <Package className="w-12 h-12 mx-auto mb-4" />
               <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Warehouse Empty</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderAddForm = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-3 mb-2">
        <button 
          onClick={() => setShowForm(false)}
          className="p-2 bg-secondary rounded-xl active:scale-90 transition-transform"
        >
          <List className="w-5 h-5 text-primary" />
        </button>
        <h2 className="text-lg font-poppins font-bold">New Product</h2>
      </div>

      <form onSubmit={handleCreateProduct} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-2">Product Name</label>
          <input 
            type="text" 
            placeholder="e.g. Fresh Milk 1L"
            required
            value={newProduct.name}
            onChange={e => setNewProduct({...newProduct, name: e.target.value})}
            className="w-full bg-white border border-gray-100 rounded-3xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-2">Price (Rs)</label>
            <input 
              type="number" 
              placeholder="0.00"
              required
              value={newProduct.price}
              onChange={e => setNewProduct({...newProduct, price: e.target.value})}
              className="w-full bg-white border border-gray-100 rounded-3xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-2">Stock Level</label>
            <input 
              type="number" 
              placeholder="0"
              required
              value={newProduct.stock}
              onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
              className="w-full bg-white border border-gray-100 rounded-3xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setNewProduct({...newProduct, category: cat})}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider ${
                  newProduct.category === cat 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-white border border-gray-100 text-text-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-2">Description</label>
          <textarea 
            placeholder="Short details about the product..."
            rows={3}
            value={newProduct.description}
            onChange={e => setNewProduct({...newProduct, description: e.target.value})}
            className="w-full bg-white border border-gray-100 rounded-3xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-accent text-white py-5 rounded-3xl font-bold shadow-xl shadow-accent/20 active:scale-95 transition-all mt-4"
        >
          Publish Product
        </button>
      </form>
    </motion.div>
  );

  return (
    <div className="px-5 py-6">
      <AnimatePresence mode="wait">
        {showForm ? renderAddForm() : renderProductList()}
      </AnimatePresence>
    </div>
  );
}
