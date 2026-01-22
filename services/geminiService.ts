import { GoogleGenAI } from "@google/genai";
import { AppState, TransactionType } from "../types";

export const getBusinessInsights = async (state: AppState) => {
  // এপিআই ক্লায়েন্ট ইনিশিয়ালাইজেশন - এনভায়রনমেন্ট ভ্যারিয়েবল থেকে কি নেবে
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const totalOutstanding = state.customers.reduce((acc, c) => {
    const bal = state.transactions
      .filter(t => t.customerId === c.id)
      .reduce((ta, t) => {
        if (t.type === TransactionType.CREDIT_SALE) return ta + t.amount;
        if (t.type === TransactionType.PAYMENT_RECEIVED) return ta - t.amount;
        return ta;
      }, 0);
    return acc + bal;
  }, 0);

  const cashSalesTotal = state.transactions
    .filter(t => t.type === TransactionType.CASH_SALE)
    .reduce((acc, t) => acc + t.amount, 0);

  const creditSalesTotal = state.transactions
    .filter(t => t.type === TransactionType.CREDIT_SALE)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = state.expenses.reduce((acc, e) => acc + e.amount, 0);

  const prompt = `
    দোকানের নাম: "${state.shopName}"
    ডাটা বিশ্লেষণ করে ৩-৪টি গুরুত্বপূর্ণ ব্যবসায়িক পরামর্শ বাংলায় দিন:
    
    - মোট কাস্টমার: ${state.customers.length} জন
    - মোট নগদ বিক্রয়: ৳${cashSalesTotal}
    - মোট বাকি বিক্রয়: ৳${creditSalesTotal}
    - বর্তমান মোট পাওনা: ৳${totalOutstanding}
    - মোট খরচ: ৳${totalExpenses}
    
    পরামর্শগুলো ছোট ছোট পয়েন্টে এবং উৎসাহমূলক হবে যাতে ব্যবসার উন্নতি হয়।
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "আপনি একজন দক্ষ ক্ষুদ্র ব্যবসায়িক উপদেষ্টা। আপনার সব উত্তর বাংলায় এবং সহজবোধ্য হতে হবে।",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "দুঃখিত, এই মুহূর্তে AI পরামর্শ দিতে পারছে না। ইন্টারনেটে সমস্যা থাকতে পারে।";
  }
};