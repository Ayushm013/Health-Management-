import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Search,
  MessageSquare,
  Edit3
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Appointment } from '../../types/index.js';

interface DoctorAppointmentsViewProps {
  onOpenCreateRx: (patientId: string) => void;
}

export const DoctorAppointmentsView: React.FC<DoctorAppointmentsViewProps> = ({
  onOpenCreateRx
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [notesModalApt, setNotesModalApt] = useState<Appointment | null>(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id: string, status: any) => {
    try {
      await api.updateAppointment(id, { status });
      await loadAppointments();
    } catch (err) {
      alert('Unable to update appointment.');
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesModalApt) return;
    setSavingNotes(true);
    try {
      await api.updateAppointment(notesModalApt.id, {
        consultationNotes,
        status: 'completed'
      });
      setNotesModalApt(null);
      await loadAppointments();
    } catch (err) {
      alert('Unable to save consultation notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const filtered = appointments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Appointment Schedule & Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept booking requests, conduct video visits, and file clinical review notes
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                filter === st
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading schedule...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-400">
          No appointments found matching this status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{apt.patientName}</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Age {apt.patientAge || 32} · {apt.patientGender || 'Female'}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                    apt.status === 'confirmed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : apt.status === 'pending'
                      ? 'bg-amber-50 text-amber-700'
                      : apt.status === 'completed'
                      ? 'bg-sky-50 text-sky-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {apt.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono tabular-nums">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {apt.appointmentDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {apt.appointmentTime}
                  </span>
                  <span className="flex items-center gap-1.5 capitalize font-sans">
                    {apt.type === 'video' ? <Video className="w-3.5 h-3.5 text-sky-600" /> : <MapPin className="w-3.5 h-3.5 text-teal-600" />}
                    {apt.type} consultation
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <p>
                    <strong className="text-slate-900">Reason:</strong> {apt.reason}
                  </p>
                  {apt.notes && (
                    <p className="text-slate-500 italic">
                      <strong>Patient Note:</strong> {apt.notes}
                    </p>
                  )}
                  {apt.consultationNotes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-teal-950 bg-teal-50/50 p-2 rounded">
                      <p className="font-semibold text-[11px] text-teal-900">Consultation Notes Recorded:</p>
                      <p className="text-xs text-teal-900/90 leading-relaxed italic">{apt.consultationNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-center">
                {apt.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatus(apt.id, 'confirmed')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
                    >
                      Accept Appointment
                    </button>
                    <button
                      onClick={() => handleStatus(apt.id, 'cancelled')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg"
                    >
                      Reject
                    </button>
                  </>
                )}

                {apt.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        setNotesModalApt(apt);
                        setConsultationNotes(apt.consultationNotes || '');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Complete & Add Notes</span>
                    </button>
                    <button
                      onClick={() => onOpenCreateRx(apt.patientId)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                    >
                      + Prescribe
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consultation Notes Modal */}
      {notesModalApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Record Clinical Consultation Notes
            </h3>
            <p className="text-xs text-slate-500">
              Patient: <strong>{notesModalApt.patientName}</strong> · Date: {notesModalApt.appointmentDate}
            </p>

            <form onSubmit={handleSaveNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physician Examination Findings & Advice *
                </label>
                <textarea
                  rows={4}
                  required
                  value={consultationNotes}
                  onChange={(e) => setConsultationNotes(e.target.value)}
                  placeholder="Record resting vitals, diagnostic assessment, diet adjustments, or follow-up timetable..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNotesModalApt(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNotes}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  {savingNotes ? 'Saving...' : 'Complete Consultation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
