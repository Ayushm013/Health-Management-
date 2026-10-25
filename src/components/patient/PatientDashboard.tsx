import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Pill,
  FileText,
  Activity,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  MapPin,
  ChevronRight,
  TrendingUp,
  Heart,
  Droplet,
  Weight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { Appointment, Medication, MedicalRecord, HealthMetric } from '../../types/index.js';
import { HealthcareDisclaimer } from '../common/HealthcareDisclaimer.js';
import { AiHealthSummaryCard } from './AiHealthSummaryCard.js';
import { RealtimeReportAndVitalsModal } from './RealtimeReportAndVitalsModal.js';

interface PatientDashboardProps {
  onNavigate: (tab: string) => void;
  onBookAppointment: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigate,
  onBookAppointment
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [quickModalTab, setQuickModalTab] = useState<'report' | 'vitals'>('vitals');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [aptsRes, medsRes, recsRes, metsRes] = await Promise.all([
        api.getAppointments(),
        api.getMedications(),
        api.getMedicalRecords(),
        api.getHealthMetrics()
      ]);
      setAppointments(aptsRes.appointments || []);
      setMedications(medsRes.medications || []);
      setRecords(recsRes.records || []);
      setMetrics(metsRes.metrics || []);
    } catch (err) {
      console.error('Failed to load patient dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAdherence = async (medId: string, status: 'taken' | 'skipped') => {
    try {
      await api.logAdherence(medId, status);
      await loadData();
    } catch (err) {
      alert('Unable to record medication adherence.');
    }
  };

  // Find upcoming appointment
  const upcomingApt = appointments.find(
    a => a.status === 'confirmed' || a.status === 'pending'
  );

  // Active meds
  const activeMeds = medications.filter(m => m.status === 'active');

  // Calculate BMI: Weight / (Height / 100)^2
  const latestWeight = metrics.filter(m => m.metricType === 'weight').slice(-1)[0]?.value || 66.2;
  const latestHeight = metrics.filter(m => m.metricType === 'height').slice(-1)[0]?.value || 168;
  const heightInMeters = latestHeight / 100;
  const bmiValue = Number((latestWeight / (heightInMeters * heightInMeters)).toFixed(1));

  let bmiCategory = 'Normal weight';
  let bmiColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (bmiValue < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (bmiValue >= 25 && bmiValue < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (bmiValue >= 30) {
    bmiCategory = 'Obesity';
    bmiColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  // Blood Pressure trend data
  const bpMetrics = metrics.filter(m => m.metricType === 'blood_pressure');
  const bpChartData = bpMetrics.map(m => ({
    date: new Date(m.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    systolic: m.systolic || m.value,
    diastolic: m.diastolic || 80
  }));

  // Weight trend data
  const weightMetrics = metrics.filter(m => m.metricType === 'weight');
  const weightChartData = weightMetrics.map(m => ({
    date: new Date(m.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    weight: m.value
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal Health Dashboard · All medical data synchronized
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onBookAppointment}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
          <button
            onClick={() => { setQuickModalTab('report'); setQuickModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-2xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Realtime Upload Report</span>
          </button>
          <button
            onClick={() => { setQuickModalTab('vitals'); setQuickModalOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-2xs transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-teal-100" />
            <span>+ Log Vitals & BMI</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 rounded-xl flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-0.5 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Healthcare Disclaimer */}
      <HealthcareDisclaimer />

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming Appointment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Upcoming Appointment</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          {upcomingApt ? (
            <div>
              <p className="text-sm font-bold text-slate-900 truncate">
                {upcomingApt.doctorName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {upcomingApt.doctorSpecialization}
              </p>
              <div className="mt-2 text-xs text-teal-700 font-medium flex items-center gap-1.5 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                <span>{upcomingApt.appointmentDate} · {upcomingApt.appointmentTime}</span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-800">No appointments</p>
              <button
                onClick={onBookAppointment}
                className="text-xs text-teal-700 hover:underline mt-1 font-medium inline-block"
              >
                Schedule consultation →
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Today's Medication */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Medications</span>
            <Pill className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {activeMeds.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {activeMeds.length > 0 ? `${activeMeds[0].medicineName} (${activeMeds[0].dosage})` : 'No active prescriptions'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('medications')}
            className="text-xs text-sky-700 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>View schedule</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Total Medical Records */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Medical Records</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {records.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Diagnostics, labs & radiology
            </p>
          </div>
          <button
            onClick={() => onNavigate('records')}
            className="text-xs text-indigo-700 hover:underline font-medium inline-flex items-center gap-1"
          >
            <span>Open archive</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 4: Health Status / BMI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Calculated BMI</span>
            <Weight className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                {bmiValue}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${bmiColor}`}>
                {bmiCategory}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Weight: {latestWeight}kg · Height: {latestHeight}cm
            </p>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            Screening metric only, not clinical diagnosis.
          </p>
        </div>
      </div>

      {/* AI-Powered Health Summary & Trends (Gemini 3.8 Flash) */}
      <AiHealthSummaryCard
        onRefreshMetrics={loadData}
        onOpenQuickUpdate={() => {
          setQuickModalTab('vitals');
          setQuickModalOpen(true);
        }}
      />

      {/* Charts Grid: Blood Pressure & Weight Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Blood Pressure Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Blood Pressure Trend</h3>
              <p className="text-xs text-slate-500">Systolic & Diastolic historical readings (mmHg)</p>
            </div>
            <button
              onClick={() => onNavigate('metrics')}
              className="text-xs text-teal-700 hover:underline font-medium"
            >
              All Metrics
            </button>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[60, 160]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic (mmHg)"
                  stroke="#0d9488"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0d9488' }}
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic (mmHg)"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0284c7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Body Weight Progress</h3>
              <p className="text-xs text-slate-500">Progressive measurements over time (kg)</p>
            </div>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs text-teal-700 hover:underline font-medium"
            >
              Health Goals
            </button>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Two Column Section: Upcoming Appointments & Medication Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Upcoming Appointments Table (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Consultation Appointments</h3>
              <p className="text-xs text-slate-500">Scheduled visits and follow-ups</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              View Full History →
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {appointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No appointments recorded yet.
              </div>
            ) : (
              appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{apt.doctorName}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {apt.doctorSpecialization}
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
                      <span className="capitalize inline-flex items-center gap-1">
                        {apt.type === 'video' ? <Video className="w-3 h-3 text-sky-600" /> : <MapPin className="w-3 h-3 text-teal-600" />}
                        {apt.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 italic">
                      "{apt.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onNavigate('appointments')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medication Reminders (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Medication Schedule</h3>
              <p className="text-xs text-slate-500">Record dosage adherence</p>
            </div>
            <button
              onClick={() => onNavigate('medications')}
              className="text-xs font-semibold text-teal-700 hover:underline"
            >
              Medications →
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {activeMeds.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active medications scheduled.
              </div>
            ) : (
              activeMeds.map((med) => {
                const today = new Date().toISOString().split('T')[0];
                const todayLog = med.adherenceLogs?.find(l => l.date === today);
                return (
                  <div key={med.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {med.medicineName}
                        </p>
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {med.frequency} · {med.time}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Remaining: <strong className="text-slate-700 font-mono">{med.remainingQuantity}</strong> pills
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pt-1">
                      {todayLog ? (
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded capitalize ${
                          todayLog.status === 'taken'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {todayLog.status === 'taken' ? '✓ Taken' : '✕ Skipped'}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleMarkAdherence(med.id, 'taken')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
                          >
                            Take
                          </button>
                          <button
                            onClick={() => handleMarkAdherence(med.id, 'skipped')}
                            className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            Skip
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Realtime Upload Report & Update Vitals Modal */}
      <RealtimeReportAndVitalsModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        initialTab={quickModalTab}
        onSuccess={(type, message) => {
          loadData();
          setToastMessage(message);
          setTimeout(() => setToastMessage(null), 5000);
        }}
      />
    </div>
  );
};
