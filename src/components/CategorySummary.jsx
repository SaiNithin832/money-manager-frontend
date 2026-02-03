import { useState, useEffect } from 'react';
import { getCategorySummary } from '../api';

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function CategorySummary() {
  const [summary, setSummary] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getCategorySummary(from || undefined, to || undefined);
      setSummary(data);
    } catch {
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 mb-3">Category Summary (Expense)</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-slate-600 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-2 py-1.5 border border-slate-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-2 py-1.5 border border-slate-300 rounded text-sm"
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Apply'}
          </button>
        </div>
      </div>
      <div className="p-4">
        {summary.length === 0 ? (
          <p className="text-slate-500 text-sm">No expense data in this period.</p>
        ) : (
          <ul className="space-y-2">
            {summary.map(({ category, total }) => (
              <li key={category} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="font-medium text-slate-700">{category}</span>
                <span className="text-red-600 font-semibold">{formatCurrency(total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
