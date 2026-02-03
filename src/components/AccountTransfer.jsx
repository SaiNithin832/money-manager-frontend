import { useState, useEffect } from 'react';
import { getAccounts, transfer, createAccount } from '../api';

const DEFAULT_ACCOUNTS = ['Cash', 'Bank', 'Wallet'];

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function AccountTransfer({ onTransfer }) {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadAccounts() {
    try {
      let list = await getAccounts();
      if (list.length === 0) {
        for (const name of DEFAULT_ACCOUNTS) {
          await createAccount(name).catch(() => {});
        }
        list = await getAccounts();
      }
      setAccounts(list);
      if (list.length && !fromAccount) setFromAccount(list[0].accountName);
      if (list.length >= 2 && !toAccount) setToAccount(list[1].accountName);
    } catch {
      setAccounts([]);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleTransfer(e) {
    e.preventDefault();
    setError('');
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (fromAccount === toAccount) {
      setError('Source and destination must be different');
      return;
    }
    setLoading(true);
    try {
      await transfer(fromAccount, toAccount, num);
      setAmount('');
      loadAccounts();
      onTransfer?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 mb-2">Account Transactions</h3>
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div key={acc._id} className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{acc.accountName}</span>
              <span className="font-semibold text-slate-800">{formatCurrency(acc.balance)}</span>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-slate-500 text-sm">No accounts yet. Add income/expense to see balances.</p>}
        </div>
      </div>
      <div className="p-4 border-t border-slate-200">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Transfer between accounts</h4>
        <form onSubmit={handleTransfer} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {accounts.map((a) => (
                <option key={a._id} value={a.accountName}>{a.accountName}</option>
              ))}
            </select>
            <span className="text-slate-500">→</span>
            <select
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {accounts.map((a) => (
                <option key={a._id} value={a.accountName}>{a.accountName}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (₹)"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || accounts.length < 2}
            className="w-full py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </button>
        </form>
      </div>
    </section>
  );
}
