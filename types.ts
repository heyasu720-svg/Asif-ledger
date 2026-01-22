
export enum TransactionType {
  CREDIT_SALE = 'বাকি বিক্রয়',
  PAYMENT_RECEIVED = 'বাকি পরিশোধ',
  CASH_SALE = 'নগদ বিক্রয়'
}

export interface Product {
  id: string;
  name: string;
  defaultPrice: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  customerId: string;
  productId?: string;
  date: string;
  type: TransactionType;
  amount: number;
  note: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export interface AppState {
  shopName: string;
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  user?: UserProfile;
}
