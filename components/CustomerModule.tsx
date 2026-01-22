
import React, { useState } from 'react';
import { AppState, Customer } from '../types';

interface CustomerModuleProps {
  state: AppState;
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerBalance: (id: string) => number;
}

const CustomerModule: React.FC<CustomerModuleProps> = ({ state, addCustomer, updateCustomer, deleteCustomer, getCustomerBalance }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    setFormData({ name: '', phone: '', address: '' });
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleShareWhatsApp = (customer: Customer, balance: number) => {
    const message = `আসসালামু আলাইকুম ${customer.name},\n\n"${state.shopName}" থেকে আপনার বর্তমান বাকির হিসাব:\n--------------------------\nমোট পাওনা: ৳${balance.toLocaleString('bn-BD')}\n--------------------------\nঅনুগ্রহ করে দ্রুত পরিশোধ করার চেষ্টা করবেন। ধন্যবাদ।`;
    const encodedMessage = encodeURIComponent(message);
    
    // Clean phone number and ensure Bangladesh country code if missing
    let cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01') && cleanPhone.length === 11) {
      cleanPhone = '88' + cleanPhone;
    }
    
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const filteredCustomers = state.customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">কাস্টমার তালিকা</h2>
          <p className="text-slate-500">কাস্টমার এবং তাদের বাকির হিসাব ম্যানেজ করুন।</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', phone: '', address: '' });
            setEditingCustomer(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> কাস্টমার যোগ করুন
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative max-w-sm">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">কাস্টমার</th>
                <th className="px-6 py-4">যোগাযোগ</th>
                <th className="px-6 py-4 text-right">মোট পাওনা/বাকি</th>
                <th className="px-6 py-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map(c => {
                const balance = getCustomerBalance(c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] leading-tight">
                        <p className="text-slate-800 font-medium">
                          <i className="fas fa-phone text-[10px] text-slate-400 mr-1"></i> {c.phone}
                        </p>
                        <p className="text-slate-500 truncate max-w-[150px]">
                          <i className="fas fa-location-dot text-[10px] text-slate-400 mr-1"></i> {c.address}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ৳{balance.toLocaleString('bn-BD')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => handleShareWhatsApp(c, balance)}
                          title="WhatsApp এ হিসাব পাঠান"
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        >
                          <i className="fab fa-whatsapp text-lg"></i>
                        </button>
                        <button 
                          onClick={() => {
                            setEditingCustomer(c);
                            setFormData({ name: c.name, phone: c.phone, address: c.address });
                            setShowModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('কাস্টমার ডিলিট করলে তার সব লেনদেন মুছে যাবে। আপনি কি নিশ্চিত?')) {
                              deleteCustomer(c.id);
                            }
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <i className="fas fa-users-slash text-4xl mb-3 block opacity-20"></i>
                    কোনো কাস্টমার পাওয়া যায়নি
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
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCustomer ? 'কাস্টমার আপডেট' : 'নতুন কাস্টমার যোগ'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">সম্পূর্ণ নাম *</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">মোবাইল নম্বর *</label>
                <input 
                  required
                  type="tel" 
                  placeholder="017xxxxxxxx"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ঠিকানা</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold shadow-md"
                >
                  {editingCustomer ? 'আপডেট করুন' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerModule;
