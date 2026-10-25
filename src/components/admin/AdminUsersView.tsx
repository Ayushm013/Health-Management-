import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  Stethoscope,
  User as UserIcon,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../../services/api.js';
import { User, UserRole } from '../../types/index.js';

export const AdminUsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUserStatus(user.id, nextStatus);
      await loadUsers();
    } catch (err) {
      alert('Unable to change user status.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Permanently delete account for "${user.name}"?`)) return;
    try {
      await api.deleteUser(user.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Unable to delete user account.');
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Accounts & Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer patient, doctor, and staff access credentials and status
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          {['all', 'patient', 'doctor', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                roleFilter === r
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-semibold">User</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold">Account Status</th>
              <th className="py-3 px-4 font-semibold">Joined Date</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">Loading user directory...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">No users found.</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0d9488&color=fff`}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      u.role === 'admin'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : u.role === 'doctor'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {u.phone || '--'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      u.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                        title="Toggle active status"
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
