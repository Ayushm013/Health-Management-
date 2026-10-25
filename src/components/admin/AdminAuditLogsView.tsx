import React, { useState, useEffect } from 'react';
import { History, Shield, Search, Calendar, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';
import { AuditLog } from '../../types/index.js';

export const AdminAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType.toLowerCase().includes(search.toLowerCase()) ||
    l.ipAddress.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Security & Compliance Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking authentication, EHR accesses, clinical prescriptions, and state transitions
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter by action, user, or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-sans">
            <tr>
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Actor / User</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Action Trigger</th>
              <th className="py-3 px-4 font-semibold">Entity Type</th>
              <th className="py-3 px-4 font-semibold">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">Loading audit ledger...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">No audit events found.</td>
              </tr>
            ) : (
              filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-600 tabular-nums">
                    {new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="py-2.5 px-4 font-sans font-bold text-slate-900">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-4 font-sans capitalize">
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-teal-800 font-bold">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 tabular-nums">
                    {log.ipAddress}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
