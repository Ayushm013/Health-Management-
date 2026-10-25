import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Stethoscope, Video, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { User, DoctorProfile } from '../../types/index.js';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedDoctorId?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedDoctorId
}) => {
  const [doctors, setDoctors] = useState<Array<User & { profile: DoctorProfile }>>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(preselectedDoctorId || '');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [type, setType] = useState<'in-person' | 'video'>('in-person');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set default minimum date to today
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      api.getDoctors().then(res => {
        setDoctors(res.doctors || []);
        if (!selectedDoctorId && res.doctors.length > 0) {
          setSelectedDoctorId(preselectedDoctorId || res.doctors[0].id);
        }
      });
      // default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setAppointmentDate(tomorrow.toISOString().split('T')[0]);
      setAppointmentTime('10:00 AM');
    }
  }, [isOpen, preselectedDoctorId]);

  if (!isOpen) return null;

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const availableSlots = selectedDoctor?.profile?.availableSlots || [
    '09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDoctorId) {
      setError('Please select a healthcare provider.');
      return;
    }

    if (!appointmentDate || appointmentDate < todayStr) {
      setError('Please select a valid future appointment date.');
      return;
    }

    if (!appointmentTime) {
      setError('Please select an available consultation time slot.');
      return;
    }

    if (!reason.trim()) {
      setError('Please describe the primary reason for consultation.');
      return;
    }

    setLoading(true);
    try {
      await api.bookAppointment({
        doctorId: selectedDoctorId,
        appointmentDate,
        appointmentTime,
        type,
        reason: reason.trim(),
        notes: notes.trim()
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to book consultation slot. Please choose another time or physician.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Schedule Medical Consultation
            </h3>
            <p className="text-xs text-slate-500">
              Select physician, date, time slot, and consultation mode
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Doctor / Specialist
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
            >
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} — {doc.profile?.specialization} ({doc.profile?.clinic}) · ₹{doc.profile?.consultationFee}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Brief Card */}
          {selectedDoctor && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center gap-3">
              <img
                src={selectedDoctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=0d9488&color=fff`}
                alt={selectedDoctor.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 truncate">{selectedDoctor.name}</p>
                <p className="text-slate-500 text-[11px] truncate">
                  {selectedDoctor.profile?.qualification} · {selectedDoctor.profile?.experience} years exp
                </p>
                <p className="text-teal-700 font-semibold text-[11px]">
                  OPD Fee: ₹{selectedDoctor.profile?.consultationFee} · Days: {selectedDoctor.profile?.availableDays?.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Date & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                min={todayStr}
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setType('in-person')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    type === 'in-person'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Clinic</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('video')}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border flex items-center justify-center gap-1.5 transition-colors ${
                    type === 'video'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>
              </div>
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setAppointmentTime(slot)}
                  className={`py-2 text-xs font-mono tabular-nums rounded-lg border transition-colors ${
                    appointmentTime === slot
                      ? 'bg-teal-600 text-white font-bold border-teal-600'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Reason for Visit *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up blood pressure evaluation, recurrent migraine, etc."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Clinical Notes / Symptoms (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any symptoms, current pain rating, or specific questions for the physician"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
