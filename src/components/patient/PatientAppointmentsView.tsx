import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Search,
  Filter,
  Plus,
  AlertCircle,
  FileCheck2,
  XCircle,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { api } from '../../services/api.js';
import { Appointment } from '../../types/index.js';

interface PatientAppointmentsViewProps {
  onOpenBooking: () => void;
}

export const PatientAppointmentsView: React.FC<PatientAppointmentsViewProps> = ({
  onOpenBooking
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.getAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id);
      await loadAppointments();
    } catch (err) {
      alert('Unable to cancel appointment. Please try again.');
    }
  };

  const filtered = appointments.filter((apt) => {
    const matchesSearch =
      apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      apt.doctorSpecialization.toLowerCase().includes(search.toLowerCase()) ||
      apt.reason.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your physician consultations, history, and doctor notes
          </p>
        </div>

        <button
          onClick={onOpenBooking}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by doctor or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto text-xs">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No appointments found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== 'all'
              ? 'No appointments match your search criteria.'
              : 'You have no scheduled consultations. Book your first session with a certified physician.'}
          </p>
          <button
            onClick={onOpenBooking}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors inline-block mt-2"
          >
            Schedule Appointment
          </button>
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
                  <h3 className="text-sm font-bold text-slate-900">{apt.doctorName}</h3>
                  <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {apt.doctorSpecialization}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : apt.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : apt.status === 'completed'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
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
                    {apt.type === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-sky-600" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    {apt.type} consultation
                  </span>
                  {apt.doctorFee && (
                    <span className="font-semibold text-slate-700">Fee: ${apt.doctorFee}</span>
                  )}
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                  <p>
                    <strong className="text-slate-900">Reason:</strong> {apt.reason}
                  </p>
                  {apt.notes && (
                    <p className="text-slate-500">
                      <strong>Patient Note:</strong> {apt.notes}
                    </p>
                  )}
                  {apt.consultationNotes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-teal-950 bg-teal-50/50 p-2 rounded">
                      <p className="font-semibold text-[11px] text-teal-900">Doctor Consultation Notes:</p>
                      <p className="text-xs text-teal-900/90 leading-relaxed italic">{apt.consultationNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 md:self-center">
                {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                  <button
                    onClick={() => handleCancelAppointment(apt.id)}
                    className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                  >
                    Cancel Slot
                  </button>
                )}
                {apt.type === 'video' && apt.status === 'confirmed' && (
                  <button
                    onClick={() => alert(`Connecting to secure teleconsultation room with ${apt.doctorName}...`)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
