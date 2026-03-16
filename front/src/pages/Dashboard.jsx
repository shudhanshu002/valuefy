import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ clientId = 'C001' }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`http://localhost:5000/api/rebalance/${clientId}`);
      setData(res.data);
    };
    fetchData();
  }, [clientId]);

  const handleSave = async () => {
    await axios.post('http://localhost:5000/api/rebalance/save', {
      clientId, totals: data.totals, analysis: data.analysis
    });
    alert("Rebalancing saved to History!");
  };

  if (!data) return <div className="p-10">Loading Amit's Portfolio...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portfolio Analysis</h1>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded shadow">SAVE REBALANCING</button>
      </div>

      <table className="w-full bg-white rounded shadow text-left overflow-hidden">
        <thead className="bg-gray-100 uppercase text-sm">
          <tr>
            <th className="p-4">Fund Name</th>
            <th className="p-4">Target %</th>
            <th className="p-4">Current %</th>
            <th className="p-4">Action</th>
            <th className="p-4">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {data.analysis.map(f => (
            <tr key={f.fundId} className="border-t">
              <td className="p-4 font-medium">{f.fundName}</td>
              <td className="p-4">{f.targetPct || '—'}%</td>
              <td className="p-4">{f.currentPct}%</td>
              <td className={`p-4 font-bold ${f.action === 'BUY' ? 'text-green-600' : f.action === 'SELL' ? 'text-red-600' : 'text-amber-600'}`}>
                {f.action}
              </td>
              <td className="p-4 font-mono">₹{parseFloat(f.amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-4 font-bold">
        <div className="p-4 bg-green-50 rounded">Total BUY: ₹{data.totals.totalToBuy.toLocaleString()}</div>
        <div className="p-4 bg-red-50 rounded">Total SELL: ₹{data.totals.totalToSell.toLocaleString()}</div>
        <div className="p-4 bg-blue-50 rounded">Fresh Money: ₹{data.totals.netCashNeeded.toLocaleString()}</div>
      </div>
    </div>
  );
};

export default Dashboard;