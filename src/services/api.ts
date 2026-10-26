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
  AdminAnalyticsData,
  AiHealthSummary,
  MetricThresholdAlert
} from '../types/index.js';

const API_BASE = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('healthpulse_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('healthpulse_token', token);
    } else {
      localStorage.removeItem('healthpulse_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.setToken(null);
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      throw new Error(err.message || 'Unable to connect to HealthPulse servers. Please verify your connection.');
    }
  }

  // Auth
  async register(payload: any) {
    const res = await this.request<{
      token: string;
      user: User;
      patientProfile?: PatientProfile;
      doctorProfile?: DoctorProfile;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  async login(payload: { email: string; password: string }) {
    const res = await this.request<{
      token: string;
      user: User;
      patientProfile?: PatientProfile;
      doctorProfile?: DoctorProfile;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.setToken(null);
    }
  }

  async getMe() {
    return this.request<{
      user: User;
      patientProfile?: PatientProfile;
      doctorProfile?: DoctorProfile;
    }>('/auth/me');
  }

  // Patient Profile
  async getPatientProfile() {
    return this.request<{ user: User; profile: PatientProfile }>('/patients/profile');
  }

  async updatePatientProfile(data: Partial<PatientProfile> & { name?: string; phone?: string; profileImage?: string }) {
    return this.request<{ user: User; profile: PatientProfile }>('/patients/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getPatientFullHistory(patientId: string) {
    return this.request<{
      patient: User;
      profile?: PatientProfile;
      appointments: Appointment[];
      medicalRecords: MedicalRecord[];
      prescriptions: Prescription[];
      medications: Medication[];
      healthMetrics: HealthMetric[];
    }>(`/patients/${patientId}/full-history`);
  }

  // Doctors
  async getDoctors(params: { search?: string; specialty?: string; day?: string } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.specialty) query.append('specialty', params.specialty);
    if (params.day) query.append('day', params.day);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ doctors: Array<User & { profile: DoctorProfile }> }>(`/doctors${qs}`);
  }

  async getDoctorById(id: string) {
    return this.request<{ doctor: User; profile: DoctorProfile }>(`/doctors/${id}`);
  }

  async updateDoctorProfile(data: Partial<DoctorProfile> & { name?: string; phone?: string; profileImage?: string }) {
    return this.request<{ doctor: User; profile: DoctorProfile }>('/doctors/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getDoctorPatients() {
    return this.request<{ patients: Array<User & { profile?: PatientProfile; appointmentCount: number; latestAppointment?: Appointment }> }>('/doctors-patients');
  }

  // Appointments
  async getAppointments() {
    return this.request<{ appointments: Appointment[] }>('/appointments');
  }

  async bookAppointment(data: {
    doctorId: string;
    appointmentDate: string;
    appointmentTime: string;
    type: 'in-person' | 'video';
    reason: string;
    notes?: string;
  }) {
    return this.request<{ message: string; appointment: Appointment }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    return this.request<{ message: string; appointment: Appointment }>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async cancelAppointment(id: string) {
    return this.request<{ message: string }>(`/appointments/${id}`, {
      method: 'DELETE'
    });
  }

  // Medical Records
  async getMedicalRecords(patientId?: string) {
    const qs = patientId ? `?patientId=${patientId}` : '';
    return this.request<{ records: MedicalRecord[] }>(`/medical-records${qs}`);
  }

  async uploadMedicalRecord(record: Partial<MedicalRecord>) {
    return this.request<{ message: string; record: MedicalRecord }>('/medical-records', {
      method: 'POST',
      body: JSON.stringify(record)
    });
  }

  async updateMedicalRecord(id: string, updates: Partial<MedicalRecord>) {
    return this.request<{ message: string; record: MedicalRecord }>(`/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteMedicalRecord(id: string) {
    return this.request<{ message: string }>(`/medical-records/${id}`, {
      method: 'DELETE'
    });
  }

  // Prescriptions
  async getPrescriptions() {
    return this.request<{ prescriptions: Prescription[] }>('/prescriptions');
  }

  async getPrescriptionById(id: string) {
    return this.request<{ prescription: Prescription }>(`/prescriptions/${id}`);
  }

  async updatePrescription(id: string, updates: Partial<Prescription>) {
    return this.request<{ message: string; prescription: Prescription }>(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deletePrescription(id: string) {
    return this.request<{ message: string }>(`/prescriptions/${id}`, {
      method: 'DELETE'
    });
  }

  async createPrescription(data: {
    patientId: string;
    diagnosis: string;
    notes?: string;
    items: Array<{
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
  }) {
    return this.request<{ message: string; prescription: Prescription }>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Medications
  async getMedications(patientId?: string) {
    const qs = patientId ? `?patientId=${patientId}` : '';
    return this.request<{ medications: Medication[] }>(`/medications${qs}`);
  }

  async addMedication(med: Partial<Medication>) {
    return this.request<{ message: string; medication: Medication }>('/medications', {
      method: 'POST',
      body: JSON.stringify(med)
    });
  }

  async logAdherence(medicationId: string, status: 'taken' | 'skipped', date?: string) {
    return this.request<{ message: string; medication: Medication }>(`/medications/${medicationId}/adherence`, {
      method: 'POST',
      body: JSON.stringify({ status, date })
    });
  }

  async deleteMedication(id: string) {
    return this.request<{ message: string }>(`/medications/${id}`, {
      method: 'DELETE'
    });
  }

  // Health Metrics
  async getHealthMetrics(patientId?: string) {
    const qs = patientId ? `?patientId=${patientId}` : '';
    return this.request<{ metrics: HealthMetric[] }>(`/health-metrics${qs}`);
  }

  async addHealthMetric(metric: Partial<HealthMetric>) {
    return this.request<{ message: string; metric: HealthMetric }>('/health-metrics', {
      method: 'POST',
      body: JSON.stringify(metric)
    });
  }

  async deleteHealthMetric(id: string) {
    return this.request<{ message: string }>(`/health-metrics/${id}`, {
      method: 'DELETE'
    });
  }

  // Metric Threshold Alerts
  async getMetricThresholds(patientId?: string) {
    const qs = patientId ? `?patientId=${patientId}` : '';
    return this.request<{ thresholds: MetricThresholdAlert[] }>(`/metric-thresholds${qs}`);
  }

  async createMetricThreshold(data: Partial<MetricThresholdAlert>) {
    return this.request<{ message: string; threshold: MetricThresholdAlert }>('/metric-thresholds', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMetricThreshold(id: string, data: Partial<MetricThresholdAlert>) {
    return this.request<{ message: string; threshold: MetricThresholdAlert }>(`/metric-thresholds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMetricThreshold(id: string) {
    return this.request<{ message: string }>(`/metric-thresholds/${id}`, {
      method: 'DELETE'
    });
  }

  async testMetricThreshold(data: {
    metricType: string;
    title: string;
    currentValue?: number;
    thresholdValue: number;
    unit?: string;
    severity?: string;
  }) {
    return this.request<{ message: string; notification: any }>('/metric-thresholds/test', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Health Goals
  async getHealthGoals() {
    return this.request<{ goals: HealthGoal[] }>('/health-goals');
  }

  async createHealthGoal(goal: Partial<HealthGoal>) {
    return this.request<{ message: string; goal: HealthGoal }>('/health-goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  }

  async updateHealthGoal(id: string, updates: Partial<HealthGoal>) {
    return this.request<{ message: string; goal: HealthGoal }>(`/health-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteHealthGoal(id: string) {
    return this.request<{ message: string }>(`/health-goals/${id}`, {
      method: 'DELETE'
    });
  }

  // Daily Wellness
  async getDailyWellness() {
    return this.request<{ dailyWellness: DailyWellness[] }>('/daily-tracking');
  }

  async saveDailyWellness(entry: Partial<DailyWellness>) {
    return this.request<{ message: string; entry: DailyWellness }>('/daily-tracking', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
  }

  // Notifications
  async getNotifications() {
    return this.request<{ notifications: Notification[] }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>('/notifications-read-all', {
      method: 'PUT'
    });
  }

  async deleteNotification(id: string) {
    return this.request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE'
    });
  }

  // Messages
  async getMessages() {
    return this.request<{
      messages: Message[];
      contacts: Array<{ id: string; name: string; role: string; unreadCount: number; lastMessage: string }>;
    }>('/messages');
  }

  async sendMessage(receiverId: string, message: string) {
    return this.request<{ message: string; data: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message })
    });
  }

  async markMessageRead(id: string) {
    return this.request<{ message: string; data: Message }>(`/messages/${id}/read`, {
      method: 'PUT'
    });
  }

  // Admin
  async getAdminStats() {
    return this.request<AdminAnalyticsData>('/admin/stats');
  }

  async getAdminUsers() {
    return this.request<{ users: User[] }>('/admin/users');
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive') {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  async verifyDoctor(doctorId: string, verificationStatus: 'verified' | 'rejected') {
    return this.request<{ message: string; profile: DoctorProfile }>(`/admin/doctors/${doctorId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verificationStatus })
    });
  }

  async getAuditLogs() {
    return this.request<{ logs: AuditLog[] }>('/admin/audit-logs');
  }

  async getAdminAllData() {
    return this.request<{
      appointments: Appointment[];
      medicalRecords: MedicalRecord[];
      prescriptions: Prescription[];
      patients: Array<User & { profile?: PatientProfile; appointmentCount: number; recordsCount: number; prescriptionCount: number }>;
      doctors: Array<User & { profile?: DoctorProfile; appointmentCount: number }>;
    }>('/admin/all-data');
  }

  async updatePatientByAdmin(patientId: string, data: any) {
    return this.request<{ message: string; user: User; profile: PatientProfile }>(`/admin/patients/${patientId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAppointmentPermanent(id: string) {
    return this.request<{ message: string }>(`/appointments/${id}?hard=true&action=delete`, {
      method: 'DELETE'
    });
  }

  // AI Health Summary (Gemini API)
  async getAiHealthSummary(patientId?: string) {
    return this.request<{ summary: AiHealthSummary }>('/ai/health-summary', {
      method: 'POST',
      body: JSON.stringify(patientId ? { patientId } : {})
    });
  }

  // Supabase Cloud Connection
  async getSupabaseStatus() {
    return this.request<{
      connected: boolean;
      projectId: string;
      projectUrl: string;
      keyMasked: string;
      latencyMs: number;
      httpStatus?: number;
      mode: string;
      message: string;
      timestamp: string;
    }>('/supabase/status');
  }

  async testSupabasePing() {
    return this.request<{
      success: boolean;
      data: {
        connected: boolean;
        projectId: string;
        projectUrl: string;
        keyMasked: string;
        latencyMs: number;
        mode: string;
        message: string;
        timestamp: string;
      };
    }>('/supabase/ping', {
      method: 'POST'
    });
  }

  async getSupabaseStats() {
    return this.request<{
      projectId: string;
      projectUrl: string;
      totalAttempts: number;
      successfulSyncs: number;
      recentLogs: Array<{
        id: string;
        table: string;
        recordId: string;
        action: string;
        status: string;
        details?: string;
        timestamp: string;
      }>;
      activeConfig: {
        url: string;
        keyMasked: string;
      };
    }>('/supabase/stats');
  }

  async getSupabaseSqlSchema() {
    const res = await fetch('/api/supabase/schema');
    return res.text();
  }

  async syncAllToSupabase() {
    return this.request<{
      success: boolean;
      message: string;
      totalSynced: number;
      results: Record<string, number>;
      errors: string[];
    }>('/supabase/sync-all', {
      method: 'POST'
    });
  }
}

export const api = new ApiService();
