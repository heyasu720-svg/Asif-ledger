
import React, { useState } from 'react';
import { AppState, Expense } from '../types';

interface ExpenseModuleProps {
  state: AppState;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
}

const CATEGORIES_MAP: Record<string, string> = {
  'Rent': 'দোকান ভাড়া',
  'Utilities': 'বিদ্যুৎ/বিল',
  'Salaries': 'বেতন',
  'Supplies': 'মালামাল ক্রয়',
  'Marketing': 'মার্কেটিং',
  'Repairs': 'মেরামত',
  'Other': 'অন্যান্য'
};

const CATEGORIES = Object.keys(CATEGORIES_MAP);

const ExpenseModule: React.FC<ExpenseModuleProps> = ({ state, addExpense, deleteExpense }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Supplies',
    amount: 0,
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return;
    addExpense(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Supplies',
      amount: 0,
      description: ''
    });
    setShowModal(false);
  };

  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">খরচের হিসাব</h2>
          <p className="text-slate-500">আপনার দোকানের দৈনন্দিন খরচের হিসাব রাখুন।</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-rose-700 transition shadow-sm"
        >
          <i className="fas fa-plus mr-2"></i> খরচ যোগ করুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">তারিখ</th>
                  <th className="px-6 py-4">ক্যাটাগরি</th>
                  <th className="px-6 py-4">বিবরণ</th>
                  <th className="px-6 py-4 text-right">পরিমাণ</th>
                  <th className="px-6 py-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.expenses.slice().reverse().map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(e.date).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                        {CATEGORIES_MAP[e.category] || e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {e.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-rose-600">
                        ৳{e.amount.toLocaleString('bn-BD')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => {
                            if(confirm('এই খরচটি কি মুছতে চান?')) {
                              deleteExpense(e.id);
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
                {state.expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <i className="fas fa-wallet text-4xl mb-3 block"></i>
                      এখনো কোনো খরচ রেকর্ড করা হয়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">মোট খরচ</h4>
            <p className="text-3xl font-extrabold text-slate-800">৳{totalExpenses.toLocaleString('bn-BD')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4">ক্যাটাগরি অনুযায়ী খরচ</h4>
            <div className="space-y-3">
              {CATEGORIES.map(cat => {
                const amount = state.expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{CATEGORIES_MAP[cat]}</span>
                      <span className="text-slate-800">৳{amount.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">নতুন খরচ যোগ করুন</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">তারিখ</label>
                <input 
                  required
                  type="date" 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ক্যাটাগরি</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORIES_MAP[c]}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">পরিমাণ (৳)</label>
                <input 
                  required
                  type="number" 
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.amount || ''}
                  onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">বিবরণ</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
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
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
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

export default ExpenseModule;
