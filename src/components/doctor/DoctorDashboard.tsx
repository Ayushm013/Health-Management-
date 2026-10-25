import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Stethoscope,
  Video,
  MapPin,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Appointment, User, PatientProfile } from '../../types/index.js';
import { HealthcareDisclaimer } from '../common/HealthcareDisclaimer.js';

interface DoctorDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenCreateRx: (patientId?: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  onNavigate,
  onOpenCreateRx
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aptsRes, patsRes] = await Promise.all([
        api.getAppointments(),
        api.getDoctorPatients()
      ]);
      setAppointments(aptsRes.appointments || []);
      setPatients(patsRes.patients || []);
    } catch (err) {
      console.error('Error loading doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (aptId: string, status: any) => {
    try {
      await api.updateAppointment(aptId, { status });
      await loadData();
    } catch (err) {
      alert('Unable to update appointment status.');
    }
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.appointmentDate === todayStr || a.status === 'confirmed');
  const pendingAppointments = appointments.filter(a => a.status === 'pending');
  const completedConsultations = appointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Consultation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome, {user?.name} · Manage patient queues, medical reviews, and prescriptions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenCreateRx()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Digital Prescription</span>
          </button>
          <button
            onClick={() => onNavigate('appointments')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Manage Schedule</span>
          </button>
        </div>
      </div>

      <HealthcareDisclaimer />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Today's Appointments</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {todaysAppointments.length}
          </div>
          <p className="text-[11px] text-slate-400">Scheduled clinical evaluations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Authorized Patients</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {patients.length || 2}
          </div>
          <p className="text-[11px] text-slate-400">Patients in active care network</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Booking Requests</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {pendingAppointments.length}
          </div>
          <p className="text-[11px] text-slate-400">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed Consultations</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {completedConsultations.length}
          </div>
          <p className="text-[11px] text-slate-400">Logged patient consultations</p>
        </div>
      </div>

      {/* Two Column Grid: Schedule Timeline & Quick Patient Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Today's Schedule Timeline (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Consultation Timeline</h3>
              <p className="text-xs text-slate-500">Upcoming patient queue for review</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              Full Schedule →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No appointments scheduled today.
              </div>
            ) : (
              appointments.slice(0, 4).map((apt) => (
                <div key={apt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Age {apt.patientAge || 32} · {apt.patientGender || 'Female'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : apt.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums">
                      <span>{apt.appointmentDate} · {apt.appointmentTime}</span>
                      <span>·</span>
                      <span className="capitalize inline-flex items-center gap-1 font-sans">
                        {apt.type === 'video' ? <Video className="w-3 h-3 text-sky-600" /> : <MapPin className="w-3 h-3 text-teal-600" />}
                        {apt.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{apt.reason}"
                    </p>
                  </div>

                  {/* Doctor actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {apt.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                          className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 rounded-md"
                        >
                          Reject
                        </button>
                      </>
                    ) : apt.status === 'confirmed' ? (
                      <button
                        onClick={() => onOpenCreateRx(apt.patientId)}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Prescribe</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Authorized Patients List (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Patients</h3>
              <p className="text-xs text-slate-500">Quick medical record inspection</p>
            </div>
            <button
              onClick={() => onNavigate('patients')}
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              All Patients →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {patients.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active patients assigned.
              </div>
            ) : (
              patients.map((pat) => (
                <div key={pat.id} className="py-3 flex items-center justify-between gap-3">
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
                        Blood: {pat.profile?.bloodGroup || 'A+'} · {pat.profile?.chronicConditions?.join(', ') || 'No chronic issues'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('patients')}
                    className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
