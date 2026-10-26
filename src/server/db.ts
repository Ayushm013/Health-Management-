import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  User,
  PatientProfile,
  DoctorProfile,
  Appointment,
  MedicalRecord,
  Prescription,
  Medication,
  HealthMetric,
  HealthGoal,
  DailyWellness,
  Notification,
  Message,
  AuditLog,
  MetricThresholdAlert
} from '../types/index.js';
import { saveRecordToSupabase, deleteRecordFromSupabase } from './supabase.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  patientProfiles: PatientProfile[];
  doctorProfiles: DoctorProfile[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  medications: Medication[];
  healthMetrics: HealthMetric[];
  healthGoals: HealthGoal[];
  dailyWellness: DailyWellness[];
  notifications: Notification[];
  messages: Message[];
  auditLogs: AuditLog[];
  metricThresholds: MetricThresholdAlert[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Admin@12345', 10);
const DOCTOR_PASSWORD_HASH = bcrypt.hashSync('Doctor@12345', 10);
const PATIENT_PASSWORD_HASH = bcrypt.hashSync('Patient@12345', 10);

const SEED_DATA: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin_1',
      name: 'Dr. A. Swaminathan (Medical Superintendent)',
      email: 'admin@arogyapulse.in',
      passwordHash: ADMIN_PASSWORD_HASH,
      phone: '+91 98110 24890',
      role: 'admin',
      status: 'active',
      createdAt: '2026-01-01T08:00:00.000Z',
      updatedAt: '2026-01-01T08:00:00.000Z',
      profileImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'usr_doc_1',
      name: 'Dr. Rajesh K. Sharma, MD, DM',
      email: 'dr.rajesh@arogyapulse.in',
      passwordHash: DOCTOR_PASSWORD_HASH,
      phone: '+91 98101 44290',
      role: 'doctor',
      status: 'active',
      profileImage: '/src/assets/images/avatar_doctor_rajesh_1792763082295.jpg',
      createdAt: '2026-01-10T09:30:00.000Z',
      updatedAt: '2026-01-10T09:30:00.000Z'
    },
    {
      id: 'usr_doc_2',
      name: 'Dr. Ananya Iyer, MD, DM',
      email: 'dr.ananya@arogyapulse.in',
      passwordHash: DOCTOR_PASSWORD_HASH,
      phone: '+91 98450 78190',
      role: 'doctor',
      status: 'active',
      profileImage: '/src/assets/images/avatar_doctor_ananya_1792763084585.jpg',
      createdAt: '2026-01-15T11:00:00.000Z',
      updatedAt: '2026-01-15T11:00:00.000Z'
    },
    {
      id: 'usr_doc_3',
      name: 'Dr. Vikramaditya Sen, MD, DM',
      email: 'dr.sen@arogyapulse.in',
      passwordHash: DOCTOR_PASSWORD_HASH,
      phone: '+91 99200 62145',
      role: 'doctor',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1594824813633-89047910e53a?auto=format&fit=crop&w=400&q=80',
      createdAt: '2026-02-01T10:15:00.000Z',
      updatedAt: '2026-02-01T10:15:00.000Z'
    },
    {
      id: 'usr_doc_4',
      name: 'Dr. Rohan Verma, MS (Orthopedics)',
      email: 'dr.rohan@arogyapulse.in',
      passwordHash: DOCTOR_PASSWORD_HASH,
      phone: '+91 98455 21098',
      role: 'doctor',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
      createdAt: '2026-02-05T09:00:00.000Z',
      updatedAt: '2026-02-05T09:00:00.000Z'
    },
    {
      id: 'usr_pat_1',
      name: 'Rohan Verma',
      email: 'rohan@arogyapulse.in',
      passwordHash: PATIENT_PASSWORD_HASH,
      phone: '+91 98452 33104',
      role: 'patient',
      status: 'active',
      profileImage: '/src/assets/images/avatar_patient_rohan_1792763084312.jpg',
      createdAt: '2026-02-10T14:20:00.000Z',
      updatedAt: '2026-02-10T14:20:00.000Z'
    },
    {
      id: 'usr_pat_2',
      name: 'Priya Patel',
      email: 'priya@arogyapulse.in',
      passwordHash: PATIENT_PASSWORD_HASH,
      phone: '+91 98250 88912',
      role: 'patient',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      createdAt: '2026-02-15T16:00:00.000Z',
      updatedAt: '2026-02-15T16:00:00.000Z'
    },
    {
      id: 'usr_pat_3',
      name: 'Darsh Jain',
      email: 'darsh.jain@arogyapulse.in',
      passwordHash: PATIENT_PASSWORD_HASH,
      phone: '+91 98200 71093',
      role: 'patient',
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: '2026-02-18T10:00:00.000Z',
      updatedAt: '2026-02-18T10:00:00.000Z'
    }
  ],
  doctorProfiles: [
    {
      id: 'doc_prof_1',
      userId: 'usr_doc_1',
      specialization: 'Cardiology',
      qualification: 'MBBS (MAMC), MD (Medicine), DM (Cardiology, AIIMS Delhi), FACC',
      experience: 16,
      licenseNumber: 'DMC-2008-44910 (Delhi Medical Council)',
      clinic: 'Apollo Heart Centre, Sarita Vihar, New Delhi',
      consultationFee: 1200,
      bio: 'Senior Consultant Interventional Cardiologist specializing in preventive cardiology, coronary angioplasty, hypertensive heart disease, and heart failure management.',
      verificationStatus: 'verified',
      availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
      availableSlots: ['09:30 AM', '11:00 AM', '12:30 PM', '03:00 PM', '04:30 PM', '05:30 PM'],
      languages: ['English', 'Hindi', 'Punjabi']
    },
    {
      id: 'doc_prof_2',
      userId: 'usr_doc_2',
      specialization: 'Neurology',
      qualification: 'MBBS, MD (Medicine), DM (Neurology, NIMHANS Bengaluru)',
      experience: 18,
      licenseNumber: 'KMC-58210 (Karnataka Medical Council)',
      clinic: 'Manipal Hospital, Old Airport Road, Bengaluru',
      consultationFee: 1500,
      bio: 'Chief Neurologist with clinical fellowship from NIMHANS. Expert in migraine headache syndromes, peripheral neuropathy, epilepsy, and neuro-vascular health.',
      verificationStatus: 'verified',
      availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
      languages: ['English', 'Hindi', 'Kannada', 'Tamil']
    },
    {
      id: 'doc_prof_3',
      userId: 'usr_doc_3',
      specialization: 'Endocrinology & Diabetology',
      qualification: 'MBBS, MD (Internal Medicine), DM (Endocrinology, PGI Chandigarh)',
      experience: 12,
      licenseNumber: 'HN-22041 (Haryana Medical Council)',
      clinic: 'Fortis Memorial Research Institute, Sector 44, Gurugram',
      consultationFee: 900,
      bio: 'Consultant Diabetologist and Endocrinologist managing complex glycemic variability, insulin resistance, thyroid nodules, and therapeutic lifestyle guidance.',
      verificationStatus: 'verified',
      availableDays: ['Monday', 'Tuesday', 'Friday', 'Saturday'],
      availableSlots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'],
      languages: ['English', 'Hindi', 'Bengali']
    },
    {
      id: 'doc_prof_4',
      userId: 'usr_doc_4',
      specialization: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics, AIIMS Delhi), MCh (Joint & Spine)',
      experience: 15,
      licenseNumber: 'KMC-71093 (Karnataka Medical Council)',
      clinic: 'Apollo Ortho & Trauma Care, Bengaluru',
      consultationFee: 1000,
      bio: 'Senior Orthopedic Surgeon specializing in joint arthroplasty, sports injury ligament reconstruction, trauma care, and degenerative spine disorders.',
      verificationStatus: 'verified',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      availableSlots: ['09:30 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'],
      languages: ['English', 'Hindi', 'Kannada']
    }
  ],
  patientProfiles: [
    {
      id: 'pat_prof_1',
      userId: 'usr_pat_1',
      abhaId: '91-4421-8890-1204',
      abhaAddress: 'rohan.verma@abdm',
      dateOfBirth: '1994-06-14',
      gender: 'male',
      bloodGroup: 'B+',
      address: 'Flat 402, Shanti Nilayam, 12th Main, Indiranagar, Bengaluru, Karnataka - 560038',
      emergencyContact: {
        name: 'Kavita Verma',
        relationship: 'Spouse',
        phone: '+91 98450 11982'
      },
      allergies: ['Penicillin', 'Sulfa Drugs'],
      chronicConditions: ['Stage 1 Essential Hypertension', 'Dust Allergic Rhinitis'],
      medicalHistory: ['Laparoscopic Appendectomy (AIIMS New Delhi, 2018)', 'Sprained Ankle Ligament (2022)']
    },
    {
      id: 'pat_prof_2',
      userId: 'usr_pat_2',
      abhaId: '91-3819-2041-9941',
      abhaAddress: 'priya.patel@abdm',
      dateOfBirth: '1981-11-20',
      gender: 'female',
      bloodGroup: 'O+',
      address: '24 Shivalik Bungalows, Near Commerce Six Roads, Navrangpura, Ahmedabad, Gujarat - 380009',
      emergencyContact: {
        name: 'Nilesh Patel',
        relationship: 'Spouse',
        phone: '+91 98251 77319'
      },
      allergies: ['Aspirin (Mild Gastro Upset)'],
      chronicConditions: ['Type-2 Diabetes Mellitus', 'Dyslipidemia'],
      medicalHistory: ['Gallbladder Cholecystectomy (2020)']
    },
    {
      id: 'pat_prof_3',
      userId: 'usr_pat_3',
      abhaId: '91-8820-7109-3401',
      abhaAddress: 'darsh.jain@abdm',
      dateOfBirth: '1998-03-24',
      gender: 'male',
      bloodGroup: 'A+',
      address: '702, Skyline Towers, Outer Ring Road, Bengaluru, Karnataka - 560103',
      emergencyContact: {
        name: 'Suresh Jain',
        relationship: 'Father',
        phone: '+91 98200 11223'
      },
      allergies: [],
      chronicConditions: ['Post-Trauma Knee Ligament Strain'],
      medicalHistory: ['Left Knee Arthroscopy (2023)']
    }
  ],
  appointments: [
    {
      id: 'apt_101',
      patientId: 'usr_pat_1',
      patientName: 'Rohan Verma',
      patientEmail: 'rohan@arogyapulse.in',
      patientAge: 32,
      patientGender: 'male',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Rajesh K. Sharma, MD, DM',
      doctorSpecialization: 'Cardiology',
      doctorClinic: 'Apollo Heart Centre, Sarita Vihar, New Delhi',
      doctorFee: 1200,
      appointmentDate: '2026-10-26',
      appointmentTime: '11:00 AM',
      type: 'in-person',
      reason: 'Quarterly review of ambulatory blood pressure and ECG follow-up.',
      status: 'confirmed',
      notes: 'Please bring recent BP reading chart and morning medication log.',
      createdAt: '2026-10-18T10:00:00.000Z'
    },
    {
      id: 'apt_102',
      patientId: 'usr_pat_1',
      patientName: 'Rohan Verma',
      patientEmail: 'rohan@arogyapulse.in',
      patientAge: 32,
      patientGender: 'male',
      doctorId: 'usr_doc_2',
      doctorName: 'Dr. Ananya Iyer, MD, DM',
      doctorSpecialization: 'Neurology',
      doctorClinic: 'Manipal Hospital, Old Airport Road, Bengaluru',
      doctorFee: 1500,
      appointmentDate: '2026-11-04',
      appointmentTime: '02:00 PM',
      type: 'video',
      reason: 'Screen-time induced tension headaches and cervical posture discomfort.',
      status: 'pending',
      notes: 'Tele-consultation video link will be active 10 minutes prior.',
      createdAt: '2026-10-20T14:15:00.000Z'
    },
    {
      id: 'apt_103',
      patientId: 'usr_pat_1',
      patientName: 'Rohan Verma',
      patientEmail: 'rohan@arogyapulse.in',
      patientAge: 32,
      patientGender: 'male',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Rajesh K. Sharma, MD, DM',
      doctorSpecialization: 'Cardiology',
      doctorClinic: 'Apollo Heart Centre, New Delhi',
      doctorFee: 1200,
      appointmentDate: '2026-08-14',
      appointmentTime: '12:30 PM',
      type: 'in-person',
      reason: 'Initial consultation for borderline blood pressure elevation.',
      status: 'completed',
      notes: 'Completed in-clinic 12-lead ECG and lipid evaluation.',
      consultationNotes: 'Resting BP recorded at 134/86 mmHg. Normal sinus rhythm on ECG. Initiated low-dose Telmisartan 40mg. Advised low-sodium Indian home food (कम नमक, तेल का नियंत्रित सेवन) and 30 minutes brisk walking / Pranayama daily.',
      createdAt: '2026-08-01T09:00:00.000Z'
    },
    {
      id: 'apt_104',
      patientId: 'usr_pat_2',
      patientName: 'Priya Patel',
      patientEmail: 'priya@arogyapulse.in',
      patientAge: 45,
      patientGender: 'female',
      doctorId: 'usr_doc_3',
      doctorName: 'Dr. Vikramaditya Sen, MD, DM',
      doctorSpecialization: 'Endocrinology & Diabetology',
      doctorClinic: 'Fortis Memorial Hospital, Gurugram',
      doctorFee: 900,
      appointmentDate: '2026-10-25',
      appointmentTime: '10:00 AM',
      type: 'in-person',
      reason: 'Semi-annual HbA1c review and insulin sensitivity evaluation.',
      status: 'confirmed',
      notes: '10 hours overnight fasting required for lab panel.',
      createdAt: '2026-10-15T11:20:00.000Z'
    }
  ],
  medicalRecords: [
    {
      id: 'rec_201',
      patientId: 'usr_pat_1',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Rajesh K. Sharma, MD, DM',
      title: 'Complete Lipid Profile & Fasting Blood Sugar',
      type: 'blood_report',
      fileUrl: '#download-rec-201',
      fileName: 'DrLalPathLabs_LipidProfile_Aug2026.pdf',
      fileSize: '1.4 MB',
      description: 'Fasting Plasma Glucose: 92 mg/dL. Total Cholesterol: 178 mg/dL, HDL: 52 mg/dL, LDL: 104 mg/dL, Triglycerides: 142 mg/dL. Serum Creatinine: 0.9 mg/dL (Normal).',
      recordDate: '2026-08-11',
      hospital: 'Dr. Lal PathLabs (National Reference Lab, New Delhi)',
      createdAt: '2026-08-11T16:00:00.000Z'
    },
    {
      id: 'rec_202',
      patientId: 'usr_pat_1',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Rajesh K. Sharma, MD, DM',
      title: '12-Lead Diagnostic Electrocardiogram (ECG)',
      type: 'blood_report',
      fileUrl: '#download-rec-202',
      fileName: 'Apollo_Cardio_12LeadECG_Aug2026.pdf',
      fileSize: '2.1 MB',
      description: 'Normal sinus rhythm at 72 bpm. PR interval 152 ms, QRS duration 88 ms. No ST segment depression or T-wave inversion. Normal axis.',
      recordDate: '2026-08-14',
      hospital: 'Apollo Heart Centre (Sarita Vihar, New Delhi)',
      createdAt: '2026-08-14T12:00:00.000Z'
    },
    {
      id: 'rec_203',
      patientId: 'usr_pat_1',
      doctorId: 'usr_doc_2',
      doctorName: 'Dr. Ananya Iyer, MD, DM',
      title: 'Digital Chest Radiograph (PA View)',
      type: 'x_ray',
      fileUrl: '#download-rec-203',
      fileName: 'Manipal_Chest_XRay_PA_2026.pdf',
      fileSize: '3.6 MB',
      description: 'Bilateral lung parenchyma clear without focal consolidation or pleural effusion. Cardiothoracic ratio within normal limits (<0.5). Normal bronchovascular markings.',
      recordDate: '2026-05-20',
      hospital: 'Manipal Hospital Diagnostic Radiology (Bengaluru)',
      createdAt: '2026-05-20T14:30:00.000Z'
    },
    {
      id: 'rec_204',
      patientId: 'usr_pat_1',
      title: 'Laparoscopic Appendectomy Discharge Summary',
      type: 'discharge_summary',
      fileUrl: '#download-rec-204',
      fileName: 'AIIMS_Discharge_Summary_Appendectomy.pdf',
      fileSize: '920 KB',
      description: 'Admitted with acute appendicitis. Underwent uneventful 3-port laparoscopic appendectomy under GA. Post-operative period uneventful. Sutures removed on POD 7.',
      recordDate: '2018-09-24',
      hospital: 'AIIMS (All India Institute of Medical Sciences, New Delhi)',
      createdAt: '2026-02-11T10:00:00.000Z'
    }
  ],
  prescriptions: [
    {
      id: 'rx_301',
      patientId: 'usr_pat_1',
      patientName: 'Rohan Verma',
      patientAbhaId: '91-4421-8890-1204',
      patientAge: 32,
      patientGender: 'male',
      doctorId: 'usr_doc_1',
      doctorName: 'Dr. Rajesh K. Sharma, MD, DM',
      doctorSpecialization: 'Cardiology',
      doctorLicense: 'DMC-2008-44910 (Delhi Medical Council / NMC)',
      doctorClinic: 'Apollo Heart Centre, Sarita Vihar, New Delhi',
      doctorPhone: '+91 98101 44290',
      diagnosis: 'Primary Essential Hypertension (Stage 1) - Borderline Grade 1.',
      notes: 'कम नमक का सेवन (< 2,000 mg/day). नियमित सुबह की सैर या सूर्य नमस्कार 30 मिनट. सप्ताह में 2 बार रक्तचाप (BP) की जांच करें.',
      prescriptionDate: '2026-08-14',
      items: [
        {
          id: 'item_1',
          medicineName: 'Telmisartan Tablets IP (Telma 40)',
          dosage: '40 mg',
          frequency: '1-0-0 (Once daily morning / सुबह नाश्ते के बाद)',
          duration: '90 days',
          instructions: 'Take in the morning with a full glass of water after light breakfast.'
        },
        {
          id: 'item_2',
          medicineName: 'Pantoprazole Gastro-Resistant Tab IP (Pan 40)',
          dosage: '40 mg',
          frequency: '1-0-0 (Once daily early morning / खाली पेट)',
          duration: '30 days',
          instructions: 'Take early morning on an empty stomach with plain water (खाली पेट).'
        },
        {
          id: 'item_3',
          medicineName: 'Coenzyme Q10 Softgel Capsule',
          dosage: '100 mg',
          frequency: '0-1-0 (Once daily afternoon / दोपहर भोजन के बाद)',
          duration: '90 days',
          instructions: 'Vascular antioxidant adjunct. Take after afternoon lunch.'
        }
      ]
    }
  ],
  medications: [
    {
      id: 'med_401',
      patientId: 'usr_pat_1',
      prescriptionItemId: 'item_1',
      medicineName: 'Telmisartan 40mg (Telma 40)',
      dosage: '40 mg',
      frequency: 'Once daily morning',
      startDate: '2026-08-14',
      endDate: '2026-11-14',
      time: '08:30 AM',
      quantity: 90,
      remainingQuantity: 28,
      instructions: 'Take in morning after breakfast with water. Avoid excess sodium / pickles (अचार).',
      prescribingDoctor: 'Dr. Rajesh K. Sharma, MD, DM',
      status: 'active',
      adherenceLogs: [
        { date: '2026-10-22', status: 'taken', timestamp: '2026-10-22T08:35:00Z' },
        { date: '2026-10-21', status: 'taken', timestamp: '2026-10-21T08:40:00Z' },
        { date: '2026-10-20', status: 'taken', timestamp: '2026-10-20T08:30:00Z' },
        { date: '2026-10-19', status: 'skipped', timestamp: '2026-10-19T13:00:00Z' },
        { date: '2026-10-18', status: 'taken', timestamp: '2026-10-18T08:45:00Z' },
        { date: '2026-10-17', status: 'taken', timestamp: '2026-10-17T08:30:00Z' }
      ]
    },
    {
      id: 'med_402',
      patientId: 'usr_pat_1',
      prescriptionItemId: 'item_2',
      medicineName: 'Pantoprazole 40mg (Pan 40)',
      dosage: '40 mg',
      frequency: 'Once daily empty stomach',
      startDate: '2026-09-01',
      endDate: '2026-12-01',
      time: '07:30 AM',
      quantity: 30,
      remainingQuantity: 14,
      instructions: 'Take early morning on empty stomach (खाली पेट) with water.',
      prescribingDoctor: 'Dr. Rajesh K. Sharma, MD, DM',
      status: 'active',
      adherenceLogs: [
        { date: '2026-10-22', status: 'taken', timestamp: '2026-10-22T07:35:00Z' },
        { date: '2026-10-21', status: 'taken', timestamp: '2026-10-21T07:40:00Z' }
      ]
    },
    {
      id: 'med_403',
      patientId: 'usr_pat_1',
      medicineName: 'Paracetamol 650mg (Dolo 650)',
      dosage: '650 mg',
      frequency: 'SOS (As needed for headache or fever)',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
      time: '02:00 PM',
      quantity: 15,
      remainingQuantity: 8,
      instructions: 'Take only when necessary for headache or mild body ache after food.',
      prescribingDoctor: 'Dr. Ananya Iyer, MD, DM',
      status: 'completed',
      adherenceLogs: []
    }
  ],
  healthMetrics: [
    // Weight readings (kg)
    { id: 'met_w_1', patientId: 'usr_pat_1', metricType: 'weight', value: 68.5, unit: 'kg', recordedAt: '2026-07-01T08:00:00Z', notes: 'Baseline summer weigh-in' },
    { id: 'met_w_2', patientId: 'usr_pat_1', metricType: 'weight', value: 68.0, unit: 'kg', recordedAt: '2026-08-01T08:00:00Z' },
    { id: 'met_w_3', patientId: 'usr_pat_1', metricType: 'weight', value: 67.2, unit: 'kg', recordedAt: '2026-09-01T08:00:00Z', notes: 'Initiated 30 min morning walk + Surya Namaskar' },
    { id: 'met_w_4', patientId: 'usr_pat_1', metricType: 'weight', value: 66.8, unit: 'kg', recordedAt: '2026-10-01T08:00:00Z' },
    { id: 'met_w_5', patientId: 'usr_pat_1', metricType: 'weight', value: 66.2, unit: 'kg', recordedAt: '2026-10-22T08:00:00Z', notes: 'Healthy weight reduction on track' },

    // Height reading (cm) for BMI calculation (172 cm, weight 66.2 kg => BMI = 22.38)
    { id: 'met_h_1', patientId: 'usr_pat_1', metricType: 'height', value: 172, unit: 'cm', recordedAt: '2026-07-01T08:00:00Z', notes: 'Stadiometer clinic measurement' },

    // Blood Pressure readings (systolic / diastolic mmHg)
    { id: 'met_bp_1', patientId: 'usr_pat_1', metricType: 'blood_pressure', value: 136, systolic: 136, diastolic: 88, unit: 'mmHg', recordedAt: '2026-08-01T08:30:00Z', isOutOfRange: true, notes: 'Pre-medication evaluation' },
    { id: 'met_bp_2', patientId: 'usr_pat_1', metricType: 'blood_pressure', value: 128, systolic: 128, diastolic: 84, unit: 'mmHg', recordedAt: '2026-08-20T08:30:00Z', isOutOfRange: false },
    { id: 'met_bp_3', patientId: 'usr_pat_1', metricType: 'blood_pressure', value: 124, systolic: 124, diastolic: 80, unit: 'mmHg', recordedAt: '2026-09-15T08:30:00Z', isOutOfRange: false },
    { id: 'met_bp_4', patientId: 'usr_pat_1', metricType: 'blood_pressure', value: 120, systolic: 120, diastolic: 78, unit: 'mmHg', recordedAt: '2026-10-05T08:30:00Z', isOutOfRange: false },
    { id: 'met_bp_5', patientId: 'usr_pat_1', metricType: 'blood_pressure', value: 118, systolic: 118, diastolic: 76, unit: 'mmHg', recordedAt: '2026-10-22T08:30:00Z', isOutOfRange: false, notes: 'Resting morning reading at home' },

    // Heart Rate readings (bpm)
    { id: 'met_hr_1', patientId: 'usr_pat_1', metricType: 'heart_rate', value: 76, unit: 'bpm', recordedAt: '2026-08-01T08:30:00Z' },
    { id: 'met_hr_2', patientId: 'usr_pat_1', metricType: 'heart_rate', value: 74, unit: 'bpm', recordedAt: '2026-08-20T08:30:00Z' },
    { id: 'met_hr_3', patientId: 'usr_pat_1', metricType: 'heart_rate', value: 70, unit: 'bpm', recordedAt: '2026-09-15T08:30:00Z' },
    { id: 'met_hr_4', patientId: 'usr_pat_1', metricType: 'heart_rate', value: 68, unit: 'bpm', recordedAt: '2026-10-05T08:30:00Z' },
    { id: 'met_hr_5', patientId: 'usr_pat_1', metricType: 'heart_rate', value: 66, unit: 'bpm', recordedAt: '2026-10-22T08:30:00Z', notes: 'Resting pulse' },

    // Blood Glucose readings (mg/dL)
    { id: 'met_bg_1', patientId: 'usr_pat_1', metricType: 'blood_glucose', value: 94, unit: 'mg/dL', recordedAt: '2026-08-11T07:30:00Z', notes: 'Fasting 10 hours' },
    { id: 'met_bg_2', patientId: 'usr_pat_1', metricType: 'blood_glucose', value: 92, unit: 'mg/dL', recordedAt: '2026-09-10T07:30:00Z', notes: 'Fasting' },
    { id: 'met_bg_3', patientId: 'usr_pat_1', metricType: 'blood_glucose', value: 90, unit: 'mg/dL', recordedAt: '2026-10-18T07:30:00Z', notes: 'Fasting home glucometer check' },

    // Oxygen Saturation SpO2 (%)
    { id: 'met_ox_1', patientId: 'usr_pat_1', metricType: 'oxygen_saturation', value: 99, unit: '%', recordedAt: '2026-10-22T08:35:00Z', notes: 'Pulse oximeter reading' },

    // Body Temperature (°F)
    { id: 'met_tp_1', patientId: 'usr_pat_1', metricType: 'body_temperature', value: 98.4, unit: '°F', recordedAt: '2026-10-22T08:35:00Z' }
  ],
  healthGoals: [
    {
      id: 'goal_501',
      patientId: 'usr_pat_1',
      goalType: 'target_weight',
      goalName: 'Target Healthy Weight',
      targetValue: 64,
      currentValue: 66.2,
      unit: 'kg',
      startDate: '2026-07-01',
      targetDate: '2026-12-31',
      status: 'in_progress'
    },
    {
      id: 'goal_502',
      patientId: 'usr_pat_1',
      goalType: 'daily_steps',
      goalName: 'Morning Park Walk & Steps',
      targetValue: 10000,
      currentValue: 8850,
      unit: 'steps',
      startDate: '2026-09-01',
      targetDate: '2026-11-30',
      status: 'in_progress'
    },
    {
      id: 'goal_503',
      patientId: 'usr_pat_1',
      goalType: 'water_intake',
      goalName: 'Optimal Daily Hydration (जल सेवन)',
      targetValue: 2800,
      currentValue: 2400,
      unit: 'ml',
      startDate: '2026-08-01',
      targetDate: '2026-12-31',
      status: 'in_progress'
    },
    {
      id: 'goal_504',
      patientId: 'usr_pat_1',
      goalType: 'exercise',
      goalName: 'Yoga & Pranayama (योग व प्राणायाम)',
      targetValue: 30,
      currentValue: 25,
      unit: 'minutes',
      startDate: '2026-09-01',
      targetDate: '2026-11-30',
      status: 'in_progress'
    }
  ],
  dailyWellness: [
    {
      id: 'well_601',
      patientId: 'usr_pat_1',
      date: '2026-10-22',
      waterIntakeMl: 2400,
      sleepHours: 7.5,
      steps: 8850,
      exerciseMinutes: 30,
      calories: 1940,
      mood: 'good',
      notes: 'Morning brisk walk in Cubbon Park + 15 min Anulom Vilom Pranayama.'
    },
    {
      id: 'well_602',
      patientId: 'usr_pat_1',
      date: '2026-10-21',
      waterIntakeMl: 2500,
      sleepHours: 8.0,
      steps: 9400,
      exerciseMinutes: 40,
      calories: 2020,
      mood: 'great',
      notes: 'Excellent energy. Avoided deep fried food and high-sodium snacks.'
    },
    {
      id: 'well_603',
      patientId: 'usr_pat_1',
      date: '2026-10-20',
      waterIntakeMl: 2100,
      sleepHours: 7.0,
      steps: 7200,
      exerciseMinutes: 20,
      calories: 1890,
      mood: 'neutral',
      notes: 'Busy office meetings; completed evening walk after dinner.'
    }
  ],
  notifications: [
    {
      id: 'notif_701',
      userId: 'usr_pat_1',
      type: 'appointment_reminder',
      title: 'Upcoming OPD Consultation',
      message: 'Your Cardiology consultation with Dr. Rajesh K. Sharma at Apollo Heart Centre is scheduled for October 26, 2026 at 11:00 AM.',
      isRead: false,
      createdAt: '2026-10-23T08:00:00.000Z',
      link: '/appointments'
    },
    {
      id: 'notif_702',
      userId: 'usr_pat_1',
      type: 'medication_reminder',
      title: 'Dose Reminder: Telma 40',
      message: 'Reminder: Take Telmisartan 40mg with water after morning breakfast.',
      isRead: false,
      createdAt: '2026-10-23T08:00:00.000Z',
      link: '/medications'
    },
    {
      id: 'notif_703',
      userId: 'usr_pat_1',
      type: 'new_prescription',
      title: 'ABDM Verified Digital Prescription',
      message: 'Dr. Rajesh K. Sharma generated a verified digital prescription linked to your ABHA ID 91-4421-8890-1204.',
      isRead: true,
      createdAt: '2026-08-14T12:05:00.000Z',
      link: '/prescriptions'
    },
    {
      id: 'notif_704',
      userId: 'usr_doc_1',
      type: 'appointment_confirmation',
      title: 'Confirmed OPD Appointment',
      message: 'Rohan Verma (ABHA: 91-4421-8890-1204) confirmed in-person Cardiology review for October 26, 2026 at 11:00 AM.',
      isRead: false,
      createdAt: '2026-10-18T10:00:00.000Z',
      link: '/doctor/appointments'
    }
  ],
  messages: [
    {
      id: 'msg_801',
      senderId: 'usr_doc_1',
      senderName: 'Dr. Rajesh K. Sharma, MD, DM',
      senderRole: 'doctor',
      receiverId: 'usr_pat_1',
      receiverName: 'Rohan Verma',
      receiverRole: 'patient',
      message: 'Namaste Rohan, I reviewed your recent home blood pressure readings on the ArogyaPulse portal. The systolic readings stabilized nicely at 118–122 mmHg with Telma 40.',
      isRead: true,
      createdAt: '2026-10-18T16:20:00.000Z'
    },
    {
      id: 'msg_802',
      senderId: 'usr_pat_1',
      senderName: 'Rohan Verma',
      senderRole: 'patient',
      receiverId: 'usr_doc_1',
      receiverName: 'Dr. Rajesh K. Sharma, MD, DM',
      receiverRole: 'doctor',
      message: 'Thank you Dr. Sharma! Taking Telma 40 regularly with my morning walk and reducing salt in our meals has made a significant difference. Looking forward to our review on the 26th.',
      isRead: true,
      createdAt: '2026-10-18T16:45:00.000Z'
    },
    {
      id: 'msg_803',
      senderId: 'usr_doc_1',
      senderName: 'Dr. Rajesh K. Sharma, MD, DM',
      senderRole: 'doctor',
      receiverId: 'usr_pat_1',
      receiverName: 'Rohan Verma',
      receiverRole: 'patient',
      message: 'Very good! Please bring your recent Dr. Lal PathLabs report or keep your ABHA health record handy on the app during our clinic consultation.',
      isRead: false,
      createdAt: '2026-10-19T09:10:00.000Z'
    }
  ],
  auditLogs: [
    {
      id: 'aud_901',
      userId: 'usr_admin_1',
      userName: 'Dr. A. Swaminathan',
      role: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'AROGYAPULSE_CORE',
      entityId: 'ABDM_NODE_01',
      timestamp: '2026-10-23T02:00:00.000Z',
      ipAddress: '127.0.0.1'
    },
    {
      id: 'aud_902',
      userId: 'usr_pat_1',
      userName: 'Rohan Verma',
      role: 'patient',
      action: 'HEALTH_METRIC_RECORDED',
      entityType: 'HEALTH_METRIC',
      entityId: 'met_bp_5',
      timestamp: '2026-10-22T08:30:00.000Z',
      ipAddress: '103.21.124.55'
    },
    {
      id: 'aud_903',
      userId: 'usr_doc_1',
      userName: 'Dr. Rajesh K. Sharma, MD, DM',
      role: 'doctor',
      action: 'PRESCRIPTION_GENERATED',
      entityType: 'PRESCRIPTION',
      entityId: 'rx_301',
      timestamp: '2026-08-14T12:00:00.000Z',
      ipAddress: '103.55.80.12'
    }
  ],
  metricThresholds: [
    {
      id: 'th_bmi_1',
      patientId: 'usr_pat_1',
      metricType: 'bmi',
      title: 'BMI Overweight Caution Alert',
      condition: 'greater_than',
      thresholdValue: 25.0,
      unit: 'kg/m²',
      severity: 'advisory',
      enabled: true,
      notifyChannels: { inApp: true, soundChime: true, smsAlert: false, emailAlert: true },
      customMessage: 'BMI exceeded healthy threshold (24.9). Review dietary portion sizes & increase daily walk.',
      lastTriggeredAt: '2026-10-20T08:00:00.000Z'
    },
    {
      id: 'th_weight_1',
      patientId: 'usr_pat_1',
      metricType: 'weight',
      title: 'Body Weight Maintenance Upper Bound',
      condition: 'greater_than',
      thresholdValue: 70.0,
      unit: 'kg',
      severity: 'advisory',
      enabled: true,
      notifyChannels: { inApp: true, soundChime: true, smsAlert: true, emailAlert: false },
      customMessage: 'Body weight exceeded the 70.0 kg target maintenance ceiling.',
      lastTriggeredAt: '2026-07-01T08:00:00.000Z'
    },
    {
      id: 'th_bp_1',
      patientId: 'usr_pat_1',
      metricType: 'blood_pressure',
      title: 'Systolic Blood Pressure Elevated Threshold',
      condition: 'greater_than',
      thresholdValue: 135,
      unit: 'mmHg',
      severity: 'critical',
      enabled: true,
      notifyChannels: { inApp: true, soundChime: true, smsAlert: true, emailAlert: true },
      customMessage: 'Systolic blood pressure above 135 mmHg. Rest calmly for 10 minutes, drink water, and re-check.',
      lastTriggeredAt: '2026-08-14T10:00:00.000Z'
    },
    {
      id: 'th_sugar_1',
      patientId: 'usr_pat_1',
      metricType: 'blood_glucose',
      title: 'Fasting Blood Sugar Alert Threshold',
      condition: 'greater_than',
      thresholdValue: 125,
      unit: 'mg/dL',
      severity: 'critical',
      enabled: true,
      notifyChannels: { inApp: true, soundChime: false, smsAlert: false, emailAlert: true },
      customMessage: 'Fasting glucose level exceeded 125 mg/dL. Monitor carbohydrate intake and log symptoms.',
      lastTriggeredAt: undefined
    },
    {
      id: 'th_spo2_1',
      patientId: 'usr_pat_1',
      metricType: 'oxygen_saturation',
      title: 'Low Oxygen Saturation Alert (SpO2)',
      condition: 'less_than',
      thresholdValue: 95,
      unit: '%',
      severity: 'critical',
      enabled: true,
      notifyChannels: { inApp: true, soundChime: true, smsAlert: true, emailAlert: true },
      customMessage: 'SpO2 level below 95%. Ensure warm fingertips, reposition sensor, or contact healthcare helpline 108/112 if breathless.',
      lastTriggeredAt: undefined
    }
  ]
};

// Aliases mapping so both old email addresses and new Indian email addresses resolve to the same account
const EMAIL_ALIASES: Record<string, string> = {
  'elena@healthpulse.com': 'rohan@arogyapulse.in',
  'dr.chen@healthpulse.com': 'dr.rajesh@arogyapulse.in',
  'dr.vance@healthpulse.com': 'dr.ananya@arogyapulse.in',
  'dr.sharma@healthpulse.com': 'dr.sen@arogyapulse.in',
  'admin@healthpulse.com': 'admin@arogyapulse.in',
  'david.kim@healthpulse.com': 'priya@arogyapulse.in'
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // If file contains older persona format, merge with updated Indian SEED_DATA
        if (parsed.users && parsed.users.some((u: any) => u.email === 'rohan@arogyapulse.in')) {
          const merged = { ...SEED_DATA, ...parsed };
          if (!merged.metricThresholds || merged.metricThresholds.length === 0) {
            merged.metricThresholds = SEED_DATA.metricThresholds;
          }
          return merged;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, falling back to seed data:', err);
    }
    const fresh = JSON.parse(JSON.stringify(SEED_DATA));
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(fresh, null, 2), 'utf-8');
    } catch (e) {}
    return fresh;
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // Users
  getUsers() { return this.data.users; }
  getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  
  getUserByEmail(email: string) {
    const normalized = email.toLowerCase().trim();
    const targetEmail = EMAIL_ALIASES[normalized] || normalized;
    return this.data.users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase() || u.email.toLowerCase() === normalized);
  }
  
  createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.persist();
    saveRecordToSupabase('users', user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      saveRecordToSupabase('users', this.data.users[idx]);
      return this.data.users[idx];
    }
    return null;
  }

  deleteUser(id: string) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.patientProfiles = this.data.patientProfiles.filter(p => p.userId !== id);
    this.data.doctorProfiles = this.data.doctorProfiles.filter(d => d.userId !== id);
    this.persist();
    deleteRecordFromSupabase('users', id);
  }

  // Profiles
  getPatientProfileByUserId(userId: string) {
    return this.data.patientProfiles.find(p => p.userId === userId);
  }

  createOrUpdatePatientProfile(userId: string, profile: Partial<PatientProfile>) {
    const idx = this.data.patientProfiles.findIndex(p => p.userId === userId);
    if (idx !== -1) {
      this.data.patientProfiles[idx] = { ...this.data.patientProfiles[idx], ...profile };
    } else {
      const newProf: PatientProfile = {
        id: 'pat_prof_' + Date.now(),
        userId,
        abhaId: profile.abhaId || '91-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000),
        abhaAddress: profile.abhaAddress || `user${Math.floor(1000 + Math.random() * 9000)}@abdm`,
        dateOfBirth: profile.dateOfBirth || '1994-01-01',
        gender: profile.gender || 'prefer-not-to-say',
        bloodGroup: profile.bloodGroup || 'B+',
        address: profile.address || '',
        emergencyContact: profile.emergencyContact || { name: '', relationship: '', phone: '' },
        allergies: profile.allergies || [],
        chronicConditions: profile.chronicConditions || [],
        medicalHistory: profile.medicalHistory || []
      };
      this.data.patientProfiles.push(newProf);
    }
    this.persist();
    const updated = this.getPatientProfileByUserId(userId);
    if (updated) saveRecordToSupabase('patient_profiles', updated);
    return updated;
  }

  getDoctorProfileByUserId(userId: string) {
    return this.data.doctorProfiles.find(d => d.userId === userId);
  }

  getDoctorsWithProfiles() {
    return this.data.users
      .filter(u => u.role === 'doctor')
      .map(u => {
        const profile = this.data.doctorProfiles.find(d => d.userId === u.id);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          status: u.status,
          profileImage: u.profileImage,
          createdAt: u.createdAt,
          profile: profile || null
        };
      });
  }

  createOrUpdateDoctorProfile(userId: string, profile: Partial<DoctorProfile>) {
    const idx = this.data.doctorProfiles.findIndex(d => d.userId === userId);
    if (idx !== -1) {
      this.data.doctorProfiles[idx] = { ...this.data.doctorProfiles[idx], ...profile };
    } else {
      const newProf: DoctorProfile = {
        id: 'doc_prof_' + Date.now(),
        userId,
        specialization: profile.specialization || 'General Medicine',
        qualification: profile.qualification || 'MBBS, MD',
        experience: profile.experience || 10,
        licenseNumber: profile.licenseNumber || 'DMC-2015-' + Math.floor(10000 + Math.random() * 90000),
        clinic: profile.clinic || 'Arogya Medical Super Speciality Clinic',
        consultationFee: profile.consultationFee || 800,
        bio: profile.bio || '',
        verificationStatus: profile.verificationStatus || 'verified',
        availableDays: profile.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableSlots: profile.availableSlots || ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM'],
        languages: profile.languages || ['English', 'Hindi']
      };
      this.data.doctorProfiles.push(newProf);
    }
    this.persist();
    const updated = this.getDoctorProfileByUserId(userId);
    if (updated) saveRecordToSupabase('doctor_profiles', updated);
    return updated;
  }

  // Appointments
  getAppointments() { return this.data.appointments; }
  getAppointmentById(id: string) { return this.data.appointments.find(a => a.id === id); }
  
  createAppointment(apt: Appointment) {
    const collision = this.data.appointments.find(
      a => a.doctorId === apt.doctorId && 
           a.appointmentDate === apt.appointmentDate && 
           a.appointmentTime === apt.appointmentTime &&
           a.status !== 'cancelled'
    );
    if (collision) {
      throw new Error(`Doctor already has a booking at ${apt.appointmentTime} on ${apt.appointmentDate}`);
    }
    this.data.appointments.push(apt);
    this.persist();
    saveRecordToSupabase('appointments', apt);
    return apt;
  }

  updateAppointment(id: string, updates: Partial<Appointment>) {
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.appointments[idx] = { ...this.data.appointments[idx], ...updates };
      this.persist();
      saveRecordToSupabase('appointments', this.data.appointments[idx]);
      return this.data.appointments[idx];
    }
    return null;
  }

  deleteAppointment(id: string) {
    this.data.appointments = this.data.appointments.filter(a => a.id !== id);
    this.persist();
    deleteRecordFromSupabase('appointments', id);
  }

  // Medical Records
  getMedicalRecords() { return this.data.medicalRecords; }
  getMedicalRecordById(id: string) { return this.data.medicalRecords.find(r => r.id === id); }
  
  createMedicalRecord(rec: MedicalRecord) {
    this.data.medicalRecords.push(rec);
    this.persist();
    saveRecordToSupabase('medical_records', rec);
    return rec;
  }

  updateMedicalRecord(id: string, updates: Partial<MedicalRecord>) {
    const idx = this.data.medicalRecords.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.medicalRecords[idx] = { ...this.data.medicalRecords[idx], ...updates };
      this.persist();
      saveRecordToSupabase('medical_records', this.data.medicalRecords[idx]);
      return this.data.medicalRecords[idx];
    }
    return null;
  }

  deleteMedicalRecord(id: string) {
    this.data.medicalRecords = this.data.medicalRecords.filter(r => r.id !== id);
    this.persist();
    deleteRecordFromSupabase('medical_records', id);
  }

  // Prescriptions
  getPrescriptions() { return this.data.prescriptions; }
  getPrescriptionById(id: string) { return this.data.prescriptions.find(p => p.id === id); }
  
  createPrescription(rx: Prescription) {
    this.data.prescriptions.push(rx);
    this.persist();
    saveRecordToSupabase('prescriptions', rx);
    return rx;
  }

  updatePrescription(id: string, updates: Partial<Prescription>) {
    const idx = this.data.prescriptions.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.prescriptions[idx] = { ...this.data.prescriptions[idx], ...updates };
      this.persist();
      saveRecordToSupabase('prescriptions', this.data.prescriptions[idx]);
      return this.data.prescriptions[idx];
    }
    return null;
  }

  deletePrescription(id: string) {
    this.data.prescriptions = this.data.prescriptions.filter(p => p.id !== id);
    this.persist();
    deleteRecordFromSupabase('prescriptions', id);
  }

  // Medications
  getMedications() { return this.data.medications; }
  
  createMedication(med: Medication) {
    this.data.medications.push(med);
    this.persist();
    saveRecordToSupabase('medications', med);
    return med;
  }

  updateMedication(id: string, updates: Partial<Medication>) {
    const idx = this.data.medications.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.medications[idx] = { ...this.data.medications[idx], ...updates };
      this.persist();
      saveRecordToSupabase('medications', this.data.medications[idx]);
      return this.data.medications[idx];
    }
    return null;
  }

  deleteMedication(id: string) {
    this.data.medications = this.data.medications.filter(m => m.id !== id);
    this.persist();
    deleteRecordFromSupabase('medications', id);
  }

  // Health Metrics
  getHealthMetrics() { return this.data.healthMetrics; }
  
  createHealthMetric(metric: HealthMetric) {
    this.data.healthMetrics.push(metric);
    this.persist();
    saveRecordToSupabase('health_metrics', metric);
    return metric;
  }

  deleteHealthMetric(id: string) {
    this.data.healthMetrics = this.data.healthMetrics.filter(m => m.id !== id);
    this.persist();
    deleteRecordFromSupabase('health_metrics', id);
  }

  // Health Goals
  getHealthGoals() { return this.data.healthGoals; }
  
  createHealthGoal(goal: HealthGoal) {
    this.data.healthGoals.push(goal);
    this.persist();
    saveRecordToSupabase('health_goals', goal);
    return goal;
  }

  updateHealthGoal(id: string, updates: Partial<HealthGoal>) {
    const idx = this.data.healthGoals.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.data.healthGoals[idx] = { ...this.data.healthGoals[idx], ...updates };
      this.persist();
      saveRecordToSupabase('health_goals', this.data.healthGoals[idx]);
      return this.data.healthGoals[idx];
    }
    return null;
  }

  deleteHealthGoal(id: string) {
    this.data.healthGoals = this.data.healthGoals.filter(g => g.id !== id);
    this.persist();
    deleteRecordFromSupabase('health_goals', id);
  }

  // Daily Wellness
  getDailyWellness() { return this.data.dailyWellness; }
  
  upsertDailyWellness(wellness: DailyWellness) {
    const idx = this.data.dailyWellness.findIndex(w => w.patientId === wellness.patientId && w.date === wellness.date);
    if (idx !== -1) {
      this.data.dailyWellness[idx] = { ...this.data.dailyWellness[idx], ...wellness };
    } else {
      this.data.dailyWellness.push(wellness);
    }
    this.persist();
    saveRecordToSupabase('daily_wellness', wellness);
    return wellness;
  }

  // Notifications
  getNotifications() { return this.data.notifications; }
  
  createNotification(notif: Notification) {
    this.data.notifications.unshift(notif);
    this.persist();
    saveRecordToSupabase('notifications', notif);
    return notif;
  }

  markNotificationRead(id: string) {
    const idx = this.data.notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notifications[idx].isRead = true;
      this.persist();
      return this.data.notifications[idx];
    }
    return null;
  }

  markAllNotificationsRead(userId: string) {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.persist();
  }

  deleteNotification(id: string) {
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    this.persist();
  }

  // Messages
  getMessages() { return this.data.messages; }
  
  createMessage(msg: Message) {
    this.data.messages.push(msg);
    this.persist();
    saveRecordToSupabase('messages', msg);
    return msg;
  }

  markMessageRead(id: string) {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.messages[idx].isRead = true;
      this.persist();
      return this.data.messages[idx];
    }
    return null;
  }

  // Audit Logs
  getAuditLogs() { return this.data.auditLogs; }
  
  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      id: 'aud_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      ...log
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.persist();
    saveRecordToSupabase('audit_logs', entry);
    return entry;
  }

  // Metric Threshold Alerts
  getMetricThresholds(patientId?: string) {
    if (!this.data.metricThresholds) this.data.metricThresholds = [];
    if (patientId) {
      return this.data.metricThresholds.filter(t => t.patientId === patientId);
    }
    return this.data.metricThresholds;
  }

  createMetricThreshold(alert: MetricThresholdAlert) {
    if (!this.data.metricThresholds) this.data.metricThresholds = [];
    this.data.metricThresholds.push(alert);
    this.persist();
    saveRecordToSupabase('metric_thresholds', alert);
    return alert;
  }

  updateMetricThreshold(id: string, updates: Partial<MetricThresholdAlert>) {
    if (!this.data.metricThresholds) this.data.metricThresholds = [];
    const idx = this.data.metricThresholds.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.metricThresholds[idx] = { ...this.data.metricThresholds[idx], ...updates };
      this.persist();
      saveRecordToSupabase('metric_thresholds', this.data.metricThresholds[idx]);
      return this.data.metricThresholds[idx];
    }
    return null;
  }

  deleteMetricThreshold(id: string) {
    if (!this.data.metricThresholds) this.data.metricThresholds = [];
    this.data.metricThresholds = this.data.metricThresholds.filter(t => t.id !== id);
    this.persist();
    deleteRecordFromSupabase('metric_thresholds', id);
  }

  // Export full data snapshot for batch cloud syncing
  getAllData() {
    return this.data;
  }
}

export const db = new DatabaseManager();
