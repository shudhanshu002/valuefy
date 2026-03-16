import React, { useState, useEffect } from 'react';
import api from '../api';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';

const EditModel = () => {
  const [funds, setFunds] = useState([]);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/model-funds').then(res => {
      setFunds(res.data);
      calculateTotal(res.data);
    });
  }, []);

  const calculateTotal = (data) => {
    const sum = data.reduce((acc, f) => acc + parseFloat(f.allocationPct || 0), 0);
    setTotal(Math.round(sum * 100) / 100);
  };

  const updateAllocation = (id, val) => {
    const updated = funds.map(f => f.fundId === id ? { ...f, allocationPct: val } : f);
    setFunds(updated);
    calculateTotal(updated);
  };

  const handleSave = async () => {
    if (total !== 100) return;
    setSaving(true);
    try {
      await api.put('/model-funds/update', { funds });
      alert("Model updated successfully! Calculations will now reflect these changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Manage Model Portfolio</h2>
        
        <div className="space-y-4">
          {funds.map(fund => (
            <div key={fund.fundId} className="flex items-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
              <div className="flex-1">
                <p className="font-bold text-slate-700">{fund.fundName}</p>
                <span className="text-xs font-bold text-indigo-500 tracking-widest">{fund.assetClass}</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={fund.allocationPct}
                  onChange={(e) => updateAllocation(fund.fundId, e.target.value)}
                  className="w-24 p-2 bg-white border border-slate-300 rounded-lg text-right font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <span className="text-slate-400 font-bold">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-8 p-6 rounded-xl flex justify-between items-center ${total === 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          <div className="flex items-center gap-3">
            {total === 100 ? <CheckCircle /> : <AlertTriangle className="animate-pulse" />}
            <div>
              <p className="text-xs uppercase font-bold opacity-70">Total Allocation</p>
              <p className="text-2xl font-black">{total}%</p>
            </div>
          </div>
          <button 
            disabled={total !== 100 || saving}
            onClick={handleSave}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center gap-2"
          >
            <Save size={20} /> {saving ? 'Saving...' : 'Update Model'}
          </button>
        </div>
        {total !== 100 && (
          <p className="mt-4 text-center text-sm font-medium text-rose-500">
            Total must equal exactly 100% to enable saving. Current gap: {Math.abs(100 - total)}%
          </p>
        )}
      </div>
    </div>
  );
};

export default EditModel;