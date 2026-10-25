import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  HeartHandshake,
  FileHeart,
  Save,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { PatientProfile } from '../../types/index.js';

export const PatientProfileView: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<any>('female');
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [abhaAddress, setAbhaAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Medical tag lists
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [newHistoryItem, setNewHistoryItem] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getPatientProfile();
      if (res.user) {
        setName(res.user.name || '');
        setPhone(res.user.phone || '');
      }
      if (res.profile) {
        setProfile(res.profile);
        setDateOfBirth(res.profile.dateOfBirth || '');
        setGender(res.profile.gender || 'female');
        setBloodGroup(res.profile.bloodGroup || 'A+');
        setAddress(res.profile.address || '');
        setAbhaId(res.profile.abhaId || '');
        setAbhaAddress(res.profile.abhaAddress || '');
        setEmergencyName(res.profile.emergencyContact?.name || '');
        setEmergencyRelation(res.profile.emergencyContact?.relationship || '');
        setEmergencyPhone(res.profile.emergencyContact?.phone || '');
        setAllergies(res.profile.allergies || []);
        setChronicConditions(res.profile.chronicConditions || []);
        setMedicalHistory(res.profile.medicalHistory || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updatePatientProfile({
        name,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        address,
        abhaId,
        abhaAddress,
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRelation,
          phone: emergencyPhone
        },
        allergies,
        chronicConditions,
        medicalHistory
      });
      setSavedSuccess(true);
      await refreshAuth();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const removeAllergy = (item: string) => {
    setAllergies(allergies.filter(a => a !== item));
  };

  const addCondition = () => {
    if (newCondition.trim() && !chronicConditions.includes(newCondition.trim())) {
      setChronicConditions([...chronicConditions, newCondition.trim()]);
      setNewCondition('');
    }
  };

  const removeCondition = (item: string) => {
    setChronicConditions(chronicConditions.filter(c => c !== item));
  };

  const addHistory = () => {
    if (newHistoryItem.trim() && !medicalHistory.includes(newHistoryItem.trim())) {
      setMedicalHistory([...medicalHistory, newHistoryItem.trim()]);
      setNewHistoryItem('');
    }
  };

  const removeHistory = (item: string) => {
    setMedicalHistory(medicalHistory.filter(h => h !== item));
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading patient profile...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Health Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal identity, clinical emergency contacts, known allergies, and medical background
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
        >
          {saving ? (
            <span>Saving...</span>
          ) : savedSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Update Profile</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Personal Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-teal-600" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name
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
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-100 text-slate-500 rounded-lg cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Nilgiri Block, Sector 62, Noida, UP - 201309"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Ayushman Bharat Digital Mission (ABDM) / ABHA Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-amber-200 to-emerald-600" />
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">
                    National Health Authority (NHA)
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Ayushman Bharat Health Account (ABHA)</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      ABDM Linked
                    </span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono">DIGITAL HEALTH ID</span>
                </div>
              </div>

              {/* Digital ABHA Card Preview */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-sm border border-slate-700 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-teal-300 font-medium">ABHA Number (14-Digit)</p>
                      <p className="text-base sm:text-lg font-mono font-bold tracking-wider text-white">
                        {abhaId || '91-XXXX-XXXX-XXXX'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400">ABHA Address</p>
                        <p className="font-semibold text-slate-200 font-mono">
                          {abhaAddress || `${name.toLowerCase().replace(/\s+/g, '.')}@abdm`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400">Blood Group / Gender</p>
                        <p className="font-semibold text-slate-200">
                          {bloodGroup} • {gender.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center text-teal-300 font-bold text-xs">
                      QR
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">Interoperable</span>
                  </div>
                </div>
              </div>

              {/* Edit ABHA Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ABHA Number (14-digit format)
                  </label>
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="e.g. 91-4421-8890-1204"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Linked to Ayushman Bharat Digital Mission health repository
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ABHA Address (PHR Address)
                  </label>
                  <input
                    type="text"
                    value={abhaAddress}
                    onChange={(e) => setAbhaAddress(e.target.value)}
                    placeholder="e.g. rohan.verma@abdm"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Unique handle used by diagnostic labs and hospital OPDs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-600" />
              <span>Emergency Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="e.g. Spouse / Brother"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Allergies, Chronic Conditions, Surgeries */}
        <div className="space-y-6">
          
          {/* Allergies */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Known Drug & Food Allergies</span>
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add allergy (e.g. Penicillin)"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); } }}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
              />
              <button
                type="button"
                onClick={addAllergy}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {allergies.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No recorded allergies</span>
              ) : (
                allergies.map((all) => (
                  <span
                    key={all}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-800 bg-rose-50 border border-rose-200 rounded-lg"
                  >
                    <span>{all}</span>
                    <button
                      type="button"
                      onClick={() => removeAllergy(all)}
                      className="text-rose-500 hover:text-rose-700 p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileHeart className="w-4 h-4 text-teal-600" />
              <span>Chronic Medical Conditions</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add condition (e.g. Hypertension)"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCondition(); } }}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
              />
              <button
                type="button"
                onClick={addCondition}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {chronicConditions.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No chronic conditions listed</span>
              ) : (
                chronicConditions.map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-900 bg-teal-50 border border-teal-200 rounded-lg"
                  >
                    <span>{cond}</span>
                    <button
                      type="button"
                      onClick={() => removeCondition(cond)}
                      className="text-teal-600 hover:text-teal-800 p-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Surgeries / Medical History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Previous Surgeries & History
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Appendectomy (2018)"
                value={newHistoryItem}
                onChange={(e) => setNewHistoryItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHistory(); } }}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-600"
              />
              <button
                type="button"
                onClick={addHistory}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>

            <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
              {medicalHistory.length === 0 ? (
                <li className="text-slate-400 italic">No previous surgical procedures recorded</li>
              ) : (
                medicalHistory.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeHistory(item)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

        </div>

      </div>
    </form>
  );
};
