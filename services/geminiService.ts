import { GoogleGenAI } from "@google/genai";
import { AppState, TransactionType } from "../types";

export const getBusinessInsights = async (state: AppState) => {
  // Initialize AI client with required API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
    Act as a professional retail business consultant for a shop named "${state.shopName}" in Bangladesh. 
    Analyze this business ledger data and provide 3-4 concise, actionable insights or tips for the owner in BENGALI language.
    
    Data Summary:
    - Number of Customers: ${state.customers.length}
    - Total Cash Sales: ৳${cashSalesTotal}
    - Total Credit Sales: ৳${creditSalesTotal}
    - Total Outstanding Dues: ৳${totalOutstanding}
    - Total Operational Expenses: ৳${totalExpenses}
    
    Focus on Sales balance, Credit collection and Expense control.
    Format the response in BENGALI as clear, bulleted points. Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "You are a helpful business assistant for small retailers in Bangladesh. You speak only in Bengali.",
      },
    });

    // Access .text property directly as per latest SDK
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};