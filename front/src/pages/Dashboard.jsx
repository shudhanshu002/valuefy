import React, { useState, useEffect } from 'react';
import api from '../api';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

const Dashboard = ({ clientId = 'C001' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await api.get(`/rebalance/${clientId}`);
        setData(res.data);
      } catch (err) {
        console.error("Analysis failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [clientId]);

  const handleSave = async () => {
    await api.post('/rebalance/save', {
      clientId,
      analysis: data.analysis,
      totals: data.totals
    });
    alert("Rebalancing session saved!");
  };

  if (loading) return <div className="p-10 text-center">Calculating Portfolio Drift...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Portfolio Analysis</h1>
          <p className="text-slate-500">Comparing current holdings to recommended model</p>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
        >
          Save Session
        </button>
      </div>

      {/* Analysis Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Fund Name</th>
              <th className="p-4 font-semibold">Target %</th>
              <th className="p-4 font-semibold">Current %</th>
              <th className="p-4 font-semibold">Drift</th>
              <th className="p-4 font-semibold">Action</th>
              <th className="p-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.analysis.map((fund) => (
              <tr key={fund.fundId} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{fund.fundName}</td>
                <td className="p-4 text-slate-600">{fund.targetPct ? `${fund.targetPct}%` : '—'}</td>
                <td className="p-4 text-slate-600">{fund.currentPct}%</td>
                <td className={`p-4 font-bold ${parseFloat(fund.drift) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {fund.drift ? `${fund.drift}%` : '—'}
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    fund.action === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 
                    fund.action === 'SELL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {fund.action === 'BUY' && <ArrowUpCircle size={14} />}
                    {fund.action === 'SELL' && <ArrowDownCircle size={14} />}
                    {fund.action === 'REVIEW' && <AlertCircle size={14} />}
                    {fund.action}
                  </span>
                </td>
                <td className="p-4 text-right font-mono font-semibold text-slate-700">
                  ₹{parseFloat(fund.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Total to Buy" value={data.totals.totalToBuy} color="emerald" />
        <SummaryCard label="Total to Sell" value={data.totals.totalToSell} color="rose" />
        <SummaryCard label="Net Cash Needed" value={data.totals.netCashNeeded} color="indigo" />
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => (
  <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 ${
    color === 'emerald' ? 'border-l-emerald-500' : color === 'rose' ? 'border-l-rose-500' : 'border-l-indigo-500'
  }`}>
    <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
    <p className={`text-2xl font-bold ${
      color === 'emerald' ? 'text-emerald-600' : color === 'rose' ? 'text-rose-600' : 'text-indigo-600'
    }`}>
      ₹{parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
    </p>
  </div>
);

export default Dashboard;