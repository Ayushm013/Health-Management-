import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pill, CheckCircle, AlertCircle, FileCheck2 } from 'lucide-react';
import { api } from '../../services/api.js';

interface CreatePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultPatientId?: string;
}

interface ItemInput {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const CreatePrescriptionModal: React.FC<CreatePrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultPatientId
}) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState<string>(defaultPatientId || 'usr_pat_1');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemInput[]>([
    {
      medicineName: 'Telma 40 (Telmisartan)',
      dosage: '40 mg',
      frequency: '1-0-0 (Morning)',
      duration: '30 days',
      instructions: 'Take in morning after breakfast (नाश्ते के बाद). Monitor blood pressure weekly.'
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getDoctorPatients().then(res => {
        setPatients(res.patients || []);
        if (defaultPatientId) {
          setPatientId(defaultPatientId);
        } else if (res.patients.length > 0) {
          setPatientId(res.patients[0].id);
        }
      });
    }
  }, [isOpen, defaultPatientId]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicineName: '',
        dosage: '',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Take after meals'
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemInput, value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (!diagnosis.trim()) {
      setError('Please enter a clinical diagnosis.');
      return;
    }

    const invalidItem = items.some(it => !it.medicineName.trim() || !it.dosage.trim());
    if (invalidItem) {
      setError('Please provide medicine name and dosage for all prescribed items.');
      return;
    }

    setSaving(true);
    try {
      await api.createPrescription({
        patientId,
        diagnosis: diagnosis.trim(),
        notes: notes.trim(),
        items
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to generate digital prescription.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-teal-700">℞</span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Digital Prescription</h3>
              <p className="text-xs text-slate-500">Signs electronically and syncs to patient medication schedule</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Patient Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Patient *
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · ABHA: {p.profile?.abhaId || '91-4421-8890-1204'} · Blood: {p.profile?.bloodGroup || 'A+'}
                </option>
              ))}
            </select>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Clinical Diagnosis *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension (Stage 1) / Migraine with Aura"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Prescription Items */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Prescribed Medicines ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Drug</span>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Medicine #{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Drug name (e.g. Lisinopril)"
                        value={it.medicineName}
                        onChange={(e) => handleItemChange(idx, 'medicineName', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Dosage (e.g. 10 mg)"
                        value={it.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Once daily)"
                        value={it.frequency}
                        onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Duration (e.g. 30 days)"
                        value={it.duration}
                        onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Instructions (e.g. After food)"
                        value={it.instructions}
                        onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-teal-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physician Advice & Dietary Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Low sodium DASH dietary pattern, monitor home BP 3x weekly..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>{saving ? 'Signing & Dispatching...' : 'Sign & Issue Prescription'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
