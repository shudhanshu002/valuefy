import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wallet } from 'lucide-react';

const Holdings = ({ clientId = 'C001' }) => {
  const [holdings, setHoldings] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get(`/clients/${clientId}/holdings`)
      .then(res => {
        setHoldings(res.data);
        const sum = res.data.reduce((acc, h) => acc + h.currentValue, 0);
        setTotal(sum);
      })
      .catch(err => console.error("Holdings fetch error:", err));
  }, [clientId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center">
        <div>
          <p className="text-slate-400 font-medium mb-1">Total Portfolio Value</p>
          <h2 className="text-4xl font-bold">₹{total.toLocaleString('en-IN')}</h2>
        </div>
        <Wallet size={48} className="text-indigo-400 opacity-50" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-slate-600 font-semibold uppercase text-xs">Fund Name</th>
              <th className="p-4 text-right text-slate-600 font-semibold uppercase text-xs">Current Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holdings.map((h) => (
              <tr key={h._id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-800">{h.fundName}</td>
                <td className="p-4 text-right font-mono font-bold text-slate-900">
                  ₹{h.currentValue.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holdings;