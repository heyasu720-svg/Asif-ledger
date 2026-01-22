
import React, { useState } from 'react';
import { AppState, Transaction, TransactionType } from '../types';

interface TransactionModuleProps {
  state: AppState;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionModule: React.FC<TransactionModuleProps> = ({ state, addTransaction, deleteTransaction }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    date: new Date().toISOString().split('T')[0],
    type: TransactionType.CREDIT_SALE,
    amount: 0,
    note: ''
  });

  const isFormValid = formData.customerId && formData.amount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("দয়া করে কাস্টমার সিলেক্ট করুন এবং টাকার পরিমাণ দিন।");
      return;
    }
    
    try {
      addTransaction(formData);
      setFormData({
        customerId: '',
        productId: '',
        date: new Date().toISOString().split('T')[0],
        type: TransactionType.CREDIT_SALE,
        amount: 0,
        note: ''
      });
      setShowModal(false);
    } catch (error) {
      console.error("Save failed", error);
      alert("লেনদেনটি সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই লেনদেনটি মুছতে চান?')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">লেনদেনের হিসাব</h2>
          <p className="text-slate-500">নগদ ও বাকি বিক্রয় এবং বাকির টাকা সংগ্রহের হিসাব রাখুন।</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> নতুন লেনদেন
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4">কাস্টমার</th>
                <th className="px-6 py-4">পণ্য</th>
                <th className="px-6 py-4">ধরন</th>
                <th className="px-6 py-4 text-right">পরিমাণ</th>
                <th className="px-6 py-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.transactions.slice().reverse().map(t => {
                const customer = state.customers.find(c => c.id === t.customerId);
                const product = state.products.find(p => p.id === t.productId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(t.date).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{customer?.name || 'অজানা'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 font-medium">
                        {product?.name || (t.type === TransactionType.PAYMENT_RECEIVED ? '---' : 'অজানা পণ্য')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        t.type === TransactionType.CREDIT_SALE ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                        t.type === TransactionType.CASH_SALE ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                        'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${
                        t.type === TransactionType.PAYMENT_RECEIVED ? 'text-emerald-600' : 'text-slate-800'
                      }`}>
                        {t.type === TransactionType.PAYMENT_RECEIVED ? '-' : '+'}৳{t.amount.toLocaleString('bn-BD')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-70 group-hover:opacity-100"
                          title="লেনদেন মুছুন"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {state.transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <i className="fas fa-receipt text-4xl mb-3 block opacity-20"></i>
                    এখনো কোনো লেনদেন রেকর্ড করা হয়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">লেনদেন রেকর্ড করুন</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">কাস্টমার সিলেক্ট করুন *</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                  value={formData.customerId}
                  onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">কাস্টমার বাছাই করুন...</option>
                  {state.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {formData.type !== TransactionType.PAYMENT_RECEIVED && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">পণ্য (গ্যাস) সিলেক্ট করুন</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white transition-all"
                    value={formData.productId}
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  >
                    <option value="">পণ্য বাছাই করুন...</option>
                    {state.products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">তারিখ</label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">লেনদেনের ধরন</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as TransactionType })}
                  >
                    <option value={TransactionType.CASH_SALE}>নগদ বিক্রয়</option>
                    <option value={TransactionType.CREDIT_SALE}>বাকি বিক্রয়</option>
                    <option value={TransactionType.PAYMENT_RECEIVED}>বাকি পরিশোধ</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">টাকার পরিমাণ (৳) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">৳</span>
                  <input 
                    required
                    type="number" 
                    min="1"
                    step="1"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    value={formData.amount || ''}
                    onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">নোট / বিবরণ</label>
                <textarea 
                  rows={2}
                  placeholder="অতিরিক্ত তথ্য (ঐচ্ছিক)..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData.note}
                  onChange={e => setFormData({ ...formData, note: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  disabled={!isFormValid}
                  className={`flex-1 px-4 py-2.5 rounded-lg transition font-bold shadow-md ${
                    isFormValid 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
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

export default TransactionModule;
