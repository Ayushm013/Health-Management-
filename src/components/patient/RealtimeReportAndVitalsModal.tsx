import React, { useState } from 'react';
import {
  X,
  Upload,
  Activity,
  FileText,
  Weight,
  Heart,
  Droplet,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Calendar,
  Building,
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api.js';
import { MedicalRecordType } from '../../types/index.js';

interface RealtimeReportAndVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type: 'report' | 'vitals', message: string) => void;
  initialTab?: 'report' | 'vitals';
}

export const RealtimeReportAndVitalsModal: React.FC<RealtimeReportAndVitalsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'vitals'
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'vitals'>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab 1: Realtime Report Upload Fields
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<MedicalRecordType>('blood_report');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('Dr. Lal PathLabs & Diagnostics');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // Tab 2: Realtime Vitals Fields
  const [weightKg, setWeightKg] = useState('66.5');
  const [heightCm, setHeightCm] = useState('168');
  const [systolic, setSystolic] = useState('124');
  const [diastolic, setDiastolic] = useState('82');
  const [bloodGlucose, setBloodGlucose] = useState('104');
  const [glucoseContext, setGlucoseContext] = useState('Fasting (खाली पेट)');
  const [heartRate, setHeartRate] = useState('72');
  const [spo2, setSpo2] = useState('98');
  const [vitalsNotes, setVitalsNotes] = useState('Recorded in morning before breakfast.');

  if (!isOpen) return null;

  // Real-time BMI calculation
  const numWeight = parseFloat(weightKg);
  const numHeight = parseFloat(heightCm);
  let liveBmi: number | null = null;
  let bmiCategory = 'Enter valid weight & height';
  let bmiColor = 'text-slate-500 bg-slate-100 border-slate-200';

  if (!isNaN(numWeight) && !isNaN(numHeight) && numHeight > 50 && numWeight > 20) {
    const heightInMeters = numHeight / 100;
    liveBmi = Number((numWeight / (heightInMeters * heightInMeters)).toFixed(1));

    if (liveBmi < 18.5) {
      bmiCategory = 'Underweight (< 18.5)';
      bmiColor = 'text-amber-800 bg-amber-50 border-amber-200';
    } else if (liveBmi >= 18.5 && liveBmi < 25) {
      bmiCategory = 'Normal Weight (18.5 – 24.9 Healthy Range)';
      bmiColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
    } else if (liveBmi >= 25 && liveBmi < 30) {
      bmiCategory = 'Overweight (25 – 29.9)';
      bmiColor = 'text-amber-800 bg-amber-50 border-amber-200';
    } else {
      bmiCategory = 'Obesity (≥ 30)';
      bmiColor = 'text-rose-800 bg-rose-50 border-rose-200';
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      if (!reportTitle) {
        // Auto-generate a clean report title
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setReportTitle(cleanName);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reportTitle.trim()) {
      setError('Please provide a descriptive title for this diagnostic report.');
      return;
    }

    setSubmitting(true);
    try {
      await api.uploadMedicalRecord({
        title: reportTitle.trim(),
        type: reportType,
        recordDate: reportDate,
        hospital: hospital.trim() || 'Dr. Lal PathLabs & Diagnostics',
        description: reportDescription.trim() || `Diagnostic record archived on ${new Date().toLocaleDateString('en-IN')}`,
        fileName: selectedFileName || `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileSize: selectedFileSize || '1.8 MB',
        fileUrl: fileBase64 || '#download-simulated-record'
      });

      onSuccess('report', `Medical record "${reportTitle}" uploaded successfully.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to upload report. Please check file format.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const nowIso = new Date().toISOString();
      const promises: Promise<any>[] = [];

      // Weight
      if (weightKg && !isNaN(parseFloat(weightKg))) {
        promises.push(
          api.addHealthMetric({
            metricType: 'weight',
            value: parseFloat(weightKg),
            unit: 'kg',
            notes: vitalsNotes,
            recordedAt: nowIso
          })
        );
      }

      // Height
      if (heightCm && !isNaN(parseFloat(heightCm))) {
        promises.push(
          api.addHealthMetric({
            metricType: 'height',
            value: parseFloat(heightCm),
            unit: 'cm',
            notes: 'Stature measurement',
            recordedAt: nowIso
          })
        );
      }

      // Blood Pressure
      if (systolic && diastolic && !isNaN(parseFloat(systolic)) && !isNaN(parseFloat(diastolic))) {
        promises.push(
          api.addHealthMetric({
            metricType: 'blood_pressure',
            value: parseFloat(systolic),
            systolic: parseFloat(systolic),
            diastolic: parseFloat(diastolic),
            unit: 'mmHg',
            notes: vitalsNotes,
            recordedAt: nowIso
          })
        );
      }

      // Blood Glucose
      if (bloodGlucose && !isNaN(parseFloat(bloodGlucose))) {
        promises.push(
          api.addHealthMetric({
            metricType: 'blood_glucose',
            value: parseFloat(bloodGlucose),
            unit: 'mg/dL',
            notes: glucoseContext,
            recordedAt: nowIso
          })
        );
      }

      // Heart Rate
      if (heartRate && !isNaN(parseFloat(heartRate))) {
        promises.push(
          api.addHealthMetric({
            metricType: 'heart_rate',
            value: parseFloat(heartRate),
            unit: 'bpm',
            notes: 'Resting pulse',
            recordedAt: nowIso
          })
        );
      }

      // SpO2
      if (spo2 && !isNaN(parseFloat(spo2))) {
        promises.push(
          api.addHealthMetric({
            metricType: 'oxygen_saturation',
            value: parseFloat(spo2),
            unit: '%',
            notes: 'Pulse oximetry',
            recordedAt: nowIso
          })
        );
      }

      await Promise.all(promises);

      onSuccess(
        'vitals',
        `Vitals updated! New BMI: ${liveBmi || 'calculated'} (${bmiCategory.split('(')[0].trim()}).`
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to update vitals.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with Back button and Close */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Move Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {activeTab === 'report' ? 'Realtime Diagnostic Report Upload' : 'Instant Vitals & Live BMI Update'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {activeTab === 'report'
                  ? 'Archive lab investigations and radiology imaging immediately'
                  : 'Log latest measurements with instant BMI and trend recalculation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 mx-6 mt-4 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setActiveTab('vitals'); setError(null); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'vitals'
                ? 'bg-white text-teal-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Update Vitals & BMI</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('report'); setError(null); }}
            className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'report'
                ? 'bg-white text-teal-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Upload Lab Report</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body: TAB 1 - VITALS & LIVE BMI */}
        {activeTab === 'vitals' && (
          <form onSubmit={handleSubmitVitals} className="p-6 space-y-4">
            
            {/* Live BMI Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${bmiColor}`}>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Live Calculated BMI (Body Mass Index)
                </span>
                <p className="text-sm font-bold">
                  {liveBmi ? `${liveBmi} kg/m² — ${bmiCategory}` : 'Fill weight & height below'}
                </p>
                <p className="text-[11px] opacity-80">
                  Target healthy BMI for Indian adults: 18.5 – 22.9 kg/m²
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-2xl font-black font-mono tabular-nums">
                  {liveBmi || '--.-'}
                </span>
              </div>
            </div>

            {/* Weight and Height Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-teal-600" />
                  <span>Current Weight (kg) *</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="e.g. 66.5"
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Height (cm) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 168"
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
              </div>
            </div>

            {/* Blood Pressure (Systolic & Diastolic) */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Systolic BP (mmHg)</span>
                </label>
                <input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  placeholder="120"
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ideal: 110–125</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  placeholder="80"
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Ideal: 70–82</span>
              </div>
            </div>

            {/* Blood Glucose & Heart Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-sky-600" />
                  <span>Blood Glucose (mg/dL)</span>
                </label>
                <input
                  type="number"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
                <select
                  value={glucoseContext}
                  onChange={(e) => setGlucoseContext(e.target.value)}
                  className="w-full mt-1 px-2 py-1 text-[11px] border border-slate-200 rounded bg-white text-slate-700"
                >
                  <option value="Fasting (खाली पेट)">Fasting (खाली पेट)</option>
                  <option value="Post-Meal (नाश्ते/भोजन के बाद)">Post-Meal (भोजन के बाद)</option>
                  <option value="Random (यदा-कदा)">Random (यदा-कदा)</option>
                </select>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resting Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Oxygen SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98"
                    className="w-full px-3 py-2 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Context / Notes
              </label>
              <input
                type="text"
                value={vitalsNotes}
                onChange={(e) => setVitalsNotes(e.target.value)}
                placeholder="e.g. Taken post-morning walk, feeling energetic"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
              />
            </div>

            {/* Bottom Actions with Back / Cancel */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Move Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Updating Vitals...' : 'Save & Recalculate BMI'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Form Body: TAB 2 - REALTIME REPORT UPLOAD */}
        {activeTab === 'report' && (
          <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
            
            {/* File Upload Dropzone */}
            <div className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl p-5 text-center bg-teal-50/40 hover:bg-teal-50/70 transition-colors">
              <input
                type="file"
                id="realtime-file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="realtime-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedFileName ? selectedFileName : 'Click to select or drop report document'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {selectedFileSize ? `Selected: ${selectedFileSize}` : 'PDF, JPEG, PNG, or DICOM Scans (up to 25 MB)'}
                  </p>
                </div>
              </label>
            </div>

            {/* Report Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Report Title / Investigation Name *
              </label>
              <input
                type="text"
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Complete Lipid & HbA1c Panel"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
              />
            </div>

            {/* Type & Hospital */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Investigation Category
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as MedicalRecordType)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value="blood_report">Blood Panel / Biochemistry</option>
                  <option value="x_ray">X-Ray Radiograph</option>
                  <option value="mri">MRI Scan</option>
                  <option value="ct_scan">CT Scan</option>
                  <option value="prescription">Digital OPD Prescription</option>
                  <option value="discharge_summary">Discharge Summary</option>
                  <option value="other">Other Diagnostic Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Diagnostic Lab / Hospital
                </label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. Dr. Lal PathLabs & Diagnostics"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Investigation / Sampling Date
              </label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
              />
            </div>

            {/* Description / Findings */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Remarks / Findings Summary
              </label>
              <textarea
                rows={2}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="e.g. All lipid parameters within reference range; Triglycerides 142 mg/dL."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white resize-none"
              />
            </div>

            {/* Bottom Actions with Back / Cancel */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Move Back</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{submitting ? 'Uploading Record...' : 'Archive Medical Report'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
