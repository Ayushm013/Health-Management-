import React, { useState, useEffect } from 'react';
import {
  Calendar,
  FileText,
  FileCheck2,
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MapPin,
  Video,
  Printer,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  Save,
  X,
  Stethoscope,
  RefreshCw,
  Building2,
  Activity,
  Heart,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.js';
import {
  Appointment,
  MedicalRecord,
  Prescription,
  User,
  PatientProfile,
  DoctorProfile,
  MedicalRecordType
} from '../../types/index.js';
import { VisitVoucherModal } from '../appointments/VisitVoucherModal.js';
import { AppointmentBookingModal } from '../patient/AppointmentBookingModal.js';

interface AdminRecordsAndAppointmentsPanelProps {
  initialTab?: 'appointments' | 'records' | 'prescriptions' | 'patients';
}

export const AdminRecordsAndAppointmentsPanel: React.FC<AdminRecordsAndAppointmentsPanelProps> = ({
  initialTab = 'appointments'
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'records' | 'prescriptions' | 'patients'>(initialTab);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Master Data
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Array<User & { profile?: PatientProfile; appointmentCount: number; recordsCount: number; prescriptionCount: number }>>([]);
  const [doctors, setDoctors] = useState<Array<User & { profile?: DoctorProfile; appointmentCount: number }>>([]);

  // Modals & Active Edit Targets
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [editingPatient, setEditingPatient] = useState<(User & { profile?: PatientProfile }) | null>(null);
  const [voucherAppointment, setVoucherAppointment] = useState<Appointment | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // New Record Form State
  const [newRecordData, setNewRecordData] = useState<{
    patientId: string;
    title: string;
    type: MedicalRecordType;
    description: string;
    hospital: string;
    recordDate: string;
  }>({
    patientId: '',
    title: '',
    type: 'blood_report',
    description: '',
    hospital: 'ArogyaPulse Medical Centre',
    recordDate: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAllData();
      setAppointments(res.appointments || []);
      setMedicalRecords(res.medicalRecords || []);
      setPrescriptions(res.prescriptions || []);
      setPatients(res.patients || []);
      setDoctors(res.doctors || []);
      if (!newRecordData.patientId && res.patients?.length) {
        setNewRecordData(prev => ({ ...prev, patientId: res.patients[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showNotification(err.message || 'Error loading records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // -------------------------------------------------------------
  // APPOINTMENT CONTROLS
  // -------------------------------------------------------------
  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    try {
      await api.updateAppointment(editingAppointment.id, editingAppointment);
      showNotification(`Appointment ${editingAppointment.id} updated successfully.`);
      setEditingAppointment(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update appointment', 'error');
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateAppointment(id, { status: newStatus as any });
      showNotification(`Appointment status changed to ${newStatus}.`);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to change status', 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment from hospital records?')) return;
    try {
      await api.deleteAppointmentPermanent(id);
      showNotification('Appointment permanently deleted.');
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete appointment', 'error');
    }
  };

  // -------------------------------------------------------------
  // MEDICAL RECORD CONTROLS
  // -------------------------------------------------------------
  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await api.updateMedicalRecord(editingRecord.id, editingRecord);
      showNotification(`Medical record "${editingRecord.title}" updated successfully.`);
      setEditingRecord(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update record', 'error');
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecordData.title || !newRecordData.patientId) {
      showNotification('Please fill in required record title and patient.', 'error');
      return;
    }
    try {
      await api.uploadMedicalRecord({
        ...newRecordData,
        fileName: `${newRecordData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileSize: '2.4 MB'
      });
      showNotification(`Diagnostic record "${newRecordData.title}" archived for patient.`);
      setIsCreatingRecord(false);
      setNewRecordData({
        patientId: patients[0]?.id || '',
        title: '',
        type: 'blood_report',
        description: '',
        hospital: 'ArogyaPulse Medical Centre',
        recordDate: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to archive record', 'error');
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical record?')) return;
    try {
      await api.deleteMedicalRecord(id);
      showNotification('Medical record deleted.');
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete record', 'error');
    }
  };

  // -------------------------------------------------------------
  // PRESCRIPTION CONTROLS
  // -------------------------------------------------------------
  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrescription) return;
    try {
      await api.updatePrescription(editingPrescription.id, editingPrescription);
      showNotification(`Prescription for ${editingPrescription.patientName} updated.`);
      setEditingPrescription(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update prescription', 'error');
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (!confirm('Are you sure you want to delete this digital prescription?')) return;
    try {
      await api.deletePrescription(id);
      showNotification('Prescription deleted.');
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete prescription', 'error');
    }
  };

  const handleAddMedicineToPrescription = () => {
    if (!editingPrescription) return;
    const newItem = {
      id: `item_${Date.now()}`,
      medicineName: '',
      dosage: '1 tablet',
      frequency: 'Once daily morning',
      duration: '15 days',
      instructions: 'After breakfast with water'
    };
    setEditingPrescription({
      ...editingPrescription,
      items: [...(editingPrescription.items || []), newItem]
    });
  };

  const handleRemoveMedicineFromPrescription = (idx: number) => {
    if (!editingPrescription) return;
    const newItems = [...editingPrescription.items];
    newItems.splice(idx, 1);
    setEditingPrescription({ ...editingPrescription, items: newItems });
  };

  // -------------------------------------------------------------
  // PATIENT PROFILE & DESCRIPTION CONTROLS
  // -------------------------------------------------------------
  const handleSavePatientProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    try {
      await api.updatePatientByAdmin(editingPatient.id, {
        name: editingPatient.name,
        email: editingPatient.email,
        phone: editingPatient.phone,
        status: editingPatient.status,
        abhaId: editingPatient.profile?.abhaId,
        abhaAddress: editingPatient.profile?.abhaAddress,
        dateOfBirth: editingPatient.profile?.dateOfBirth,
        gender: editingPatient.profile?.gender,
        bloodGroup: editingPatient.profile?.bloodGroup,
        address: editingPatient.profile?.address,
        emergencyContact: editingPatient.profile?.emergencyContact,
        allergies: editingPatient.profile?.allergies || [],
        chronicConditions: editingPatient.profile?.chronicConditions || [],
        medicalHistory: editingPatient.profile?.medicalHistory || []
      });
      showNotification(`Patient description and clinical profile for "${editingPatient.name}" updated successfully.`);
      setEditingPatient(null);
      await loadData();
    } catch (err: any) {
      showNotification(err.message || 'Failed to update patient profile', 'error');
    }
  };

  // Filtered queries
  const filteredAppointments = appointments.filter((a) => {
    const matchSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorSpecialization.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredRecords = medicalRecords.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
      (r.hospital && r.hospital.toLowerCase().includes(search.toLowerCase()));
    const matchType = statusFilter === 'all' || r.type === statusFilter;
    return matchSearch && matchType;
  });

  const filteredPrescriptions = prescriptions.filter((p) => {
    return (
      p.patientName.toLowerCase().includes(search.toLowerCase()) ||
      p.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      p.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const filteredPatients = patients.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.profile?.abhaId && p.profile.abhaId.toLowerCase().includes(search.toLowerCase())) ||
      (p.profile?.bloodGroup && p.profile.bloodGroup.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm animate-in fade-in slide-in-from-top-2 duration-150 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Master Hospital Administration Console</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Central Records & Appointments Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Full administrative authority to review, modify, reschedule, reassign, and update all patient appointments, diagnostic medical records, digital prescriptions, and clinical descriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh Hospital Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book for Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreatingRecord(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span>+ Upload Patient Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => { setActiveTab('appointments'); setStatusFilter('all'); setSearch(''); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Appointments ({appointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('records'); setStatusFilter('all'); setSearch(''); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'records'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Diagnostic Records ({medicalRecords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('prescriptions'); setStatusFilter('all'); setSearch(''); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'prescriptions'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Prescriptions Control ({prescriptions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('patients'); setStatusFilter('all'); setSearch(''); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'patients'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patient Profiles & Descriptions ({patients.length})</span>
        </button>
      </div>

      {/* Universal Search & Quick Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activeTab === 'appointments'
                ? 'Search by patient, doctor, specialty...'
                : activeTab === 'records'
                ? 'Search report title, hospital, lab...'
                : activeTab === 'prescriptions'
                ? 'Search diagnosis, patient, medication...'
                : 'Search patient name, ABHA ID, blood group...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>

        {activeTab === 'appointments' && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'records' && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Type:</span>
            {['all', 'blood_report', 'x_ray', 'mri', 'ct_scan', 'prescription', 'discharge_summary'].map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setStatusFilter(tp)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tp
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tp.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. ALL APPOINTMENTS CONTROL TAB                               */}
      {/* ============================================================== */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredAppointments.length} appointment entries across all hospital clinics</span>
            <span className="font-semibold text-slate-700">Admin Actions: Edit, Reschedule, Reassign, Status, Slip, Delete</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No appointments found matching your filter criteria.
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {apt.id}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {apt.patientName}
                      </h3>
                      {apt.patientPhone && (
                        <span className="text-xs text-slate-500 font-mono">
                          📞 {apt.patientPhone}
                        </span>
                      )}
                      <span className="text-slate-300">→</span>
                      <span className="text-xs font-bold text-teal-800">
                        {apt.doctorName}
                      </span>
                      <span className="text-[11px] font-medium text-slate-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                        {apt.doctorSpecialization}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : apt.status === 'completed'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {apt.appointmentDate}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {apt.appointmentTime}
                      </span>
                      <span className="flex items-center gap-1">
                        {apt.type === 'video' ? (
                          <Video className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className="capitalize">{apt.type} consultation</span>
                      </span>
                      {apt.doctorClinic && (
                        <span className="text-slate-500 truncate max-w-xs" title={apt.doctorClinic}>
                          🏥 {apt.doctorClinic}
                        </span>
                      )}
                      {apt.doctorFee && (
                        <span className="font-semibold text-slate-800">Fee: ₹{apt.doctorFee}</span>
                      )}
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <p>
                        <strong className="text-slate-900">Reason:</strong> {apt.reason}
                      </p>
                      {apt.notes && (
                        <p className="text-slate-500 mt-1">
                          <strong>Patient Clinical Note:</strong> {apt.notes}
                        </p>
                      )}
                      {apt.consultationNotes && (
                        <p className="text-teal-900 mt-1 font-medium">
                          <strong>Doctor Notes:</strong> {apt.consultationNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Administrative Action Controls */}
                  <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVoucherAppointment(apt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                        title="View Official Visit Voucher Slip"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-700" />
                        <span>Visit Voucher</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingAppointment({ ...apt })}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Edit clinical slot, doctor, or notes"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                        title="Permanently remove appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Status Buttons */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-slate-400 font-semibold mr-1">Status:</span>
                      {apt.status !== 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(apt.id, 'confirmed')}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(apt.id, 'completed')}
                          className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 rounded font-semibold transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {apt.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleQuickStatusChange(apt.id, 'cancelled')}
                          className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ALL MEDICAL RECORDS CONTROL TAB                            */}
      {/* ============================================================== */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredRecords.length} diagnostic medical documents & lab investigations</span>
            <button
              onClick={() => setIsCreatingRecord(true)}
              className="text-teal-700 font-bold hover:underline"
            >
              + Upload Diagnostic Report for Patient
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((rec) => {
              const patient = patients.find(p => p.id === rec.patientId);
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                        {rec.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{rec.recordDate}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1" title={rec.title}>
                      {rec.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium">
                      Patient: <span className="font-bold text-slate-800">{patient?.name || rec.patientId}</span>
                    </p>

                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {rec.description || 'No clinical description provided.'}
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p>🏥 {rec.hospital || 'ArogyaPulse Clinical Lab'}</p>
                      <p className="font-mono text-[10px] text-slate-400">📄 {rec.fileName} ({rec.fileSize || '1.5 MB'})</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => alert(`Previewing official lab file ${rec.fileName}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingRecord({ ...rec })}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Edit record description & hospital findings"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                        title="Delete medical record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ALL PRESCRIPTIONS CONTROL TAB                              */}
      {/* ============================================================== */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredPrescriptions.length} digital prescriptions</span>
            <span className="font-semibold text-slate-700">Admin can modify clinical diagnosis, notes, and medication regimens</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrescriptions.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {rx.id}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-1">
                      {rx.patientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Prescribed by <span className="font-bold text-slate-700">{rx.doctorName}</span> ({rx.doctorSpecialization})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-500 block">{rx.prescriptionDate}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                      ABDM Digitally Signed
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p>
                    <strong className="text-slate-900">Diagnosis:</strong>{' '}
                    <span className="text-teal-900 font-semibold">{rx.diagnosis}</span>
                  </p>
                  {rx.notes && (
                    <p className="text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{rx.notes}"
                    </p>
                  )}
                </div>

                {/* Medication items list */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Prescribed Medicines ({rx.items?.length || 0}):
                  </p>
                  <div className="space-y-1">
                    {rx.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{it.medicineName}</p>
                          <p className="text-[11px] text-slate-500">{it.dosage} · {it.frequency}</p>
                        </div>
                        <span className="text-[11px] font-medium text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {it.instructions}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Rx</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingPrescription({ ...rx })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit Rx</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePrescription(rx.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                      title="Delete prescription"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. PATIENT PROFILES & CLINICAL DESCRIPTIONS TAB                */}
      {/* ============================================================== */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredPatients.length} registered patient records with full ABHA clinical data</span>
            <span className="font-semibold text-slate-700">Admin can edit allergies, chronic conditions, medical history & demographics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPatients.map((pat) => (
              <div
                key={pat.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={pat.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(pat.name)}&background=0d9488&color=fff`}
                      alt={pat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{pat.name}</h3>
                      <p className="text-xs text-slate-500">{pat.email} · {pat.phone || 'No phone'}</p>
                      <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 inline-block mt-0.5">
                        ABHA ID: {pat.profile?.abhaId || '91-XXXX-XXXX-XXXX'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      pat.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {pat.status}
                  </span>
                </div>

                {/* Clinical Description Badges */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Chronic Conditions:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pat.profile?.chronicConditions?.length ? (
                        pat.profile.chronicConditions.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-medium">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">None recorded</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Known Drug Allergies:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pat.profile?.allergies?.length ? (
                        pat.profile.allergies.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[11px] font-medium">
                            ⚠️ {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">No known drug allergies</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Past Medical / Surgical History:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pat.profile?.medicalHistory?.length ? (
                        pat.profile.medicalHistory.map((m, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px]">
                            • {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">No prior surgeries</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 flex flex-wrap items-center gap-4">
                    <span>Blood Group: <strong className="text-slate-800">{pat.profile?.bloodGroup || 'Not set'}</strong></span>
                    <span>Gender: <strong className="text-slate-800 capitalize">{pat.profile?.gender || 'Not set'}</strong></span>
                    <span>Appointments: <strong className="text-teal-700">{pat.appointmentCount || 0}</strong></span>
                    <span>Reports: <strong className="text-teal-700">{pat.recordsCount || 0}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingPatient({ ...pat })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Patient Clinical Data</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: EDIT APPOINTMENT DETAILS & REASSIGNMENT               */}
      {/* ============================================================== */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin: Edit Appointment & Clinical Slot
                </h3>
                <p className="text-xs text-slate-500">Ref: {editingAppointment.id}</p>
              </div>
              <button
                onClick={() => setEditingAppointment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAppointment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.patientName}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Patient Phone Contact
                  </label>
                  <input
                    type="text"
                    value={editingAppointment.patientPhone || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, patientPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* Reassign Doctor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Specialist Physician
                </label>
                <select
                  value={editingAppointment.doctorId}
                  onChange={(e) => {
                    const doc = doctors.find(d => d.id === e.target.value);
                    if (doc) {
                      setEditingAppointment({
                        ...editingAppointment,
                        doctorId: doc.id,
                        doctorName: doc.name,
                        doctorSpecialization: doc.profile?.specialization || 'General',
                        doctorClinic: doc.profile?.clinic || editingAppointment.doctorClinic,
                        doctorFee: doc.profile?.consultationFee || editingAppointment.doctorFee
                      });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.profile?.specialization} ({d.profile?.clinic})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date, Time & Status */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingAppointment.appointmentDate}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentDate: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={editingAppointment.appointmentTime}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointmentTime: e.target.value })}
                    placeholder="10:00 AM"
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingAppointment.status}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as any })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Consultation Type & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={editingAppointment.type}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="in-person">In-Person Clinic</option>
                    <option value="video">Telehealth Video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    value={editingAppointment.doctorFee || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, doctorFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chief Complaint / Reason for Visit
                </label>
                <input
                  type="text"
                  value={editingAppointment.reason}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              {/* Doctor Consultation Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Clinical Consultation Notes
                </label>
                <textarea
                  rows={2}
                  value={editingAppointment.consultationNotes || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, consultationNotes: e.target.value })}
                  placeholder="Clinical observation, physical examination remarks, diagnostic recommendations..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT MEDICAL RECORD DESCRIPTION & DETAILS             */}
      {/* ============================================================== */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin: Edit Medical Record & Lab Description
                </h3>
                <p className="text-xs text-slate-500">Ref: {editingRecord.id}</p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Title *</label>
                <input
                  type="text"
                  value={editingRecord.title}
                  onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Record Type</label>
                  <select
                    value={editingRecord.type}
                    onChange={(e) => setEditingRecord({ ...editingRecord, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="blood_report">Blood Report / Pathology</option>
                    <option value="x_ray">X-Ray Radiology</option>
                    <option value="mri">MRI Scan</option>
                    <option value="ct_scan">CT Scan</option>
                    <option value="prescription">Prescription</option>
                    <option value="discharge_summary">Discharge Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Investigation Date</label>
                  <input
                    type="date"
                    value={editingRecord.recordDate}
                    onChange={(e) => setEditingRecord({ ...editingRecord, recordDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnostic Centre / Hospital
                </label>
                <input
                  type="text"
                  value={editingRecord.hospital || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, hospital: e.target.value })}
                  placeholder="e.g. Dr. Lal PathLabs, Apollo Diagnostics, AIIMS"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Description & Investigation Findings *
                </label>
                <textarea
                  rows={4}
                  value={editingRecord.description}
                  onChange={(e) => setEditingRecord({ ...editingRecord, description: e.target.value })}
                  placeholder="Enter detailed laboratory findings, normal vs abnormal values, radiologist interpretation..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CREATE NEW MEDICAL RECORD FOR PATIENT                 */}
      {/* ============================================================== */}
      {isCreatingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin: Upload Diagnostic Report for Patient
                </h3>
                <p className="text-xs text-slate-500">Archive clinical investigations into patient health locker</p>
              </div>
              <button
                onClick={() => setIsCreatingRecord(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  value={newRecordData.patientId}
                  onChange={(e) => setNewRecordData({ ...newRecordData, patientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email}) — ABHA: {p.profile?.abhaId || 'Pending'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Title *</label>
                <input
                  type="text"
                  value={newRecordData.title}
                  onChange={(e) => setNewRecordData({ ...newRecordData, title: e.target.value })}
                  placeholder="e.g. Complete Blood Count (CBC) & Lipid Profile"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={newRecordData.type}
                    onChange={(e) => setNewRecordData({ ...newRecordData, type: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="blood_report">Blood Report / Pathology</option>
                    <option value="x_ray">X-Ray Radiology</option>
                    <option value="mri">MRI Scan</option>
                    <option value="ct_scan">CT Scan</option>
                    <option value="discharge_summary">Discharge Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Investigation Date</label>
                  <input
                    type="date"
                    value={newRecordData.recordDate}
                    onChange={(e) => setNewRecordData({ ...newRecordData, recordDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnostic Facility / Hospital
                </label>
                <input
                  type="text"
                  value={newRecordData.hospital}
                  onChange={(e) => setNewRecordData({ ...newRecordData, hospital: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Description & Diagnostic Findings *
                </label>
                <textarea
                  rows={3}
                  value={newRecordData.description}
                  onChange={(e) => setNewRecordData({ ...newRecordData, description: e.target.value })}
                  placeholder="Document specific lab results, abnormal parameters, physician summary..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingRecord(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs"
                >
                  Archive Diagnostic Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: EDIT PRESCRIPTION & MEDICATION ITEMS                 */}
      {/* ============================================================== */}
      {editingPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin: Edit Prescription & Regimen
                </h3>
                <p className="text-xs text-slate-500">Ref: {editingPrescription.id} · Patient: {editingPrescription.patientName}</p>
              </div>
              <button
                onClick={() => setEditingPrescription(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePrescription} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    value={editingPrescription.patientName}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, patientName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prescribing Doctor</label>
                  <input
                    type="text"
                    value={editingPrescription.doctorName}
                    onChange={(e) => setEditingPrescription({ ...editingPrescription, doctorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  value={editingPrescription.diagnosis}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physician Advice & Dietary Notes</label>
                <textarea
                  rows={2}
                  value={editingPrescription.notes || ''}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              {/* Medicine Items Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Medications Regimen</span>
                  <button
                    type="button"
                    onClick={handleAddMedicineToPrescription}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {editingPrescription.items?.map((it, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-700">Medicine #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicineFromPrescription(idx)}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Medicine name (e.g. Telmisartan 40mg)"
                        value={it.medicineName}
                        onChange={(e) => {
                          const items = [...editingPrescription.items];
                          items[idx].medicineName = e.target.value;
                          setEditingPrescription({ ...editingPrescription, items });
                        }}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 40 mg)"
                        value={it.dosage}
                        onChange={(e) => {
                          const items = [...editingPrescription.items];
                          items[idx].dosage = e.target.value;
                          setEditingPrescription({ ...editingPrescription, items });
                        }}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Frequency (e.g. Once daily morning)"
                        value={it.frequency}
                        onChange={(e) => {
                          const items = [...editingPrescription.items];
                          items[idx].frequency = e.target.value;
                          setEditingPrescription({ ...editingPrescription, items });
                        }}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Instructions (e.g. After food with water)"
                        value={it.instructions}
                        onChange={(e) => {
                          const items = [...editingPrescription.items];
                          items[idx].instructions = e.target.value;
                          setEditingPrescription({ ...editingPrescription, items });
                        }}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPrescription(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: EDIT PATIENT PROFILE & CLINICAL DESCRIPTIONS          */}
      {/* ============================================================== */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Admin: Edit Patient Clinical Profile & Descriptions
                </h3>
                <p className="text-xs text-slate-500">Patient ID: {editingPatient.id}</p>
              </div>
              <button
                onClick={() => setEditingPatient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatientProfile} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingPatient.status}
                    onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive / Deactivated</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={editingPatient.email}
                    onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact Phone</label>
                  <input
                    type="text"
                    value={editingPatient.phone || ''}
                    onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* ABHA Details */}
              <div className="grid grid-cols-2 gap-3 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                <div>
                  <label className="block text-xs font-semibold text-teal-900 mb-1">ABHA ID (Ayushman Bharat)</label>
                  <input
                    type="text"
                    value={editingPatient.profile?.abhaId || ''}
                    onChange={(e) => {
                      const profile = { ...(editingPatient.profile || {}), abhaId: e.target.value } as PatientProfile;
                      setEditingPatient({ ...editingPatient, profile });
                    }}
                    placeholder="91-4421-8890-1204"
                    className="w-full px-2.5 py-1.5 text-xs border border-teal-200 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-teal-900 mb-1">ABHA Address Handle</label>
                  <input
                    type="text"
                    value={editingPatient.profile?.abhaAddress || ''}
                    onChange={(e) => {
                      const profile = { ...(editingPatient.profile || {}), abhaAddress: e.target.value } as PatientProfile;
                      setEditingPatient({ ...editingPatient, profile });
                    }}
                    placeholder="rohan.verma@abdm"
                    className="w-full px-2.5 py-1.5 text-xs border border-teal-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Demographics */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingPatient.profile?.dateOfBirth || ''}
                    onChange={(e) => {
                      const profile = { ...(editingPatient.profile || {}), dateOfBirth: e.target.value } as PatientProfile;
                      setEditingPatient({ ...editingPatient, profile });
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editingPatient.profile?.gender || 'male'}
                    onChange={(e) => {
                      const profile = { ...(editingPatient.profile || {}), gender: e.target.value as any } as PatientProfile;
                      setEditingPatient({ ...editingPatient, profile });
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={editingPatient.profile?.bloodGroup || 'Not specified'}
                    onChange={(e) => {
                      const profile = { ...(editingPatient.profile || {}), bloodGroup: e.target.value } as PatientProfile;
                      setEditingPatient({ ...editingPatient, profile });
                    }}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>
              </div>

              {/* Chronic Conditions Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chronic Health Conditions (Comma Separated)
                </label>
                <input
                  type="text"
                  value={editingPatient.profile?.chronicConditions?.join(', ') || ''}
                  onChange={(e) => {
                    const chronicConditions = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const profile = { ...(editingPatient.profile || {}), chronicConditions } as PatientProfile;
                    setEditingPatient({ ...editingPatient, profile });
                  }}
                  placeholder="Stage 1 Hypertension, Dust Allergic Rhinitis, Type-2 Diabetes"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              {/* Allergies Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Known Drug & Food Allergies (Comma Separated)
                </label>
                <input
                  type="text"
                  value={editingPatient.profile?.allergies?.join(', ') || ''}
                  onChange={(e) => {
                    const allergies = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const profile = { ...(editingPatient.profile || {}), allergies } as PatientProfile;
                    setEditingPatient({ ...editingPatient, profile });
                  }}
                  placeholder="Penicillin, Sulfa Drugs, Peanuts"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              {/* Medical History Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Past Medical & Surgical History (Comma Separated)
                </label>
                <textarea
                  rows={2}
                  value={editingPatient.profile?.medicalHistory?.join(', ') || ''}
                  onChange={(e) => {
                    const medicalHistory = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    const profile = { ...(editingPatient.profile || {}), medicalHistory } as PatientProfile;
                    setEditingPatient({ ...editingPatient, profile });
                  }}
                  placeholder="Laparoscopic Appendectomy (2018), Knee Ligament Repair (2022)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={editingPatient.profile?.address || ''}
                  onChange={(e) => {
                    const profile = { ...(editingPatient.profile || {}), address: e.target.value } as PatientProfile;
                    setEditingPatient({ ...editingPatient, profile });
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs"
                >
                  Save Patient Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Visit Voucher Modal for Admin */}
      <VisitVoucherModal
        isOpen={!!voucherAppointment}
        onClose={() => setVoucherAppointment(null)}
        appointment={voucherAppointment}
        isNewBooking={false}
      />

      {/* Global Appointment Booking on Behalf of Patient */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          loadData();
          showNotification('New appointment registered successfully.');
        }}
      />
    </div>
  );
};
