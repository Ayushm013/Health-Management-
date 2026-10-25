import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminDoctorsView: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctors();
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doctorId: string, status: 'verified' | 'rejected') => {
    try {
      await api.verifyDoctor(doctorId, status);
      await loadDoctors();
    } catch (err) {
      alert('Unable to update doctor verification status.');
    }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.profile?.specialization && d.profile.specialization.toLowerCase().includes(search.toLowerCase())) ||
    (d.profile?.licenseNumber && d.profile.licenseNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Doctor Verification & Clinical Licensing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit medical license credentials, clinical authorizations, and consultation eligibility
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search license or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Grid of Doctors */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading physician profiles...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No doctors found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => {
            const isVerified = doc.profile?.verificationStatus === 'verified';
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0d9488&color=fff`}
                        alt={doc.name}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                        <p className="text-xs font-semibold text-teal-700">
                          {doc.profile?.specialization || 'General Practice'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {doc.profile?.verificationStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
                    <p>
                      <strong className="text-slate-800 font-sans">NMC / State Reg:</strong> {doc.profile?.licenseNumber || 'DMC-24108'}
                    </p>
                    <p>
                      <strong className="text-slate-800 font-sans">Qualifications:</strong> {doc.profile?.qualification || 'MBBS, MD'}
                    </p>
                    <p>
                      <strong className="text-slate-800 font-sans">Experience:</strong> {doc.profile?.experience || 5} years clinical
                    </p>
                    <p>
                      <strong className="text-slate-800 font-sans">OPD Fee:</strong> ₹{doc.profile?.consultationFee || 800} / consultation
                    </p>
                  </div>

                  {doc.profile?.clinic && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.profile.clinic}</span>
                    </p>
                  )}
                </div>

                {/* Verification Control */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Credentials status:</span>
                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <button
                        onClick={() => handleVerify(doc.id, 'rejected')}
                        className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                      >
                        Revoke Approval
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(doc.id, 'verified')}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Approve License</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
