import React from 'react';
import {
  Calendar,
  FileText,
  Pill,
  LineChart,
  Stethoscope,
  FileCheck2,
  Bell,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Lock,
  Heart
} from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext.js';
import { HealthcareDisclaimer } from '../common/HealthcareDisclaimer.js';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onEnterDashboard: (tab?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterDashboard }) => {
  const { user, switchDemoUser } = useAuth();

  const features = [
    {
      title: 'Appointment Management',
      desc: 'Seamless scheduling with top specialists, instant slot availability, and automated calendar reminders.',
      icon: Calendar,
      color: 'text-teal-600 bg-teal-50'
    },
    {
      title: 'Medical Records Archive',
      desc: 'Centralized repository for lab diagnostics, radiology scans, blood chemistry panels, and hospital discharge summaries.',
      icon: FileText,
      color: 'text-sky-600 bg-sky-50'
    },
    {
      title: 'Medication Tracking',
      desc: 'Smart schedules with morning/evening dose reminders, adherence logging, and automatic refill alerts.',
      icon: Pill,
      color: 'text-amber-600 bg-amber-50'
    },
    {
      title: 'Health Vitals Monitoring',
      desc: 'Track blood pressure, fasting glucose, heart rate, BMI, and oxygen levels with interactive trend charts.',
      icon: LineChart,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      title: 'Doctor Consultation',
      desc: 'Direct interaction with verified physicians through structured in-person appointments and secure video consults.',
      icon: Stethoscope,
      color: 'text-indigo-600 bg-indigo-50'
    },
    {
      title: 'Digital Prescriptions',
      desc: 'Legible, digitally signed prescriptions with multi-medicine dosing instructions and one-click printable layouts.',
      icon: FileCheck2,
      color: 'text-violet-600 bg-violet-50'
    },
    {
      title: 'Health Reminders',
      desc: 'Real-time alert notifications for upcoming consultations, missed medications, and diagnostic follow-ups.',
      icon: Bell,
      color: 'text-rose-600 bg-rose-50'
    },
    {
      title: 'Secure Health Data',
      desc: 'Role-based access controls ensuring strict privacy where doctors and patients view only authorized records.',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50'
    }
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Register as a patient or doctor with credential validation in seconds.' },
    { num: '02', title: 'Complete Health Profile', desc: 'Document allergies, blood group, chronic conditions, and emergency contacts.' },
    { num: '03', title: 'Book Appointment', desc: 'Select specialist, convenient time slot, and consultation mode.' },
    { num: '04', title: 'Consult Doctor', desc: 'Engage in clinical evaluation with real-time consultation notes.' },
    { num: '05', title: 'Manage Medical Records', desc: 'Upload, inspect, and organize diagnostic reports securely.' },
    { num: '06', title: 'Monitor Health', desc: 'Log daily wellness metrics and track clinical progress over time.' }
  ];

  const demoStats = [
    { label: 'Active Demo Patients', val: '1,420+' },
    { label: 'Verified Specialists', val: '86' },
    { label: 'Consultations Logged', val: '4,890+' },
    { label: 'Diagnostic Records', val: '12,300+' }
  ];

  const doctorsList = [
    {
      name: 'Dr. Rajesh K. Sharma, MD, DM',
      spec: 'Cardiology',
      sub: 'Interventional & Preventive Cardiology',
      exp: '18 years',
      fee: '₹1,200',
      clinic: 'Apollo Heart Centre, Sarita Vihar, New Delhi',
      image: '/src/assets/images/avatar_doctor_rajesh_1792763082295.jpg'
    },
    {
      name: 'Dr. Ananya Iyer, MD, DM',
      spec: 'Neurology',
      sub: 'Headache Medicine & Stroke Rehabilitation',
      exp: '14 years',
      fee: '₹1,500',
      clinic: 'Manipal Hospital, Old Airport Road, Bengaluru',
      image: '/src/assets/images/avatar_doctor_ananya_1792763084585.jpg'
    },
    {
      name: 'Dr. Vikramaditya Sen, MD',
      spec: 'Endocrinology & Diabetology',
      sub: 'Type-2 Diabetes Reversal & Thyroid Disorders',
      exp: '12 years',
      fee: '₹900',
      clinic: 'Fortis Memorial Research Institute, Gurugram',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Disclaimer Notice */}
      <HealthcareDisclaimer compact />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>आरोग्य पल्स • ABHA & Ayushman Bharat Digital Mission (ABDM) Ready</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
                Your Health, Organized in One Place
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Manage appointments, Indian diagnostic records (Dr. Lal, Apollo, AIIMS), daily medications, vitals, and verified specialist consultations with complete ABHA ID integration.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <button
                    onClick={() => onEnterDashboard('dashboard')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                  >
                    <span>Enter {user.role} Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-all"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenAuth('login')}
                      className="px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
                    >
                      Login to Account
                    </button>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Role-Based Access Control</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Verified Medical Specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Real-Time Adherence Alerts</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100">
                <img
                  src="/src/assets/images/hero_indian_hospital_1792763083189.jpg"
                  alt="Senior Indian physician consulting with patient in modern clinical office"
                  referrerPolicy="no-referrer"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <p className="text-xs font-medium text-emerald-300">
                      आयुष्मान भारत डिजिटल मिशन (ABDM)
                    </p>
                    <p className="text-sm font-semibold">
                      Connected Indian Healthcare for Patients, Doctors, and Labs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Instant Demo Persona Switcher Banner */}
      <section className="bg-slate-900 text-white py-6 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white">
                  Explore Pre-Configured Test Personas
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch instantly between Patient, Doctor, or Hospital Admin views with one click.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={async () => {
                    await switchDemoUser(acc.email);
                    onEnterDashboard('dashboard');
                  }}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-teal-600 border border-slate-700 hover:border-teal-500 rounded-lg transition-colors flex items-center gap-2"
                >
                  <span className="font-semibold text-white">{acc.name}</span>
                  <span className="text-[10px] uppercase font-bold text-teal-300 bg-slate-950/60 px-1.5 py-0.5 rounded">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Platform Features
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything Needed for Modern Healthcare Management
            </p>
            <p className="text-sm text-slate-600">
              Eliminating fragmented medical data, missed doses, and communication friction with integrated tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Workflow Guide
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How HealthPulse Works
            </p>
            <p className="text-sm text-slate-600">
              A streamlined, 6-step clinical journey designed for ease of use and patient safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((st) => (
              <div
                key={st.num}
                className="relative p-6 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="text-2xl font-black text-teal-600/40 mb-2 font-mono">
                  {st.num}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {st.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Departments */}
      <section id="departments" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Clinical Specializations
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Medical Departments
            </p>
            <p className="text-sm text-slate-600">
              Access credentialed specialists across multidisciplinary outpatient departments (OPD).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                dept: 'Orthopedics',
                desc: 'Joint replacement, fracture trauma, musculoskeletal rehabilitation & sports medicine.',
                doctors: 'Dr. Rohan Verma / Senior Ortho Faculty',
                badge: 'Trauma & Bone OPD'
              },
              {
                dept: 'Cardiology',
                desc: 'Preventive cardiology, hypertensive heart disease, coronary care & heart failure management.',
                doctors: 'Dr. Rajesh K. Sharma, MD, DM',
                badge: 'Cardiac OPD'
              },
              {
                dept: 'Neurology',
                desc: 'Headache clinic, stroke rehabilitation, epilepsy management & peripheral nerve care.',
                doctors: 'Dr. Ananya Iyer, MD, DM',
                badge: 'Neuro Clinic'
              },
              {
                dept: 'Endocrinology & Diabetology',
                desc: 'Type-2 diabetes reversal programs, thyroid disorders & metabolic wellness.',
                doctors: 'Dr. Vikramaditya Sen, MD, DM',
                badge: 'Metabolic Care'
              },
              {
                dept: 'General Medicine',
                desc: 'Comprehensive adult health evaluations, fever clinic & multi-system infection management.',
                doctors: 'Consultant Physicians',
                badge: 'Primary OPD'
              },
              {
                dept: 'Pediatrics & Neonatology',
                desc: 'Infant growth tracking, universal immunization schedules & childhood wellness.',
                doctors: 'Pediatric Care Team',
                badge: 'Child Health'
              }
            ].map((d) => (
              <div
                key={d.dept}
                className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200 p-6 transition-all hover:shadow-md flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {d.badge}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {d.dept}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {d.desc}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    Lead: <span className="font-semibold text-slate-700">{d.doctors}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenAuth('login');
                    } else {
                      onEnterDashboard('appointments');
                    }
                  }}
                  className="mt-5 w-full py-2 text-xs font-semibold text-center text-teal-700 bg-white hover:bg-teal-50 rounded-xl border border-teal-200 transition-colors cursor-pointer"
                >
                  Book in {d.dept} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Showcase */}
      <section id="doctors" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Verified Clinicians
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Consult with Experienced Specialists
            </p>
            <p className="text-sm text-slate-600">
              Board-certified practitioners with active clinical appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctorsList.map((doc) => (
              <div
                key={doc.name}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="h-56 bg-slate-100 relative">
                  <img
                    src={doc.image}
                    alt={doc.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold text-teal-800 shadow-2xs">
                    {doc.spec}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.sub}</p>
                    <p className="text-xs text-slate-600 mt-2">{doc.clinic}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Experience:</span>{' '}
                      <span className="font-semibold text-slate-700">{doc.exp}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Fee:</span>{' '}
                      <span className="font-bold text-teal-700">{doc.fee}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!user) {
                        onOpenAuth('login');
                      } else {
                        onEnterDashboard('appointments');
                      }
                    }}
                    className="w-full py-2.5 text-xs font-semibold text-center text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                  >
                    Schedule Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Statistics */}
      <section id="statistics" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Demonstration Platform Performance
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {demoStats.map((st) => (
              <div
                key={st.label}
                className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-200"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-700 font-mono tabular-nums">
                  {st.val}
                </div>
                <div className="text-xs font-medium text-slate-600 mt-1">
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-6 italic">
            * Metrics shown are demonstration benchmarks for academic and simulation assessment.
          </p>
        </div>
      </section>

      {/* Footer / About & Contact */}
      <footer id="contact" className="bg-slate-900 text-slate-400 text-xs py-12">
        <div id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white">ArogyaPulse (आरोग्य पल्स)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Comprehensive Indian Health Management System compliant with ABDM standards for seamless patient, doctor, and diagnostic laboratory connectivity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Capabilities</h4>
              <ul className="space-y-2 text-[11px]">
                <li>ABHA Digital Health Card</li>
                <li>Digital OPD Prescriptions</li>
                <li>Medication Schedules (भोजन से पहले/बाद)</li>
                <li>Health Vitals Analytics</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Roles</h4>
              <ul className="space-y-2 text-[11px]">
                <li>Patient Portal</li>
                <li>Doctor Clinical Desk</li>
                <li>Hospital Administrator</li>
                <li>Security & Audit Logs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Emergency Helplines (India)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                For urgent life-threatening emergencies, dial <strong>108</strong> (Ambulance), <strong>112</strong> (National Emergency), or <strong>1075</strong> (National Health Helpline).
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 ArogyaPulse (आरोग्य पल्स) Management System. Final-Year Academic & Clinical Prototype.</p>
            <div className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>ABDM Guidelines</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
