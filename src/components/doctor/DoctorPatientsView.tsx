import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  FileText,
  FileCheck2,
  Activity,
  Pill,
  AlertTriangle,
  ChevronRight,
  Eye,
  Plus,
  Heart,
  Calendar
} from 'lucide-react';
import { api } from '../../services/api.js';

interface DoctorPatientsViewProps {
  onOpenCreateRx: (patientId: string) => void;
}

export const DoctorPatientsView: React.FC<DoctorPatientsViewProps> = ({
  onOpenCreateRx
}) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('usr_pat_1');
  const [patientHistory, setPatientHistory] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctorPatients();
      setPatients(res.patients || []);
      if (res.patients.length > 0) {
        setSelectedPatientId(res.patients[0].id);
        fetchHistory(res.patients[0].id);
      }
    } catch (err) {
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (patientId: string) => {
    try {
      setHistoryLoading(true);
      const res = await api.getPatientFullHistory(patientId);
      setPatientHistory(res);
    } catch (err) {
      console.error('Error loading patient history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    fetchHistory(id);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Authorized Patient Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive EHR inspection: allergies, medical history, diagnostics & medications
          </p>
        </div>

        {selectedPatientId && (
          <button
            onClick={() => onOpenCreateRx(selectedPatientId)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write Prescription for Patient</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Patient List (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredPatients.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No matching patients</p>
            ) : (
              filteredPatients.map((pat) => {
                const isSelected = selectedPatientId === pat.id;
                return (
                  <button
                    key={pat.id}
                    onClick={() => handleSelectPatient(pat.id)}
                    className={`w-full text-left p-3 rounded-lg flex items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-teal-50 border border-teal-200 shadow-2xs' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={pat.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(pat.name)}&background=0d9488&color=fff`}
                        alt={pat.name}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{pat.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          Blood: {pat.profile?.bloodGroup || 'A+'} · Age {pat.profile?.dateOfBirth ? (new Date().getFullYear() - new Date(pat.profile.dateOfBirth).getFullYear()) : 32}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Comprehensive Patient Details (Col 8) */}
        <div className="lg:col-span-8 space-y-5">
          {historyLoading ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Retrieving patient clinical EHR history...
            </div>
          ) : !patientHistory ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              Select a patient from the directory to review clinical EHR files.
            </div>
          ) : (
            <>
              {/* Header Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={patientHistory.patient.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(patientHistory.patient.name)}&background=0d9488&color=fff`}
                      alt={patientHistory.patient.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{patientHistory.patient.name}</h2>
                      <p className="text-xs text-slate-500">
                        {patientHistory.patient.email} · Phone: {patientHistory.patient.phone || '+91 98765 43210'}
                      </p>
                      <div className="text-[11px] text-teal-800 font-medium flex flex-wrap items-center gap-2 mt-1">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
                          ABHA: {patientHistory.profile?.abhaId || '91-4421-8890-1204'}
                        </span>
                        <span>DOB: {patientHistory.profile?.dateOfBirth}</span>
                        <span>·</span>
                        <span>Blood: {patientHistory.profile?.bloodGroup}</span>
                        {patientHistory.profile?.abhaAddress && (
                          <span className="text-slate-500 font-mono">({patientHistory.profile.abhaAddress})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenCreateRx(patientHistory.patient.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs self-start sm:self-center"
                  >
                    + Issue Prescription
                  </button>
                </div>

                {/* Emergency Contact */}
                {patientHistory.profile?.emergencyContact && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center justify-between">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <strong className="text-slate-800">
                      {patientHistory.profile.emergencyContact.name} ({patientHistory.profile.emergencyContact.relationship}) · {patientHistory.profile.emergencyContact.phone}
                    </strong>
                  </div>
                )}
              </div>

              {/* Allergies & Chronic Conditions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Documented Allergies</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {patientHistory.profile?.allergies?.length ? (
                      patientHistory.profile.allergies.map((all: string) => (
                        <span key={all} className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                          {all}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No recorded allergies</span>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-teal-600" />
                    <span>Chronic Conditions & History</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {patientHistory.profile?.chronicConditions?.length ? (
                      patientHistory.profile.chronicConditions.map((cond: string) => (
                        <span key={cond} className="text-xs font-medium text-teal-900 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No chronic diagnoses</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Medications */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-sky-600" />
                  <span>Current Active Medications ({patientHistory.medications?.length || 0})</span>
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {patientHistory.medications?.length === 0 ? (
                    <p className="text-slate-400 italic py-2">No active medications recorded.</p>
                  ) : (
                    patientHistory.medications.map((m: any) => (
                      <div key={m.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900">{m.medicineName}</strong>{' '}
                          <span className="font-mono text-teal-700">({m.dosage})</span>
                          <p className="text-[11px] text-slate-500">{m.frequency} · {m.instructions}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                          {m.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Medical Reports & Diagnostics */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Uploaded Lab & Radiology Reports ({patientHistory.medicalRecords?.length || 0})</span>
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {patientHistory.medicalRecords?.length === 0 ? (
                    <p className="text-slate-400 italic py-2">No diagnostic records uploaded.</p>
                  ) : (
                    patientHistory.medicalRecords.map((r: any) => (
                      <div key={r.id} className="py-2.5 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{r.title}</p>
                          <p className="text-[11px] text-slate-500">{r.hospital} · Date: {r.recordDate}</p>
                          <p className="text-xs text-slate-600 mt-1">{r.description}</p>
                        </div>
                        <span className="text-[10px] font-semibold uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 shrink-0">
                          {r.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
};
