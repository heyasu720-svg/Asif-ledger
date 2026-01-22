
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppState, Customer, Transaction, Expense, TransactionType, Product, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import CustomerModule from './components/CustomerModule';
import TransactionModule from './components/TransactionModule';
import ExpenseModule from './components/ExpenseModule';
import ProductModule from './components/ProductModule';

const STORAGE_KEY = 'retail_ledger_data';
const DEFAULT_SHOP_NAME = 'লেজার প্রো';

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'gas-12', name: 'গ্যাস ১২ কেজি', defaultPrice: 0 },
  { id: 'gas-35', name: 'গ্যাস ৩৫ কেজি', defaultPrice: 0 },
  { id: 'gas-45', name: 'গ্যাস ৪৫ কেজি', defaultPrice: 0 },
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          shopName: parsed.shopName || DEFAULT_SHOP_NAME,
          customers: parsed.customers || [],
          products: parsed.products || DEFAULT_PRODUCTS,
          transactions: parsed.transactions || [],
          expenses: parsed.expenses || [],
          user: parsed.user
        };
      } catch (e) {
        console.error("Failed to parse storage", e);
      }
    }
    return { 
      shopName: DEFAULT_SHOP_NAME, 
      customers: [], 
      products: DEFAULT_PRODUCTS, 
      transactions: [], 
      expenses: [] 
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateShopName = (name: string) => {
    setState(prev => ({ ...prev, shopName: name }));
  };

  const setUser = (user: UserProfile | undefined) => {
    setState(prev => ({ ...prev, user }));
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: Date.now(),
    };
    setState(prev => ({ ...prev, customers: [...prev.customers, newCustomer] }));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
    };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
    };
    setState(prev => ({ ...prev, transactions: [...prev.transactions, newTransaction] }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: generateId(),
    };
    setState(prev => ({ ...prev, expenses: [...prev.expenses, newExpense] }));
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCustomer = (id: string) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id),
      transactions: prev.transactions.filter(t => t.customerId !== id)
    }));
  };

  const deleteTransaction = (id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const deleteExpense = (id: string) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (file) {
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed.customers && parsed.transactions) {
            if (window.confirm("রিস্টোর করলে বর্তমান সব ডাটা মুছে যাবে। আপনি কি নিশ্চিত?")) {
              setState(parsed);
              alert("ডাটা সফলভাবে রিস্টোর হয়েছে!");
            }
          }
        } catch (error) {
          alert("ডাটা রিস্টোর করতে সমস্যা হয়েছে।");
        }
      };
      fileReader.readAsText(file);
    }
  };

  const getCustomerBalance = (customerId: string) => {
    const customerTransactions = state.transactions.filter(t => t.customerId === customerId);
    return customerTransactions.reduce((acc, t) => {
      if (t.type === TransactionType.CREDIT_SALE) return acc + t.amount;
      if (t.type === TransactionType.PAYMENT_RECEIVED) return acc - t.amount;
      return acc;
    }, 0);
  };

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
        <Sidebar 
          state={state}
          updateShopName={updateShopName} 
          onExport={exportData}
          onImport={importData}
          setUser={setUser}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={
              <Dashboard state={state} getCustomerBalance={getCustomerBalance} />
            } />
            <Route path="/customers" element={
              <CustomerModule 
                state={state} 
                addCustomer={addCustomer} 
                updateCustomer={updateCustomer} 
                deleteCustomer={deleteCustomer}
                getCustomerBalance={getCustomerBalance}
              />
            } />
            <Route path="/products" element={
              <ProductModule 
                state={state} 
                addProduct={addProduct} 
                deleteProduct={deleteProduct}
              />
            } />
            <Route path="/transactions" element={
              <TransactionModule 
                state={state} 
                addTransaction={addTransaction} 
                deleteTransaction={deleteTransaction}
              />
            } />
            <Route path="/expenses" element={
              <ExpenseModule 
                state={state} 
                addExpense={addExpense} 
                deleteExpense={deleteExpense}
              />
            } />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

interface SidebarProps {
  state: AppState;
  updateShopName: (name: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setUser: (user: UserProfile | undefined) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ state, updateShopName, onExport, onImport, setUser }) => {
  const location = useLocation();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.shopName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: "DUMMY_CLIENT_ID",
        callback: (response: any) => {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          setUser({
            name: payload.name,
            email: payload.email,
            picture: payload.picture
          });
        }
      });
    }
  }, []);

  const handleGoogleLogin = () => {
    (window as any).google?.accounts.id.prompt();
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      updateShopName(trimmed);
      setIsEditingName(false);
    } else {
      setTempName(state.shopName);
      setIsEditingName(false);
    }
  };

  const handleCancelName = () => {
    setTempName(state.shopName);
    setIsEditingName(false);
  };

  const NavItem = ({ to, icon, label }: { to: string, icon: string, label: string }) => (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive(to) 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      <i className={`fas ${icon} w-5`}></i>
      <span className="font-medium">{label}</span>
    </Link>
  );

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 sticky top-0 h-fit md:h-screen">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3 px-2">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <i className="fas fa-store text-xl"></i>
          </div>
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex flex-col gap-2">
                <input 
                  autoFocus
                  className="text-sm font-bold border rounded px-2 py-1.5 outline-blue-500 w-full bg-slate-50"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelName();
                  }}
                />
                <div className="flex gap-1">
                  <button 
                    onClick={handleSaveName}
                    className="flex-1 bg-blue-600 text-white text-[10px] py-1 rounded font-bold hover:bg-blue-700"
                  >
                    সেভ
                  </button>
                  <button 
                    onClick={handleCancelName}
                    className="flex-1 bg-slate-200 text-slate-600 text-[10px] py-1 rounded font-bold hover:bg-slate-300"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
                  {state.shopName}
                </h1>
                <button 
                  onClick={() => {
                    setTempName(state.shopName);
                    setIsEditingName(true);
                  }} 
                  className="text-slate-400 hover:text-blue-600 p-1 flex-shrink-0 ml-1 transition-colors"
                  title="দোকানের নাম পরিবর্তন করুন"
                >
                  <i className="fas fa-pen text-[10px]"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <nav className="flex flex-col gap-1">
        <NavItem to="/" icon="fa-chart-pie" label="ড্যাশবোর্ড" />
        <NavItem to="/customers" icon="fa-users" label="কাস্টমার" />
        <NavItem to="/products" icon="fa-gas-pump" label="পণ্য (গ্যাস)" />
        <NavItem to="/transactions" icon="fa-exchange-alt" label="লেনদেন" />
        <NavItem to="/expenses" icon="fa-wallet" label="খরচ" />
      </nav>

      <div className="mt-auto space-y-4">
        {state.user ? (
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
            <img src={state.user.picture} alt="Profile" className="w-8 h-8 rounded-full border border-blue-200" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-900 truncate">{state.user.name}</p>
              <p className="text-[10px] text-blue-700 truncate">{state.user.email}</p>
            </div>
            <button onClick={() => setUser(undefined)} className="ml-auto text-blue-400 hover:text-red-500">
              <i className="fas fa-sign-out-alt text-xs"></i>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="G" />
            জিমেইল দিয়ে লগইন
          </button>
        )}

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <button onClick={onExport} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <i className="fas fa-download w-4"></i> ব্যাকআপ ফাইল
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <i className="fas fa-upload w-4"></i> ডাটা রিস্টোর
          </button>
          <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
        </div>
      </div>
    </aside>
  );
};

export default App;
