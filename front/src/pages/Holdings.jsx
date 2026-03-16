import React, { useState, useEffect } from 'react';
import api from '../api';

const Holdings = ({ clientId = 'C001' }) => {
  const [holdings, setHoldings] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get(`/clients/${clientId}/holdings`).then(res => {
      setHoldings(res.data);
      const sum = res.data.reduce((acc, h) => acc + h.currentValue, 0);
      setTotal(sum);
    });
  }, [clientId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl">
        <div>
          <h2 className="text-slate-400 font-medium mb-2">Total Portfolio Value</h2>
          <p className="text-4xl font-bold">₹{total.toLocaleString('en-IN')}</p>
        </div>
        <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">💰</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-slate-600 font-semibold">Fund Name</th>
              <th className="p-4 text-right text-slate-600 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {holdings.map((h) => (
              <tr key={h._id}>
                <td className="p-4 text-slate-800 font-medium">{h.fundName}</td>
                <td className="p-4 text-right font-mono text-slate-700 font-semibold">₹{h.currentValue.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holdings;