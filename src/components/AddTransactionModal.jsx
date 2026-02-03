import { useState, useEffect } from 'react';
import { addTransaction, getConstants, getAccounts, createAccount } from '../api';

const ACCOUNTS = ['Cash', 'Bank', 'Wallet'];

export default function AddTransactionModal({ onClose, onSaved }) {
  const [tab, setTab] = useState('income');
  const [amount, setAmount] = useState('');
  const [dateTime, setDateTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [division, setDivision] = useState('');
  const [account, setAccount] = useState('Cash');
  const [constants, setConstants] = useState({ categories: [], divisions: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getConstants().then(setConstants).catch(() => {});
    getAccounts().then((list) => {
      if (list.length === 0) {
        ACCOUNTS.forEach((name) => createAccount(name).catch(() => {}));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setCategory(constants.categories[0] || '');
    setDivision(constants.divisions[0] || '');
  }, [constants]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (!category || !division) {
      setError('Select category and division');
      return;
    }
    setLoading(true);
    try {
      await addTransaction({
        type: tab,
        amount: num,
        category,
        division,
        description: description.trim(),
        dateTime: new Date(dateTime).toISOString(),
        account,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Add Income / Expense</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('income')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'income' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setTab('expense')}
            className={`flex-1 py-3 text-sm font-medium ${tab === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. 5000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (one line)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g. Office fuel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              {constants.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Division</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              {constants.divisions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              {ACCOUNTS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2.5 font-medium rounded-lg transition ${tab === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
