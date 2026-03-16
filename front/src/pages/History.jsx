import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const History = ({ clientId = 'C001' }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get(`/rebalance/history/${clientId}`).then(res => setSessions(res.data));
  }, [clientId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPLIED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'DISMISSED': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Rebalancing History</h1>
      
      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
            No history found. Save a rebalancing session to see it here.
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-3 rounded-lg text-slate-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="font-bold text-lg text-slate-800">
                    {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-500 font-mono">ID: {session._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <div className="flex gap-12">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Portfolio Value</p>
                  <p className="font-semibold text-slate-700 font-mono">₹{session.portfolioValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Buy / Sell</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-1">
                    <span className="text-emerald-600">₹{session.totalToBuy.toLocaleString()}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-rose-600">₹{session.totalToSell.toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${getStatusStyle(session.status)}`}>
                {session.status === 'APPLIED' && <CheckCircle2 size={14} />}
                {session.status === 'DISMISSED' && <XCircle size={14} />}
                {session.status === 'PENDING' && <Clock size={14} />}
                {session.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;