import { createClient, SupabaseClient } from '@supabase/supabase-js';

function resolveSupabaseUrl(rawUrl?: string, rawProjectId?: string): string {
  const fallback = 'https://kfrvlmtbayncwlmzkdii.supabase.co';
  const candidate = (rawUrl || '').trim().replace(/^["']|["']$/g, '');
  if (!candidate) {
    const pid = (rawProjectId || '').trim().replace(/^["']|["']$/g, '');
    if (pid) return `https://${pid}.supabase.co`;
    return fallback;
  }
  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate.replace(/\/+$/, '');
  }
  // If candidate is a bare project ID like 'kfrvlmtbayncwlmzkdii'
  return `https://${candidate}.supabase.co`;
}

function resolveSupabaseKey(rawKey?: string): string {
  const fallback = 'sb_publishable_0I-SIc1-ku00VJ-wW1oBiw_BNtP9q_Z';
  const candidate = (rawKey || '').trim().replace(/^["']|["']$/g, '');
  return candidate || fallback;
}

const SUPABASE_PROJECT_ID = (process.env.SUPABASE_PROJECT_ID || process.env.VITE_SUPABASE_PROJECT_ID || 'kfrvlmtbayncwlmzkdii').trim().replace(/^["']|["']$/g, '');
const SUPABASE_URL = resolveSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, SUPABASE_PROJECT_ID);
const SUPABASE_ANON_KEY = resolveSupabaseKey(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

function initSupabaseServer(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (err) {
    console.warn('Initial Supabase client creation warning, using fallback:', err);
    return createClient('https://kfrvlmtbayncwlmzkdii.supabase.co', 'sb_publishable_0I-SIc1-ku00VJ-wW1oBiw_BNtP9q_Z', {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
}

export const supabaseServer: SupabaseClient = initSupabaseServer();

export interface SupabaseSyncLog {
  id: string;
  table: string;
  recordId: string;
  action: 'insert' | 'update' | 'upsert' | 'delete';
  status: 'synced' | 'pending' | 'table_not_found' | 'error';
  details?: string;
  timestamp: string;
}

// In-memory sync log for real-time visibility in UI
const syncLogs: SupabaseSyncLog[] = [];
let totalSyncSuccess = 0;
let totalSyncAttempts = 0;

/**
 * Clean and normalize object for Postgres/Supabase upsert
 */
function normalizeRecordForSupabase(table: string, data: any): Record<string, any> {
  const record: Record<string, any> = {};

  for (const [key, val] of Object.entries(data)) {
    // Exclude password hashes from being broadcasted
    if (key === 'passwordHash') continue;

    // Convert camelCase to snake_case for standard Supabase PostgreSQL column conventions
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

    if (val === undefined) {
      record[snakeKey] = null;
    } else if (typeof val === 'object' && val !== null) {
      // Arrays and nested objects can be stored as JSONB or JSON strings in Postgres
      record[snakeKey] = val;
    } else {
      record[snakeKey] = val;
    }
  }

  return record;
}

/**
 * Automatically save or update any record to Supabase
 */
export async function saveRecordToSupabase(
  table: string,
  data: any,
  action: 'insert' | 'update' | 'upsert' = 'upsert'
): Promise<{ success: boolean; status: string; error?: string }> {
  totalSyncAttempts++;
  const recordId = data.id || data.userId || String(Date.now());
  const logId = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  try {
    const payload = normalizeRecordForSupabase(table, data);

    const { error } = await supabaseServer
      .from(table)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      // Check if table does not exist in Supabase yet
      const isMissingTable =
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('relation') ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('schema cache');

      const status = isMissingTable ? 'table_not_found' : 'error';
      const logEntry: SupabaseSyncLog = {
        id: logId,
        table,
        recordId,
        action,
        status,
        details: isMissingTable
          ? `Table '${table}' not found in Supabase. Apply SQL schema from modal to create.`
          : error.message,
        timestamp: new Date().toISOString()
      };

      syncLogs.unshift(logEntry);
      if (syncLogs.length > 100) syncLogs.pop();

      return { success: false, status, error: error.message };
    }

    // Success
    totalSyncSuccess++;
    const logEntry: SupabaseSyncLog = {
      id: logId,
      table,
      recordId,
      action,
      status: 'synced',
      details: `Saved to ${table} in Supabase project ${SUPABASE_PROJECT_ID}`,
      timestamp: new Date().toISOString()
    };

    syncLogs.unshift(logEntry);
    if (syncLogs.length > 100) syncLogs.pop();

    return { success: true, status: 'synced' };
  } catch (err: any) {
    const logEntry: SupabaseSyncLog = {
      id: logId,
      table,
      recordId,
      action,
      status: 'error',
      details: err.message || 'Network exception saving to Supabase',
      timestamp: new Date().toISOString()
    };

    syncLogs.unshift(logEntry);
    if (syncLogs.length > 100) syncLogs.pop();

    return { success: false, status: 'error', error: err.message };
  }
}

/**
 * Delete record from Supabase
 */
export async function deleteRecordFromSupabase(table: string, id: string) {
  try {
    await supabaseServer.from(table).delete().eq('id', id);
  } catch (e) {
    // Graceful silent ignore if offline
  }
}

/**
 * Return sync statistics and recent activity logs
 */
export function getSupabaseSyncStats() {
  return {
    projectId: SUPABASE_PROJECT_ID,
    projectUrl: SUPABASE_URL,
    totalAttempts: totalSyncAttempts,
    successfulSyncs: totalSyncSuccess,
    recentLogs: syncLogs.slice(0, 30),
    activeConfig: {
      url: SUPABASE_URL,
      keyMasked: `${SUPABASE_ANON_KEY.substring(0, 14)}...${SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 4)}`
    }
  };
}

/**
 * Full PostgreSQL Schema DDL script for Supabase SQL Editor
 */
export function getSupabaseSqlSchema(): string {
  return `-- =========================================================================
-- ArogyaPulse Healthcare Database Schema for Supabase
-- Project ID: ${SUPABASE_PROJECT_ID}
-- Run this in your Supabase Project -> SQL Editor to initialize all tables
-- =========================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient',
  profile_image TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Patient Profiles (ABHA integration)
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  abha_id TEXT,
  abha_address TEXT,
  date_of_birth TEXT,
  gender TEXT,
  blood_group TEXT,
  address TEXT,
  emergency_contact JSONB,
  allergies JSONB DEFAULT '[]'::jsonb,
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  medical_history JSONB DEFAULT '[]'::jsonb
);

-- 3. Doctor Profiles (NMC Credentials & Slots)
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  specialization TEXT,
  qualification TEXT,
  experience INTEGER,
  license_number TEXT,
  clinic TEXT,
  consultation_fee NUMERIC,
  bio TEXT,
  verification_status TEXT DEFAULT 'verified',
  available_days JSONB DEFAULT '[]'::jsonb,
  available_slots JSONB DEFAULT '[]'::jsonb,
  languages JSONB DEFAULT '[]'::jsonb
);

-- 4. Health Metrics & Biometrics (Weight, BMI, BP, Glucose)
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  metric_type TEXT NOT NULL,
  value NUMERIC,
  systolic NUMERIC,
  diastolic NUMERIC,
  unit TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  is_out_of_range BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Appointments & OPD Consultations
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  doctor_id TEXT,
  doctor_name TEXT,
  doctor_specialization TEXT,
  doctor_clinic TEXT,
  doctor_fee NUMERIC,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  type TEXT DEFAULT 'in-person',
  reason TEXT,
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  consultation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Medical Records & Lab Diagnostic Reports
CREATE TABLE IF NOT EXISTS public.medical_records (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  doctor_id TEXT,
  doctor_name TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  description TEXT,
  record_date TEXT,
  hospital TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Digital Prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  patient_name TEXT,
  patient_abha_id TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  doctor_id TEXT,
  doctor_name TEXT,
  doctor_specialization TEXT,
  doctor_license TEXT,
  doctor_clinic TEXT,
  doctor_phone TEXT,
  diagnosis TEXT,
  notes TEXT,
  prescription_date TEXT,
  items JSONB DEFAULT '[]'::jsonb
);

-- 8. Medications & Adherence Tracking
CREATE TABLE IF NOT EXISTS public.medications (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  prescription_item_id TEXT,
  medicine_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date TEXT,
  end_date TEXT,
  time TEXT,
  quantity INTEGER,
  remaining_quantity INTEGER,
  instructions TEXT,
  prescribing_doctor TEXT,
  status TEXT DEFAULT 'active',
  adherence_logs JSONB DEFAULT '[]'::jsonb
);

-- 9. Metric Threshold Alerts
CREATE TABLE IF NOT EXISTS public.metric_thresholds (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  metric_type TEXT NOT NULL,
  title TEXT NOT NULL,
  condition TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  threshold_max NUMERIC,
  unit TEXT,
  severity TEXT DEFAULT 'advisory',
  enabled BOOLEAN DEFAULT TRUE,
  notify_channels JSONB,
  custom_message TEXT,
  last_triggered_at TIMESTAMPTZ,
  is_triggered BOOLEAN DEFAULT FALSE,
  current_value NUMERIC
);

-- 10. Health Goals
CREATE TABLE IF NOT EXISTS public.health_goals (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  goal_type TEXT,
  goal_name TEXT,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  start_date TEXT,
  target_date TEXT,
  status TEXT DEFAULT 'in_progress'
);

-- 11. Daily Wellness
CREATE TABLE IF NOT EXISTS public.daily_wellness (
  id TEXT PRIMARY KEY,
  patient_id TEXT,
  date TEXT NOT NULL,
  water_intake_ml NUMERIC DEFAULT 0,
  sleep_hours NUMERIC DEFAULT 0,
  steps INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  mood TEXT,
  notes TEXT
);

-- 12. In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Messages / Doctor-Patient Consultation Chat
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT,
  sender_name TEXT,
  sender_role TEXT,
  receiver_id TEXT,
  receiver_name TEXT,
  receiver_role TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- 14. Audit Logs (Compliance & Security)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & open public access policies for anon client prototyping
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read all" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anon write all" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow anon read metrics" ON public.health_metrics FOR SELECT USING (true);
CREATE POLICY "Allow anon write metrics" ON public.health_metrics FOR ALL USING (true);
CREATE POLICY "Allow anon read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow anon write appointments" ON public.appointments FOR ALL USING (true);
CREATE POLICY "Allow anon read records" ON public.medical_records FOR SELECT USING (true);
CREATE POLICY "Allow anon write records" ON public.medical_records FOR ALL USING (true);
CREATE POLICY "Allow anon read thresholds" ON public.metric_thresholds FOR SELECT USING (true);
CREATE POLICY "Allow anon write thresholds" ON public.metric_thresholds FOR ALL USING (true);
`;
}

/**
 * Push all local records across all tables into Supabase
 */
export async function syncAllDatabaseToSupabase(dbData: any): Promise<{
  totalSynced: number;
  results: Record<string, number>;
  errors: string[];
}> {
  const results: Record<string, number> = {};
  const errors: string[] = [];
  let total = 0;

  const tableMappings: Array<{ key: string; table: string }> = [
    { key: 'users', table: 'users' },
    { key: 'patientProfiles', table: 'patient_profiles' },
    { key: 'doctorProfiles', table: 'doctor_profiles' },
    { key: 'healthMetrics', table: 'health_metrics' },
    { key: 'appointments', table: 'appointments' },
    { key: 'medicalRecords', table: 'medical_records' },
    { key: 'prescriptions', table: 'prescriptions' },
    { key: 'medications', table: 'medications' },
    { key: 'metricThresholds', table: 'metric_thresholds' },
    { key: 'healthGoals', table: 'health_goals' },
    { key: 'dailyWellness', table: 'daily_wellness' },
    { key: 'notifications', table: 'notifications' },
    { key: 'messages', table: 'messages' },
    { key: 'auditLogs', table: 'audit_logs' }
  ];

  for (const mapping of tableMappings) {
    const records = dbData[mapping.key];
    if (Array.isArray(records) && records.length > 0) {
      results[mapping.table] = 0;
      for (const rec of records) {
        const res = await saveRecordToSupabase(mapping.table, rec, 'upsert');
        if (res.success) {
          results[mapping.table]++;
          total++;
        } else if (res.error && !errors.includes(res.error)) {
          errors.push(`${mapping.table}: ${res.error}`);
        }
      }
    }
  }

  return { totalSynced: total, results, errors };
}

export async function checkServerSupabaseStatus() {
  const start = Date.now();
  const maskedKey = `${SUPABASE_ANON_KEY.substring(0, 14)}...${SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 4)}`;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const latencyMs = Date.now() - start;

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
      keyMasked: maskedKey,
      latencyMs,
      httpStatus: response.status,
      statusText: response.statusText,
      mode: 'live-cloud',
      message: `Connected to Supabase Project ${SUPABASE_PROJECT_ID}`,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
      keyMasked: maskedKey,
      latencyMs,
      mode: 'local-fallback',
      message: err.message || 'Supabase host unreachable from server',
      timestamp: new Date().toISOString()
    };
  }
}
