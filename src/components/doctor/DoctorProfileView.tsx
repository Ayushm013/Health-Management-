import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Award,
  Clock,
  DollarSign,
  Building,
  Save,
  CheckCircle,
  ShieldCheck,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';

export const DoctorProfileView: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experience, setExperience] = useState('14');
  const [licenseNumber, setLicenseNumber] = useState('MD-CARD-88392');
  const [clinic, setClinic] = useState('Cardiovascular Care Center, Suite 402');
  const [consultationFee, setConsultationFee] = useState('90');
  const [bio, setBio] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(['Monday', 'Wednesday', 'Thursday', 'Friday']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Mandarin']);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (user) {
        const res = await api.getDoctorById(user.id);
        setName(res.doctor.name || '');
        setPhone(res.doctor.phone || '');
        if (res.profile) {
          setSpecialization(res.profile.specialization || '');
          setQualification(res.profile.qualification || '');
          setExperience(String(res.profile.experience || 5));
          setLicenseNumber(res.profile.licenseNumber || '');
          setClinic(res.profile.clinic || '');
          setConsultationFee(String(res.profile.consultationFee || 75));
          setBio(res.profile.bio || '');
          setAvailableDays(res.profile.availableDays || []);
          setLanguages(res.profile.languages || []);
        }
      }
    } catch (err) {
      console.error('Error loading doctor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedOk(false);
    try {
      await api.updateDoctorProfile({
        name,
        phone,
        specialization,
        qualification,
        experience: Number(experience),
        licenseNumber,
        clinic,
        consultationFee: Number(consultationFee),
        bio,
        availableDays,
        languages
      });
      setSavedOk(true);
      await refreshAuth();
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err) {
      alert('Unable to save doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const allWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading doctor profile...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Physician Credentials & Public Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Medical licensing, clinical specialties, consultation rates, and appointment availability
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
        >
          {savedOk ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Credentials Updated</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Doctor Profile'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Clinical Profile Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Doctor Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Medical Specialization
                </label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degrees & Qualifications
                </label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. MBBS, MD, FACC"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Years of Clinical Experience
                </label>
                <input
                  type="number"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NMC / State Council Reg No
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. DMC-24108 / KMC-51820"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  OPD Consultation Fee (INR ₹)
                </label>
                <input
                  type="number"
                  required
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hospital / Clinic Facility
                </label>
                <input
                  type="text"
                  value={clinic}
                  onChange={(e) => setClinic(e.target.value)}
                  placeholder="Facility name, Suite, City"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Professional Biography & Clinical Philosophy
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Days & Verification */}
        <div className="space-y-6">
          
          {/* Verification Badge */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verified Medical Practitioner</span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed">
              License authority credentials have been validated by Hospital Administration for active patient care.
            </p>
          </div>

          {/* Available Days */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">
              Weekly Consultation Days
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allWeekdays.map((day) => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </form>
  );
};
