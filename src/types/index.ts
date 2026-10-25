export type UserRole = 'patient' | 'doctor' | 'admin';
export type UserStatus = 'active' | 'inactive';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  abhaId?: string; // 14-digit Ayushman Bharat Health Account ID
  abhaAddress?: string; // e.g. rohan.verma@abdm
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  bloodGroup: string;
  address: string;
  emergencyContact: EmergencyContact;
  allergies: string[];
  chronicConditions: string[];
  medicalHistory: string[];
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number; // in years
  licenseNumber: string; // e.g. DMC-2008-44910 / MCI
  clinic: string;
  consultationFee: number; // in INR (₹)
  bio: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  availableDays: string[];
  availableSlots: string[];
  languages: string[];
}

export type AppointmentType = 'in-person' | 'video';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorClinic?: string;
  doctorFee?: number;
  appointmentDate: string;
  appointmentTime: string;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  consultationNotes?: string;
  createdAt: string;
}

export type MedicalRecordType = 
  | 'blood_report'
  | 'x_ray'
  | 'mri'
  | 'ct_scan'
  | 'prescription'
  | 'discharge_summary'
  | 'other';

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  title: string;
  type: MedicalRecordType;
  fileUrl: string;
  fileName?: string;
  fileSize?: string;
  description: string;
  recordDate: string;
  hospital: string;
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientAbhaId?: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorLicense?: string;
  doctorClinic?: string;
  doctorPhone?: string;
  diagnosis: string;
  notes?: string;
  prescriptionDate: string;
  items: PrescriptionItem[];
}

export interface AdherenceLog {
  date: string;
  status: 'taken' | 'skipped';
  timestamp: string;
}

export interface Medication {
  id: string;
  patientId: string;
  prescriptionItemId?: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  time: string;
  quantity: number;
  remainingQuantity: number;
  instructions: string;
  prescribingDoctor: string;
  status: 'active' | 'completed' | 'discontinued';
  adherenceLogs: AdherenceLog[];
}

export type MetricType = 
  | 'weight'
  | 'height'
  | 'blood_pressure'
  | 'heart_rate'
  | 'blood_glucose'
  | 'body_temperature'
  | 'oxygen_saturation';

export interface HealthMetric {
  id: string;
  patientId: string;
  metricType: MetricType;
  value: number;
  systolic?: number;
  diastolic?: number;
  unit: string;
  recordedAt: string;
  notes?: string;
  isOutOfRange?: boolean;
}

export type AlertMetricType = MetricType | 'bmi';
export type AlertCondition = 'greater_than' | 'less_than' | 'outside_range';
export type AlertSeverity = 'info' | 'advisory' | 'critical';

export interface AlertChannelPreferences {
  inApp: boolean;
  soundChime: boolean;
  smsAlert: boolean;
  emailAlert: boolean;
}

export interface MetricThresholdAlert {
  id: string;
  patientId: string;
  metricType: AlertMetricType;
  title: string;
  condition: AlertCondition;
  thresholdValue: number;
  thresholdMax?: number;
  unit: string;
  severity: AlertSeverity;
  enabled: boolean;
  notifyChannels: AlertChannelPreferences;
  customMessage?: string;
  lastTriggeredAt?: string;
  isTriggered?: boolean;
  currentValue?: number;
}

export type GoalType = 'target_weight' | 'daily_steps' | 'water_intake' | 'exercise' | 'sleep_duration';

export interface HealthGoal {
  id: string;
  patientId: string;
  goalType: GoalType;
  goalName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: 'in_progress' | 'completed' | 'missed';
}

export interface DailyWellness {
  id: string;
  patientId: string;
  date: string;
  waterIntakeMl: number;
  sleepHours: number;
  steps: number;
  exerciseMinutes: number;
  calories: number;
  mood: 'great' | 'good' | 'neutral' | 'tired' | 'unwell';
  notes: string;
}

export type NotificationType = 
  | 'appointment_reminder'
  | 'medication_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancellation'
  | 'new_prescription'
  | 'medical_report_uploaded'
  | 'health_goal_reminder'
  | 'metric_alert'
  | 'general';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverRole: UserRole;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
}

export interface AdminAnalyticsData {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  activeUsers: number;
  userRegistrationsTrend: { month: string; patients: number; doctors: number }[];
  appointmentsPerMonth: { month: string; completed: number; pending: number; cancelled: number }[];
  doctorSpecialties: { specialty: string; count: number }[];
  appointmentStatusCounts: { name: string; value: number }[];
  medicalRecordUploads: { month: string; uploads: number }[];
}

export interface MetricAnalysisItem {
  metric: string;
  value?: string | number;
  status: 'optimal' | 'elevated' | 'attention' | 'low';
  trend: 'improving' | 'stable' | 'concerning' | 'neutral';
  interpretation: string;
}

export interface LifestyleAdjustment {
  category: string;
  recommendation: string;
  rationale: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface AiHealthSummary {
  headline: string;
  overallStatus: string;
  statusColor: 'emerald' | 'amber' | 'teal' | 'rose';
  metricsAnalysis: MetricAnalysisItem[];
  positiveObservations: string[];
  areasForAttention: string[];
  lifestyleAdjustments: LifestyleAdjustment[];
  generatedAt: string;
  modelUsed?: string;
  disclaimer: string;
}
