import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save, AlertCircle } from 'lucide-react';

const EditModel = () => {
  const [funds, setFunds] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/model-funds').then(res => {
      setFunds(res.data);
      calculateTotal(res.data);
    });
  }, []);

  const calculateTotal = (data) => {
    const sum = data.reduce((acc, f) => acc + parseFloat(f.allocationPct || 0), 0);
    setTotal(sum);
  };

  const handleChange = (id, value) => {
    const updated = funds.map(f => f.fundId === id ? { ...f, allocationPct: value } : f);
    setFunds(updated);
    calculateTotal(updated);
  };

  const handleUpdate = async () => {
    if (total !== 100) {
      alert(`Error: Total must be exactly 100%. Current total: ${total}%`);
      return;
    }
    await api.put('/model-funds/update', { funds });
    alert("Plan updated in MongoDB Atlas!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Recommended Plan</h2>
      <div className="space-y-4 mb-8">
        {funds.map(fund => (
          <div key={fund.fundId} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <span className="font-medium text-slate-700">{fund.fundName}</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={fund.allocationPct}
                onChange={(e) => handleChange(fund.fundId, e.target.value)}
                className="w-20 p-2 border rounded-lg text-right font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <span className="text-slate-400">%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-xl flex justify-between items-center mb-6 ${total === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
        <span className="font-bold uppercase text-sm tracking-widest">Total Allocation</span>
        <span className="text-2xl font-black">{total}%</span>
      </div>

      <button 
        disabled={total !== 100}
        onClick={handleUpdate}
        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-indigo-100"
      >
        <Save size={20} /> UPDATE PLAN
      </button>
    </div>
  );
};

export default EditModel;