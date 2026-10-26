import React, { useRef } from 'react';
import {
  X,
  Check,
  Printer,
  Calendar,
  Clock,
  User as UserIcon,
  Stethoscope,
  Building2,
  Phone,
  FileText,
  MapPin,
  Video,
  Download,
  Share2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Appointment } from '../../types/index.js';

interface VisitVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onViewAllAppointments?: () => void;
  isNewBooking?: boolean;
}

export const VisitVoucherModal: React.FC<VisitVoucherModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onViewAllAppointments,
  isNewBooking = false
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !appointment) return null;

  // Format ticket ID from appointment ID or timestamp
  const ticketNumber = appointment.id.startsWith('apt_')
    ? `AP-2026-${appointment.id.replace('apt_', '').slice(-6)}`
    : `WCH-2026-${appointment.id.slice(-6)}`;

  // Format Registered At date
  const registeredDateStr = appointment.createdAt
    ? new Date(appointment.createdAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

  // Format Preferred Date & Time with slot period (Morning / Afternoon / Evening)
  const formatPreferredDateTime = (dateStr: string, timeStr: string) => {
    let period = 'Morning';
    const lower = timeStr.toLowerCase();
    if (lower.includes('pm')) {
      const hour = parseInt(timeStr, 10);
      if (hour >= 12 && hour < 5) period = 'Afternoon (12:00 PM - 04:00 PM)';
      else period = 'Evening (04:00 PM - 08:00 PM)';
    } else {
      period = 'Morning (09:00 AM - 12:00 PM)';
    }
    return `${dateStr} — ${period} [${timeStr}]`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Official Clinical Visit Voucher & Booking Confirmation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title="Print Voucher Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Container */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6">
          
          {/* 1. Green Success Banner matching user screenshot */}
          <div className="text-center bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-200/70 flex items-center justify-center mb-3 shadow-inner">
              <Check className="w-6 h-6 text-emerald-800 stroke-[3]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Appointment Booked!
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 max-w-lg mx-auto leading-relaxed">
              We will contact you within 24 hours to confirm. A booking confirmation holding clinical slot details was registered successfully.
            </p>
          </div>

          {/* 2. VISIT VOUCHER SUMMARY CARD */}
          <div className="bg-slate-50/60 rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
            
            {/* Voucher Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">
                  VISIT VOUCHER SUMMARY
                </h3>
              </div>
              
              {/* Ticket Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-md bg-sky-50 border border-sky-300 text-sky-800 text-xs font-mono font-bold tracking-wide w-fit">
                <span>TICKET: {ticketNumber}</span>
              </div>
            </div>

            {/* 2-Column Clinical Slot Grid matching user screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
              
              {/* Row 1, Col 1: PATIENT NAME */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  PATIENT NAME
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {appointment.patientName || 'Darsh Jain'}
                  {appointment.patientAge ? (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      ({appointment.patientAge} yrs{appointment.patientGender ? ` · ${appointment.patientGender}` : ''})
                    </span>
                  ) : null}
                </p>
              </div>

              {/* Row 1, Col 2: SPECIALIST DOCTOR */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  SPECIALIST DOCTOR
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {appointment.doctorName}
                </p>
              </div>

              {/* Row 2, Col 1: MEDICAL DEPARTMENT */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  MEDICAL DEPARTMENT
                </p>
                <p className="text-sm font-bold text-teal-800">
                  {appointment.doctorSpecialization || 'Orthopedics'}
                </p>
              </div>

              {/* Row 2, Col 2: PREFERRED DATE & TIME */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  PREFERRED DATE & TIME
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {formatPreferredDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                </p>
              </div>

              {/* Row 3, Col 1: PATIENT CONTACT */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  PATIENT CONTACT
                </p>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {appointment.patientPhone || appointment.patientEmail || '0000000000'}
                </p>
              </div>

              {/* Row 3, Col 2: REGISTERED AT */}
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  REGISTERED AT
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {registeredDateStr}
                </p>
              </div>

            </div>

            {/* Extra Clinical & Facility Metadata Strip */}
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  CONSULTATION MODE
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  {appointment.type === 'video' ? (
                    <>
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      <span>Telehealth Video Call</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>In-Person OPD Clinic</span>
                    </>
                  )}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  FACILITY / CLINIC
                </span>
                <span className="font-semibold text-slate-800 truncate block mt-0.5" title={appointment.doctorClinic || 'HealthPulse OPD Medical Centre'}>
                  {appointment.doctorClinic || 'HealthPulse OPD Medical Centre'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  OPD CONSULTATION FEE
                </span>
                <span className="font-semibold text-teal-700 mt-0.5 block">
                  {appointment.doctorFee ? `₹${appointment.doctorFee} (Pay at Clinic / ABDM)` : 'Covered under Health Scheme'}
                </span>
              </div>
            </div>

            {/* Primary Reason for Consultation */}
            {appointment.reason && (
              <div className="pt-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  CHIEF COMPLAINT / REASON
                </span>
                <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                  {appointment.reason}
                </p>
              </div>
            )}
          </div>

          {/* ABDM & Hospital Trust Footer Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ayushman Bharat Digital Mission (ABDM) & ArogyaPulse Verified</span>
            </div>
            <div className="font-mono text-slate-400">
              VOUCHER REF: {appointment.id}
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Download / Print Voucher</span>
          </button>

          <div className="flex items-center gap-2">
            {onViewAllAppointments && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewAllAppointments();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>View in Appointments</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
