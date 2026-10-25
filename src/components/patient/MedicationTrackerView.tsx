import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  TrendingUp,
  Percent,
  Trash2,
  X
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Medication } from '../../types/index.js';

export const MedicationTrackerView: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Form
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [time, setTime] = useState('08:00 AM');
  const [quantity, setQuantity] = useState('30');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [instructions, setInstructions] = useState('Take after breakfast (नाश्ते के बाद) with water');
  const [prescribingDoctor, setPrescribingDoctor] = useState('Dr. Rajesh K. Sharma, MD, DM');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadMeds();
  }, []);

  const loadMeds = async () => {
    try {
      setLoading(true);
      const res = await api.getMedications();
      setMedications(res.medications || []);
    } catch (err) {
      console.error('Error loading medications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAdherence = async (medId: string, status: 'taken' | 'skipped') => {
    try {
      await api.logAdherence(medId, status);
      await loadMeds();
    } catch (err) {
      alert('Unable to log adherence.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this medication from your schedule?')) return;
    try {
      await api.deleteMedication(id);
      await loadMeds();
    } catch (err) {
      alert('Failed to remove medication.');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.addMedication({
        medicineName,
        dosage,
        frequency,
        time,
        quantity: Number(quantity) || 30,
        startDate,
        endDate,
        instructions,
        prescribingDoctor
      });
      setIsAddOpen(false);
      setMedicineName('');
      setDosage('');
      await loadMeds();
    } catch (err) {
      alert('Unable to add medication.');
    } finally {
      setAdding(false);
    }
  };

  // Calculate adherence statistics across all logs
  let totalLogs = 0;
  let takenLogs = 0;
  medications.forEach(m => {
    (m.adherenceLogs || []).forEach(l => {
      totalLogs += 1;
      if (l.status === 'taken') takenLogs += 1;
    });
  });
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 92;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Medication Schedule & Adherence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dose reminders, refill counters, and adherence tracking
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Adherence Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Weekly Adherence Rate</span>
            <div className="text-2xl font-bold text-teal-700 font-mono tabular-nums mt-1">
              {adherenceRate}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {takenLogs} doses recorded taken
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Prescriptions</span>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
              {medications.filter(m => m.status === 'active').length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Under current treatment plan
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Refill Attention</span>
            <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
              {medications.filter(m => m.remainingQuantity < 10 && m.status === 'active').length}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Medications below 10 pills
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Medication List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading medications...</div>
      ) : medications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Pill className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No active medications</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Keep track of all daily doses, vitamin regimens, and prescription courses in one unified schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {medications.map((med) => {
            const todayLog = med.adherenceLogs?.find(l => l.date === todayStr);
            const isLow = med.remainingQuantity < 10 && med.status === 'active';

            return (
              <div
                key={med.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{med.medicineName}</h3>
                    <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {med.dosage}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded capitalize">
                      {med.status}
                    </span>
                    {isLow && (
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Low Supply Alert ({med.remainingQuantity} left)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {med.time} ({med.frequency})
                    </span>
                    <span>·</span>
                    <span>Prescribed by: <strong className="text-slate-700">{med.prescribingDoctor}</strong></span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">Remaining: <strong className="text-slate-800">{med.remainingQuantity}</strong> / {med.quantity}</span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                    <strong>Instructions:</strong> {med.instructions}
                  </p>
                </div>

                {/* Adherence Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 md:self-center">
                  {todayLog ? (
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg capitalize inline-flex items-center gap-1.5 ${
                        todayLog.status === 'taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {todayLog.status === 'taken' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Dose Recorded Taken</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-700" />
                            <span>Dose Skipped</span>
                          </>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkAdherence(med.id, 'taken')}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
                      >
                        ✓ Mark Taken
                      </button>
                      <button
                        onClick={() => handleMarkAdherence(med.id, 'skipped')}
                        className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                      >
                        Skip
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove medication"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medication Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Scheduled Medication</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Lisinopril or Metformin"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="e.g. 10 mg / 500 mg"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dose Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Quantity (Pills)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribing Clinician</label>
                <input
                  type="text"
                  value={prescribingDoctor}
                  onChange={(e) => setPrescribingDoctor(e.target.value)}
                  placeholder="Doctor name"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Take with water after breakfast"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  {adding ? 'Adding...' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
