
import React, { useState } from 'react';
import { AppState, Product } from '../types';

interface ProductModuleProps {
  state: AppState;
  addProduct: (p: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
}

const ProductModule: React.FC<ProductModuleProps> = ({ state, addProduct, deleteProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', defaultPrice: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    addProduct(formData);
    setFormData({ name: '', defaultPrice: 0 });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">পণ্য তালিকা (গ্যাস সিলিন্ডার)</h2>
          <p className="text-slate-500">আপনার দোকানের পণ্যগুলো এখানে ম্যানেজ করুন।</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          <i className="fas fa-plus mr-2"></i> নতুন পণ্য যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">পণ্যের নাম</th>
                <th className="px-6 py-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <i className="fas fa-gas-pump"></i>
                      </div>
                      <span className="font-semibold text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => {
                          if(confirm('এই পণ্যটি মুছতে চান?')) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {state.products.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-slate-400">
                    <i className="fas fa-box-open text-4xl mb-3 block"></i>
                    কোনো পণ্য পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">নতুন পণ্য যোগ করুন</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">পণ্যের নাম</label>
                <input 
                  required
                  type="text" 
                  placeholder="যেমন: গ্যাস ৫ কেজি"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModule;
