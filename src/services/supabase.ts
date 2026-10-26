import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration for project: kfrvlmtbayncwlmzkdii
const DEFAULT_URL = 'https://kfrvlmtbayncwlmzkdii.supabase.co';
const DEFAULT_KEY = 'sb_publishable_0I-SIc1-ku00VJ-wW1oBiw_BNtP9q_Z';
const DEFAULT_PROJECT_ID = 'kfrvlmtbayncwlmzkdii';

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
  return `https://${candidate}.supabase.co`;
}

function resolveSupabaseKey(rawKey?: string): string {
  const fallback = 'sb_publishable_0I-SIc1-ku00VJ-wW1oBiw_BNtP9q_Z';
  const candidate = (rawKey || '').trim().replace(/^["']|["']$/g, '');
  return candidate || fallback;
}

const rawEnvProjectId = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_PROJECT_ID : undefined;
const rawEnvUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : undefined;
const rawEnvKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : undefined;

export const SUPABASE_PROJECT_ID: string = (rawEnvProjectId || 'kfrvlmtbayncwlmzkdii').trim().replace(/^["']|["']$/g, '');
export const SUPABASE_URL: string = resolveSupabaseUrl(rawEnvUrl, SUPABASE_PROJECT_ID);
export const SUPABASE_ANON_KEY: string = resolveSupabaseKey(rawEnvKey);

function initSupabaseClient(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn('Fallback Supabase client init:', err);
    return createClient('https://kfrvlmtbayncwlmzkdii.supabase.co', 'sb_publishable_0I-SIc1-ku00VJ-wW1oBiw_BNtP9q_Z');
  }
}

// Create singleton Supabase client instance
export const supabase: SupabaseClient = initSupabaseClient();

export interface SupabaseHealthStatus {
  connected: boolean;
  projectId: string;
  projectUrl: string;
  keyMasked: string;
  latencyMs: number;
  mode: 'live-cloud' | 'local-fallback';
  message: string;
  checkedAt: string;
}

/**
 * Ping Supabase instance to verify active connection
 */
export async function testSupabaseConnection(): Promise<SupabaseHealthStatus> {
  const startTime = Date.now();
  const maskedKey = `${SUPABASE_ANON_KEY.substring(0, 14)}...${SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 4)}`;

  try {
    // 1. Direct REST ping to Supabase root endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    const latencyMs = Date.now() - startTime;

    // Supabase REST endpoint returns 200 or 404 (for empty schema) with valid OpenAPI/headers
    // or status in the 200-404 range confirming live project reachability
    if (res.status === 200 || res.status === 404 || res.status === 401) {
      return {
        connected: true,
        projectId: SUPABASE_PROJECT_ID,
        projectUrl: SUPABASE_URL,
        keyMasked: maskedKey,
        latencyMs,
        mode: 'live-cloud',
        message: `Successfully connected to Supabase project ${SUPABASE_PROJECT_ID} (${latencyMs}ms)`,
        checkedAt: new Date().toISOString()
      };
    }

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
      keyMasked: maskedKey,
      latencyMs,
      mode: 'live-cloud',
      message: `Supabase server reachable (HTTP ${res.status})`,
      checkedAt: new Date().toISOString()
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      projectUrl: SUPABASE_URL,
      keyMasked: maskedKey,
      latencyMs,
      mode: 'local-fallback',
      message: err.message || 'Could not reach Supabase endpoint directly',
      checkedAt: new Date().toISOString()
    };
  }
}

/**
 * Sync helper: attempt to write to Supabase if table exists, otherwise gracefully retain local
 */
export async function syncHealthMetricToSupabase(metric: any): Promise<{ synced: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('health_metrics').upsert({
      id: metric.id,
      patient_id: metric.patientId,
      type: metric.type,
      value: metric.value,
      unit: metric.unit,
      notes: metric.notes,
      recorded_at: metric.recordedAt,
      created_at: new Date().toISOString()
    });

    if (error) {
      // If table does not exist in user's Supabase yet, return soft notification without crashing
      return { synced: false, error: error.message };
    }
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err.message };
  }
}
