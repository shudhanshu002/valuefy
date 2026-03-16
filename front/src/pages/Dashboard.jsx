import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ clientId = 'C001' }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get(`/rebalance/${clientId}`);
      setData(res.data);
    };
    fetchData();
  }, [clientId]);

  const handleSave = async () => {
    try {
      await api.post('/rebalance/save', {
        clientId,
        totals: data.totals,
        analysis: data.analysis
      });
      alert("Session saved to MongoDB Atlas!");
    } catch (err) {
      alert("Error saving session: " + err.message);
    }
  };

  if (!data) return <div className="p-10 text-center">Calculating Portfolio Drift...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portfolio Rebalancing</h1>
        <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition">
          <Save size={18} /> SAVE REBALANCING
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-slate-600 text-sm uppercase">
              <th className="p-4">Fund Name</th>
              <th className="p-4">Target %</th>
              <th className="p-4">Current %</th>
              <th className="p-4">Action</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.analysis.map((fund, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{fund.fundName}</td>
                <td className="p-4">{fund.targetPct ? `${fund.targetPct}%` : '—'}</td>
                <td className="p-4">{fund.currentPct}%</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    fund.action === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 
                    fund.action === 'SELL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {fund.action}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-bold">₹{parseFloat(fund.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Totals Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total BUY</p>
          <p className="text-2xl font-bold text-emerald-600">₹{parseFloat(data.totals.totalToBuy).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total SELL</p>
          <p className="text-2xl font-bold text-rose-600">₹{parseFloat(data.totals.totalToSell).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
          <p className="text-sm text-slate-500 mb-1">Fresh Money Needed</p>
          <p className="text-2xl font-bold text-indigo-600">₹{parseFloat(data.totals.netCashNeeded).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;