import React, { useState, useEffect } from 'react';
import api from '../api';
import { History as HistoryIcon, Clock } from 'lucide-react';

const History = ({ clientId = 'C001' }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get(`/rebalance/history/${clientId}`)
      .then(res => setSessions(res.data))
      .catch(err => console.error(err));
  }, [clientId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Rebalancing History</h1>
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-center py-20 text-slate-400 bg-white rounded-xl border border-dashed">No history found yet.</p>
        ) : sessions.map((session) => (
          <div key={session._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-indigo-300 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-lg text-slate-400 group-hover:text-indigo-500">
                <Clock size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {new Date(session.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ref: {session._id.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex gap-10 text-right">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Buy / Sell</p>
                <p className="font-semibold text-slate-700">₹{session.totalToBuy.toLocaleString()} / ₹{session.totalToSell.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status</p>
                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-bold">
                  {session.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;