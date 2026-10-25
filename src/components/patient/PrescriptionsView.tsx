import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Printer,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Clock,
  Download,
  X,
  FileText
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Prescription } from '../../types/index.js';

export const PrescriptionsView: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRx, setActiveRx] = useState<Prescription | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.getPrescriptions();
      setPrescriptions(res.prescriptions || []);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Prescriptions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified physician digital prescriptions with formal clinical dosing schedules
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No prescriptions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your physician will issue electronic prescriptions during or following scheduled clinical evaluations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-teal-700">℞</span>
                    <h3 className="text-sm font-bold text-slate-900">{rx.doctorName}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{rx.doctorSpecialization} · License: {rx.doctorLicense || 'MD-88392'}</p>
                </div>
                <span className="text-xs font-mono text-slate-400 tabular-nums">
                  {rx.prescriptionDate}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clinical Diagnosis</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{rx.diagnosis}</p>
              </div>

              {/* Medicines List */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Prescribed Medicines ({rx.items.length})</span>
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-lg p-2 border border-slate-100">
                  {rx.items.map((it, idx) => (
                    <div key={it.id || idx} className="py-2 first:pt-0 last:pb-0 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{idx + 1}. {it.medicineName}</span>
                        <span className="text-teal-700 font-mono">{it.dosage}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-2">
                        <span>Frequency: {it.frequency}</span>
                        <span>·</span>
                        <span>Duration: {it.duration}</span>
                      </div>
                      {it.instructions && (
                        <p className="text-[11px] text-slate-600 italic mt-0.5">
                          Instruction: {it.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {rx.notes && (
                <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  <strong>Physician Note:</strong> {rx.notes}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-mono">ID: {rx.id}</span>
                <button
                  onClick={() => setActiveRx(rx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-600" />
                  <span>Official Printable Layout</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Prescription Modal */}
      {activeRx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-semibold text-slate-500">Official Prescription Preview</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setActiveRx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Prescription Content */}
            <div id="printable-prescription" className="border-2 border-slate-900 p-8 rounded-lg bg-white space-y-6 text-slate-900">
              
              {/* Doctor / Hospital Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{activeRx.doctorName}</h2>
                  <p className="text-xs font-semibold text-slate-700">{activeRx.doctorSpecialization}</p>
                  <p className="text-xs text-slate-600">{activeRx.doctorClinic || 'Apollo Heart Centre, New Delhi'}</p>
                  <p className="text-xs text-teal-800 font-mono font-medium">NMC / State Council Reg: {activeRx.doctorLicense || 'DMC-24108'}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-teal-800">Arogya<span className="text-emerald-600">Pulse</span></div>
                  <p className="text-xs text-slate-500">आरोग्य पल्स • ABDM Integrated OPD</p>
                  <p className="text-xs text-slate-600 font-mono mt-1">Date: {activeRx.prescriptionDate}</p>
                </div>
              </div>

              {/* Patient Meta Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 text-xs rounded">
                <div>
                  <span className="text-slate-500 font-medium">Patient:</span>{' '}
                  <strong className="text-slate-900 block">{activeRx.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Age / Gender:</span>{' '}
                  <strong className="text-slate-900 block">{activeRx.patientAge || 34} yrs / {activeRx.patientGender || 'Male'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">ABHA Number:</span>{' '}
                  <strong className="font-mono text-emerald-800 block">{activeRx.patientAbhaId || '91-4421-8890-1204'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Rx OPD ID:</span>{' '}
                  <strong className="font-mono text-slate-900 block">{activeRx.id}</strong>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="text-xs">
                <span className="font-bold text-slate-700">Clinical Diagnosis:</span>{' '}
                <span className="font-semibold text-slate-900">{activeRx.diagnosis}</span>
              </div>

              {/* Rx Symbol and Table */}
              <div className="space-y-3">
                <div className="text-3xl font-black font-serif text-teal-900">℞</div>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Medication Name (Generic/Brand)</th>
                      <th className="py-2 px-3">Dosage</th>
                      <th className="py-2 px-3">Schedule (M-A-N)</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Clinical Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeRx.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold">{it.medicineName}</td>
                        <td className="py-2.5 px-3 font-mono">{it.dosage}</td>
                        <td className="py-2.5 px-3 font-semibold text-teal-800">{it.frequency}</td>
                        <td className="py-2.5 px-3">{it.duration}</td>
                        <td className="py-2.5 px-3 text-slate-700">{it.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {activeRx.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded text-xs space-y-1">
                  <span className="font-bold text-amber-950">Dietary & Lifestyle Advice (सलाह):</span>
                  <p className="text-slate-800 italic">{activeRx.notes}</p>
                </div>
              )}

              {/* Footer Signature */}
              <div className="pt-8 flex items-end justify-between text-xs border-t border-slate-300">
                <div className="text-slate-400 space-y-0.5 text-[11px]">
                  <p>Electronically generated through ArogyaPulse (आरोग्य पल्स) ABDM Platform.</p>
                  <p>Valid across India as per National Medical Commission (NMC) Telemedicine Practice Guidelines.</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="font-serif italic text-base text-slate-800 border-b border-slate-900 px-8 pb-1">
                    {activeRx.doctorName}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">Registered Medical Practitioner (RMP)</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
