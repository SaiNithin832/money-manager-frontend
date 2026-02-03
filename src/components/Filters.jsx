import { useState, useEffect } from 'react';
import { getFilter, getConstants } from '../api';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d) {
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

export default function Filters() {
  const [constants, setConstants] = useState({ categories: [], divisions: [] });
  const [category, setCategory] = useState('');
  const [division, setDivision] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] });
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getConstants().then(setConstants).catch(() => {});
  }, []);

  async function handleApply() {
    setLoading(true);
    setApplied(true);
    try {
      const result = await getFilter(category || undefined, division || undefined, from || undefined, to || undefined);
      setData(result);
    } catch {
      setData({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] });
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setCategory('');
    setDivision('');
    setFrom('');
    setTo('');
    setData({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] });
    setApplied(false);
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 mb-3">Filter Data</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white min-w-[120px]"
            >
              <option value="">All</option>
              {constants.categories?.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Division</label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white min-w-[100px]"
            >
              <option value="">All</option>
              {constants.divisions?.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Apply Filter'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>
      {applied && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-emerald-50 rounded p-2 text-center">
              <p className="text-xs text-emerald-700">Income</p>
              <p className="font-semibold text-emerald-800">{formatCurrency(data.totalIncome)}</p>
            </div>
            <div className="bg-red-50 rounded p-2 text-center">
              <p className="text-xs text-red-700">Expense</p>
              <p className="font-semibold text-red-800">{formatCurrency(data.totalExpense)}</p>
            </div>
            <div className="bg-slate-100 rounded p-2 text-center">
              <p className="text-xs text-slate-700">Balance</p>
              <p className="font-semibold text-slate-800">{formatCurrency(data.balance)}</p>
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.list.slice(0, 50).map((tx) => (
                  <tr key={tx._id} className="border-t border-slate-100">
                    <td className="p-2 text-slate-600">{formatDate(tx.dateTime)}</td>
                    <td className="p-2">{tx.type}</td>
                    <td className="p-2">{tx.category}</td>
                    <td className={`p-2 text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.list.length > 50 && (
              <p className="text-xs text-slate-500 p-2 text-center">Showing first 50 of {data.list.length}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
