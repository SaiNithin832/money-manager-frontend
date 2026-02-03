import { useState, useEffect } from 'react';
import { getMonthly, getWeekly, getYearly, canEdit, editTransaction } from '../api';
import { getConstants } from '../api';

const REPORT_TYPES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'yearly', label: 'Yearly' },
];

function formatDate(d) {
  return new Date(d).toLocaleString('en-IN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const [reportType, setReportType] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(getISOWeek(new Date()));
  const [data, setData] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [constants, setConstants] = useState({ categories: [], divisions: [] });

  function getISOWeek(d) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    const jan1 = new Date(date.getFullYear(), 0, 1);
    return Math.ceil(((date - jan1) / 86400000 + 1) / 7);
  }

  const years = Array.from({ length: 5 }, (_, i) => year - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const weeks = Array.from({ length: 53 }, (_, i) => i + 1);

  useEffect(() => {
    getConstants().then(setConstants).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    if (reportType === 'monthly') {
      getMonthly(year, month).then(setData).catch(() => setData({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] })).finally(() => setLoading(false));
    } else if (reportType === 'weekly') {
      getWeekly(year, week).then(setData).catch(() => setData({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] })).finally(() => setLoading(false));
    } else {
      getYearly(year).then(setData).catch(() => setData({ totalIncome: 0, totalExpense: 0, balance: 0, list: [] })).finally(() => setLoading(false));
    }
  }, [reportType, year, month, week]);


  async function startEdit(tx) {
    const allowed = await canEdit(tx._id);
    if (!allowed) {
      alert('Editing allowed only within 12 hours of creation.');
      return;
    }
    setEditingId(tx._id);
    setEditForm({
      amount: tx.amount,
      category: tx.category,
      division: tx.division,
      description: tx.description,
      dateTime: new Date(tx.dateTime).toISOString().slice(0, 16),
      account: tx.account,
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      await editTransaction(editingId, editForm);
      setEditingId(null);
      setEditForm({});
      if (reportType === 'monthly') getMonthly(year, month).then(setData);
      else if (reportType === 'weekly') getWeekly(year, week).then(setData);
      else getYearly(year).then(setData);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800 mb-3">Dashboard</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
          >
            {REPORT_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {reportType === 'monthly' && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
            >
              {months.map((m) => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          )}
          {reportType === 'weekly' && (
            <select
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white"
            >
              {weeks.map((w) => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <p className="text-sm font-medium text-emerald-700">Total Income</p>
              <p className="text-xl font-bold text-emerald-800">{formatCurrency(data.totalIncome)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-sm font-medium text-red-700">Total Expense</p>
              <p className="text-xl font-bold text-red-800">{formatCurrency(data.totalExpense)}</p>
            </div>
            <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700">Balance</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(data.balance)}</p>
            </div>
          </div>

          <div className="px-4 pb-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">History (Income & Expense)</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              {data.list.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">No transactions in this period.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 text-slate-600 font-medium">
                    <tr>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Division</th>
                      <th className="text-left p-2">Description</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.list.map((tx) => (
                      <tr key={tx._id} className="border-t border-slate-100 hover:bg-slate-50">
                        {editingId === tx._id ? (
                          <>
                            <td colSpan={7} className="p-2 bg-amber-50">
                              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                                <input
                                  type="number"
                                  value={editForm.amount}
                                  onChange={(e) => setEditForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                                  className="px-2 py-1 border rounded"
                                  placeholder="Amount"
                                />
                                <input
                                  type="datetime-local"
                                  value={editForm.dateTime}
                                  onChange={(e) => setEditForm((f) => ({ ...f, dateTime: e.target.value }))}
                                  className="px-2 py-1 border rounded"
                                />
                                <input
                                  value={editForm.description}
                                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                  className="px-2 py-1 border rounded"
                                  placeholder="Description"
                                />
                                <select
                                  value={editForm.category}
                                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                                  className="px-2 py-1 border rounded"
                                >
                                  {constants.categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                                <select
                                  value={editForm.division}
                                  onChange={(e) => setEditForm((f) => ({ ...f, division: e.target.value }))}
                                  className="px-2 py-1 border rounded"
                                >
                                  {constants.divisions.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                                <div className="flex gap-1">
                                  <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">Save</button>
                                  <button onClick={() => { setEditingId(null); setEditForm({}); }} className="px-2 py-1 bg-slate-400 text-white rounded text-xs">Cancel</button>
                                </div>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 text-slate-600">{formatDate(tx.dateTime)}</td>
                            <td className="p-2">
                              <span className={tx.type === 'income' ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-2 text-slate-700">{tx.category}</td>
                            <td className="p-2 text-slate-700">{tx.division}</td>
                            <td className="p-2 text-slate-600 max-w-[120px] truncate" title={tx.description}>{tx.description || '-'}</td>
                            <td className="p-2 text-right font-medium">
                              <span className={tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </span>
                            </td>
                            <td className="p-2">
                              <button
                                onClick={() => startEdit(tx)}
                                className="text-xs text-emerald-600 hover:underline"
                              >
                                Edit
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
