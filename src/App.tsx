import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/common/Header.js';
import { Sidebar } from './components/common/Sidebar.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { LandingPage } from './components/landing/LandingPage.js';

// Patient Views
import { PatientDashboard } from './components/patient/PatientDashboard.js';
import { PatientProfileView } from './components/patient/PatientProfileView.js';
import { PatientAppointmentsView } from './components/patient/PatientAppointmentsView.js';
import { FindDoctorsView } from './components/patient/FindDoctorsView.js';
import { MedicalRecordsView } from './components/patient/MedicalRecordsView.js';
import { PrescriptionsView } from './components/patient/PrescriptionsView.js';
import { MedicationTrackerView } from './components/patient/MedicationTrackerView.js';
import { HealthMetricsView } from './components/patient/HealthMetricsView.js';
import { HealthGoalsView } from './components/patient/HealthGoalsView.js';
import { DailyWellnessTracker } from './components/patient/DailyWellnessTracker.js';
import { AppointmentBookingModal } from './components/patient/AppointmentBookingModal.js';

// Doctor Views
import { DoctorDashboard } from './components/doctor/DoctorDashboard.js';
import { DoctorProfileView } from './components/doctor/DoctorProfileView.js';
import { DoctorAppointmentsView } from './components/doctor/DoctorAppointmentsView.js';
import { DoctorPatientsView } from './components/doctor/DoctorPatientsView.js';
import { CreatePrescriptionModal } from './components/doctor/CreatePrescriptionModal.js';

// Admin Views
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { AdminUsersView } from './components/admin/AdminUsersView.js';
import { AdminDoctorsView } from './components/admin/AdminDoctorsView.js';
import { AdminAuditLogsView } from './components/admin/AdminAuditLogsView.js';
import { AdminRecordsAndAppointmentsPanel } from './components/admin/AdminRecordsAndAppointmentsPanel.js';

// Common Views
import { MessagingView } from './components/common/MessagingView.js';
import { NotificationsView } from './components/common/NotificationsView.js';

function MainApp() {
  const { user, role, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingPreselectedDoc, setBookingPreselectedDoc] = useState<string | undefined>(undefined);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [prescriptionPatientId, setPrescriptionPatientId] = useState<string | undefined>(undefined);

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenBooking = (doctorId?: string) => {
    setBookingPreselectedDoc(doctorId);
    setBookingModalOpen(true);
  };

  const handleOpenCreateRx = (patientId?: string) => {
    setPrescriptionPatientId(patientId);
    setPrescriptionModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Starting HealthPulse clinical system...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, or on 'landing' tab, render Landing Page
  if (!user || activeTab === 'landing') {
    return (
      <>
        <Header
          onOpenAuth={handleOpenAuth}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDashboard={false}
        />
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterDashboard={(tab) => setActiveTab(tab || 'dashboard')}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authInitialMode}
        />
      </>
    );
  }

  // Render Role-Based Application
  const renderContent = () => {
    // 1. Patient Workspace
    if (role === 'patient') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <PatientDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onBookAppointment={() => handleOpenBooking()}
            />
          );
        case 'profile':
          return <PatientProfileView />;
        case 'appointments':
          return (
            <PatientAppointmentsView
              onOpenBooking={() => handleOpenBooking()}
            />
          );
        case 'doctors':
          return (
            <FindDoctorsView
              onBookWithDoctor={(docId) => handleOpenBooking(docId)}
            />
          );
        case 'records':
          return <MedicalRecordsView />;
        case 'prescriptions':
          return <PrescriptionsView />;
        case 'medications':
          return <MedicationTrackerView />;
        case 'metrics':
          return <HealthMetricsView />;
        case 'goals':
          return <HealthGoalsView />;
        case 'wellness':
          return <DailyWellnessTracker />;
        case 'messages':
          return <MessagingView />;
        case 'notifications':
          return <NotificationsView onNavigate={(tab) => setActiveTab(tab)} />;
        default:
          return <PatientDashboard onNavigate={setActiveTab} onBookAppointment={() => handleOpenBooking()} />;
      }
    }

    // 2. Doctor Workspace
    if (role === 'doctor') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <DoctorDashboard
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCreateRx={handleOpenCreateRx}
            />
          );
        case 'profile':
          return <DoctorProfileView />;
        case 'appointments':
          return (
            <DoctorAppointmentsView
              onOpenCreateRx={handleOpenCreateRx}
            />
          );
        case 'patients':
          return (
            <DoctorPatientsView
              onOpenCreateRx={handleOpenCreateRx}
            />
          );
        case 'prescriptions':
          return <PrescriptionsView />;
        case 'records':
          return <MedicalRecordsView />;
        case 'messages':
          return <MessagingView />;
        case 'notifications':
          return <NotificationsView onNavigate={(tab) => setActiveTab(tab)} />;
        default:
          return (
            <DoctorDashboard
              onNavigate={setActiveTab}
              onOpenCreateRx={handleOpenCreateRx}
            />
          );
      }
    }

    // 3. Admin Workspace
    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
        case 'analytics':
          return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        case 'admin-panel':
          return <AdminRecordsAndAppointmentsPanel initialTab="appointments" />;
        case 'appointments':
          return <AdminRecordsAndAppointmentsPanel initialTab="appointments" />;
        case 'records':
          return <AdminRecordsAndAppointmentsPanel initialTab="records" />;
        case 'prescriptions':
          return <AdminRecordsAndAppointmentsPanel initialTab="prescriptions" />;
        case 'patients-control':
          return <AdminRecordsAndAppointmentsPanel initialTab="patients" />;
        case 'users':
          return <AdminUsersView />;
        case 'doctors':
          return <AdminDoctorsView />;
        case 'audit':
          return <AdminAuditLogsView />;
        default:
          return <AdminDashboard onNavigate={setActiveTab} />;
      }
    }

    return <div className="p-8 text-xs text-slate-500">Workspace initialized.</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDashboard={true}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
          {activeTab !== 'dashboard' && (
            <div className="mb-4 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer group"
                title="Move Back to Main Dashboard"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-teal-700 group-hover:-translate-x-0.5 transition-transform" />
                <span>← Move Back to Dashboard</span>
              </button>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span>Active Screen:</span>
                <span className="capitalize font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {activeTab.replace('-', ' ')}
                </span>
              </div>
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      {/* Global Modals */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        onSuccess={() => setActiveTab('appointments')}
        preselectedDoctorId={bookingPreselectedDoc}
      />

      <CreatePrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
        onSuccess={() => setActiveTab('prescriptions')}
        defaultPatientId={prescriptionPatientId}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
