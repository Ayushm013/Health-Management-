import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  Eye,
  Calendar,
  Building,
  Plus,
  X,
  FileCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.js';
import { MedicalRecord, MedicalRecordType } from '../../types/index.js';

export const MedicalRecordsView: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);

  // Upload Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MedicalRecordType>('blood_report');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [hospital, setHospital] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('Laboratory_Panel.pdf');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getMedicalRecords();
      setRecords(res.records || []);
    } catch (err) {
      console.error('Error loading medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      await api.uploadMedicalRecord({
        title,
        type,
        recordDate,
        hospital: hospital || 'Dr. Lal PathLabs & Diagnostics',
        description,
        fileName: fileName || `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileSize: '1.9 MB',
        fileUrl: '#download-simulated-record'
      });
      setIsUploadOpen(false);
      setTitle('');
      setDescription('');
      setHospital('');
      await loadRecords();
    } catch (err) {
      alert('Unable to archive medical report. Please check file format and size.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical record? This cannot be undone.')) return;
    try {
      await api.deleteMedicalRecord(id);
      await loadRecords();
    } catch (err) {
      alert('Failed to delete medical record.');
    }
  };

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const recordTypeLabels: Record<string, string> = {
    blood_report: 'Blood Report',
    x_ray: 'X-Ray Radiograph',
    mri: 'MRI Scan',
    ct_scan: 'CT Scan',
    prescription: 'Digital Rx',
    discharge_summary: 'Discharge Summary',
    other: 'Medical Document'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Medical Records & Lab Archive
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized repository for blood chemistries, imaging scans, and clinical discharge summaries
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Medical Record</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search records, hospital, or test..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto text-xs">
          {['all', 'blood_report', 'x_ray', 'mri', 'discharge_summary'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                typeFilter === t
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'all' ? 'All Records' : recordTypeLabels[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Records */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading records...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No medical records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload diagnostic blood tests, scans, or discharge paperwork to maintain an organized personal EHR.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors inline-block mt-2"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {recordTypeLabels[rec.type] || rec.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {rec.fileSize || '1.5 MB'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                  {rec.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>

                <div className="pt-2 text-[11px] text-slate-500 space-y-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{rec.hospital}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Report Date: {rec.recordDate}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewRecord(rec)}
                  className="text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Downloading verified record "${rec.fileName || rec.title}.pdf"...`)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Inspect Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{viewRecord.title}</h3>
              <button onClick={() => setViewRecord(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-semibold text-slate-900">{recordTypeLabels[viewRecord.type] || viewRecord.type}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Clinical Facility:</span>
                <span className="font-semibold text-slate-900">{viewRecord.hospital}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Record Date:</span>
                <span className="font-mono text-slate-900">{viewRecord.recordDate}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-1">Clinical Findings & Summary:</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed font-mono">
                  {viewRecord.description}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewRecord(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Simulated download of ${viewRecord.fileName}`)}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Diagnostic Document</h3>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lipid Profile & Serum Creatinine"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Record Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MedicalRecordType)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="blood_report">Blood Report</option>
                    <option value="x_ray">X-Ray Radiograph</option>
                    <option value="mri">MRI Scan</option>
                    <option value="ct_scan">CT Scan</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="prescription">Prescription</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Conducted</label>
                  <input
                    type="date"
                    required
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Laboratory</label>
                <input
                  type="text"
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  placeholder="e.g. St. Jude Diagnostic Pathology Center"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document File (PDF/DOCX/DICOM)</label>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50 text-xs text-slate-500">
                  <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  <p className="font-semibold text-slate-700">{fileName}</p>
                  <p className="text-[11px] text-slate-400">PDF, JPG, PNG up to 25MB supported</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Summary / Doctor Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key quantitative findings, normal ranges, or recommendations"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  {uploading ? 'Archiving...' : 'Archive Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
