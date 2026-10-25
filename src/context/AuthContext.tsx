import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PatientProfile, DoctorProfile, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

export interface DemoAccount {
  name: string;
  role: UserRole;
  email: string;
  specialty?: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Rohan Verma',
    role: 'patient',
    email: 'rohan@arogyapulse.in',
    description: 'Patient managing hypertension, ABHA ID (91-4421-8890-1204), vitals & prescriptions'
  },
  {
    name: 'Dr. Rajesh K. Sharma, MD, DM',
    role: 'doctor',
    email: 'dr.rajesh@arogyapulse.in',
    specialty: 'Cardiology',
    description: 'Senior Consultant Cardiologist at Apollo Heart Centre, New Delhi'
  },
  {
    name: 'Dr. Ananya Iyer, MD, DM',
    role: 'doctor',
    email: 'dr.ananya@arogyapulse.in',
    specialty: 'Neurology',
    description: 'Associate Professor & Consultant Neurologist at Manipal Hospital, Bengaluru'
  },
  {
    name: 'Dr. A. Swaminathan',
    role: 'admin',
    email: 'admin@arogyapulse.in',
    description: 'Medical Superintendent & Administrator managing audits, doctors, and ABDM integrations'
  }
];

interface AuthContextType {
  user: User | null;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoUser: (email: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  unreadNotificationsCount: number;
  setUnreadNotificationsCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [token, setTokenState] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(2);

  const fetchCurrentUser = async () => {
    try {
      if (!api.getToken()) {
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      setUser(data.user);
      setPatientProfile(data.patientProfile || null);
      setDoctorProfile(data.doctorProfile || null);
      setTokenState(api.getToken());

      // Fetch unread count
      try {
        const notifs = await api.getNotifications();
        const unread = notifs.notifications.filter(n => !n.isRead).length;
        setUnreadNotificationsCount(unread);
      } catch (e) {
        // Ignore notification count error
      }
    } catch (err) {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleExpired = () => {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
      setTokenState(null);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setPatientProfile(res.patientProfile || null);
      setDoctorProfile(res.doctorProfile || null);
      setTokenState(res.token);

      const notifs = await api.getNotifications().catch(() => ({ notifications: [] }));
      setUnreadNotificationsCount(notifs.notifications.filter(n => !n.isRead).length);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setPatientProfile(res.patientProfile || null);
      setDoctorProfile(res.doctorProfile || null);
      setTokenState(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
    } finally {
      setUser(null);
      setPatientProfile(null);
      setDoctorProfile(null);
      setTokenState(null);
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (email: string) => {
    let password = 'Patient@12345';
    if (email.startsWith('admin@')) password = 'Admin@12345';
    else if (email.startsWith('dr.') || email.includes('doctor')) password = 'Doctor@12345';

    await login(email, password);
  };

  const refreshAuth = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        doctorProfile,
        role: user?.role || null,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        refreshAuth,
        unreadNotificationsCount,
        setUnreadNotificationsCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
