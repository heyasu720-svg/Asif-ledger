
import React, { useMemo, useState } from 'react';
import { AppState, TransactionType } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { getBusinessInsights } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
  getCustomerBalance: (id: string) => number;
}

const Dashboard: React.FC<DashboardProps> = ({ state, getCustomerBalance }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const metrics = useMemo(() => {
    const totalDues = state.customers.reduce((acc, c) => acc + getCustomerBalance(c.id), 0);
    const totalSales = state.transactions
      .filter(t => t.type === TransactionType.CREDIT_SALE || t.type === TransactionType.CASH_SALE)
      .reduce((acc, t) => acc + t.amount, 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayCashSales = state.transactions
      .filter(t => t.date === todayStr && t.type === TransactionType.CASH_SALE)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const todayPayments = state.transactions
      .filter(t => t.date === todayStr && t.type === TransactionType.PAYMENT_RECEIVED)
      .reduce((acc, t) => acc + t.amount, 0);

    const todayExpenses = state.expenses
      .filter(e => e.date === todayStr)
      .reduce((acc, e) => acc + e.amount, 0);

    return { totalDues, totalSales, todayCashSales, todayExpenses, todayPayments };
  }, [state, getCustomerBalance]);

  const handleEmailReport = () => {
    const today = new Date().toLocaleDateString('bn-BD');
    const subject = `${state.shopName} - ব্যবসার রিপোর্ট (${today})`;
    const body = `আসসালামু আলাইকুম,\n\n"${state.shopName}" এর আজকের (${today}) সারাংশ:\n\n` +
      `১. আজকের নগদ বিক্রয়: ৳${metrics.todayCashSales}\n` +
      `২. আজকের আদায়: ৳${metrics.todayPayments}\n` +
      `৩. আজকের খরচ: ৳${metrics.todayExpenses}\n` +
      `৪. মোট বকেয়া পাওনা: ৳${metrics.totalDues}\n\n` +
      `ধন্যবাদ।`;
    
    const mailtoUrl = `mailto:${state.user?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const sales = state.transactions
        .filter(t => t.date === date && (t.type === TransactionType.CREDIT_SALE || t.type === TransactionType.CASH_SALE))
        .reduce((acc, t) => acc + t.amount, 0);
      const expenses = state.expenses
        .filter(e => e.date === date)
        .reduce((acc, e) => acc + e.amount, 0);
      return { 
        name: new Date(date).toLocaleDateString('bn-BD', { weekday: 'short' }), 
        বিক্রয়: sales, 
        খরচ: expenses 
      };
    });
  }, [state]);

  const handleGetInsight = async () => {
    setLoadingInsight(true);
    try {
      const text = await getBusinessInsights(state);
      setInsight(text || "বর্তমানে কোনো পরামর্শ পাওয়া যায়নি।");
    } catch (error) {
      setInsight("পরামর্শ পেতে সমস্যা হচ্ছে।");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{state.shopName} - ড্যাশবোর্ড</h2>
          <p className="text-slate-500">আপনার ব্যবসার নিয়মিত আপডেট এখান থেকে দেখুন।</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleEmailReport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md"
          >
            <i className="fas fa-envelope"></i> জিমেইল রিপোর্ট
          </button>
          <button 
            onClick={handleGetInsight}
            disabled={loadingInsight}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
          >
            {loadingInsight ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            AI পরামর্শ
          </button>
        </div>
      </header>

      {insight && (
        <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl relative">
          <button onClick={() => setInsight(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
            <i className="fas fa-times"></i>
          </button>
          <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <i className="fas fa-robot"></i> AI বিশ্লেষণ
          </h4>
          <p className="text-indigo-800 text-sm whitespace-pre-wrap">{insight}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="মোট বিক্রয়" value={`৳${metrics.totalSales.toLocaleString('bn-BD')}`} icon="fa-chart-simple" color="bg-purple-500" />
        <StatCard label="মোট বকেয়া" value={`৳${metrics.totalDues.toLocaleString('bn-BD')}`} icon="fa-hand-holding-dollar" color="bg-orange-500" />
        <StatCard label="আজকের নগদ" value={`৳${metrics.todayCashSales.toLocaleString('bn-BD')}`} icon="fa-money-bill-1" color="bg-indigo-500" />
        <StatCard label="আজকের আদায়" value={`৳${metrics.todayPayments.toLocaleString('bn-BD')}`} icon="fa-money-bill-trend-up" color="bg-green-500" />
        <StatCard label="আজকের খরচ" value={`৳${metrics.todayExpenses.toLocaleString('bn-BD')}`} icon="fa-receipt" color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-line text-blue-500"></i> সাপ্তাহিক চিত্র (৳)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip formatter={(value: number) => [`৳${value.toLocaleString('bn-BD')}`]} />
                <Legend iconType="circle" />
                <Bar dataKey="বিক্রয়" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="খরচ" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-clock-rotate-left text-slate-400"></i> সাম্প্রতিক লেনদেন
          </h3>
          <div className="space-y-4">
            {state.transactions.slice(-5).reverse().map(t => {
              const customer = state.customers.find(c => c.id === t.customerId);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${t.type === TransactionType.PAYMENT_RECEIVED ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <i className="fas fa-money-bill"></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{customer?.name || 'অজানা'}</p>
                    <p className="text-[10px] text-slate-500">{t.type}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">৳{t.amount.toLocaleString('bn-BD')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-2">
    <div className={`${color} p-2 rounded-lg text-white`}>
      <i className={`fas ${icon} text-base`}></i>
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <h3 className="text-lg font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
