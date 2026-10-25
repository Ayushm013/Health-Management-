import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Video
} from 'lucide-react';
import { api } from '../../services/api.js';

interface FindDoctorsViewProps {
  onBookWithDoctor: (doctorId: string) => void;
}

export const FindDoctorsView: React.FC<FindDoctorsViewProps> = ({ onBookWithDoctor }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctors();
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Error loading doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const specialties = ['all', 'Cardiology', 'Neurology', 'Endocrinology & Diabetology'];

  const filtered = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.profile?.specialization && doc.profile.specialization.toLowerCase().includes(search.toLowerCase())) ||
      (doc.profile?.clinic && doc.profile.clinic.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecialty =
      specialtyFilter === 'all' || doc.profile?.specialization === specialtyFilter;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Find Specialists & Certified Physicians
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Book in-person visits or telemedicine video consults with board-certified practitioners
          </p>
        </div>
      </div>

      {/* Search & Specialty Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search physician name, clinic, condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto text-xs font-medium">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialtyFilter(s)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                specialtyFilter === s
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s === 'all' ? 'All Specialties' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading specialist directory...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No doctors match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-100 relative">
                  <img
                    src={doc.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=0d9488&color=fff`}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-teal-800 shadow-2xs">
                    {doc.profile?.specialization}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-slate-500">{doc.profile?.qualification}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {doc.profile?.bio || 'Certified specialist providing individualized clinical care.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-slate-400">Experience:</span>
                      <strong className="text-slate-800">{doc.profile?.experience || 5} years</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-slate-400">OPD Consultation Fee:</span>
                      <strong className="text-teal-700 font-bold">₹{doc.profile?.consultationFee || 800}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-slate-400">Council Reg:</span>
                      <span className="text-slate-700 text-[11px] font-mono">{doc.profile?.licenseNumber || 'NMC-72910'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-slate-400">Available Days:</span>
                      <span className="text-slate-700 text-[11px] font-sans">{doc.profile?.availableDays?.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onBookWithDoctor(doc.id)}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-2xs transition-colors"
                >
                  Book Consultation Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
