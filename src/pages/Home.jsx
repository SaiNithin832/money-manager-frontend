import { useState, useEffect } from 'react';
import { getMe } from '../api';
import Dashboard from '../components/Dashboard';
import AddTransactionModal from '../components/AddTransactionModal';
import CategorySummary from '../components/CategorySummary';
import AccountTransfer from '../components/AccountTransfer';
import Filters from '../components/Filters';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getMe().then((d) => setUser(d.user)).catch(() => {});
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  function onTransactionAdded() {
    setShowAddModal(false);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Money Manager</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Home</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
          >
            + Add Income / Expense
          </button>
        </div>

        <Dashboard key={refreshKey} />
        <Filters key={`filters-${refreshKey}`} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategorySummary key={`cat-${refreshKey}`} />
          <AccountTransfer key={`acc-${refreshKey}`} onTransfer={() => setRefreshKey((k) => k + 1)} />
        </div>
      </main>

      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSaved={onTransactionAdded}
        />
      )}
    </div>
  );
}
