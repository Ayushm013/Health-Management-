import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Volume2,
  Smartphone,
  Mail,
  ShieldAlert,
  X,
  Sliders,
  Play
} from 'lucide-react';
import { api } from '../../services/api.js';
import { MetricThresholdAlert, AlertMetricType, AlertCondition, AlertSeverity, HealthMetric } from '../../types/index.js';

interface MetricThresholdAlertsConfigProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: HealthMetric[];
  onThresholdsUpdated?: () => void;
}

// Web Audio API chime generator for audible alerts
const playAlertChime = (severity: AlertSeverity = 'advisory') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'critical' ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(severity === 'critical' ? 880 : 587.33, ctx.currentTime); // A5 or D5
    if (severity === 'critical') {
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // AudioContext might be blocked until user gesture, safely ignore
  }
};

export const MetricThresholdAlertsConfig: React.FC<MetricThresholdAlertsConfigProps> = ({
  isOpen,
  onClose,
  metrics,
  onThresholdsUpdated
}) => {
  const [thresholds, setThresholds] = useState<MetricThresholdAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Alert Form state
  const [metricType, setMetricType] = useState<AlertMetricType>('bmi');
  const [title, setTitle] = useState('BMI Overweight Threshold');
  const [condition, setCondition] = useState<AlertCondition>('greater_than');
  const [thresholdValue, setThresholdValue] = useState('25.0');
  const [thresholdMax, setThresholdMax] = useState('29.9');
  const [unit, setUnit] = useState('kg/m²');
  const [severity, setSeverity] = useState<AlertSeverity>('advisory');
  const [inApp, setInApp] = useState(true);
  const [soundChime, setSoundChime] = useState(true);
  const [smsAlert, setSmsAlert] = useState(true);
  const [emailAlert, setEmailAlert] = useState(true);
  const [customMessage, setCustomMessage] = useState('BMI entered overweight boundary. Adjust caloric intake and initiate daily 30-min walk.');

  useEffect(() => {
    if (isOpen) {
      loadThresholds();
    }
  }, [isOpen]);

  const loadThresholds = async () => {
    try {
      setLoading(true);
      const res = await api.getMetricThresholds();
      setThresholds(res.thresholds || []);
    } catch (err) {
      console.error('Error fetching metric thresholds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricTypeChange = (type: AlertMetricType) => {
    setMetricType(type);
    if (type === 'bmi') {
      setTitle('BMI Overweight Alert Threshold');
      setUnit('kg/m²');
      setThresholdValue('25.0');
      setCustomMessage('BMI exceeded normal limit (24.9). Initiate dietary consultation & daily brisk walking.');
    } else if (type === 'weight') {
      setTitle('Weight Maintenance Ceiling');
      setUnit('kg');
      setThresholdValue('70.0');
      setCustomMessage('Weight exceeded target upper threshold of 70 kg. Monitor sodium & portion sizes.');
    } else if (type === 'blood_pressure') {
      setTitle('Systolic Blood Pressure Spike Alert');
      setUnit('mmHg');
      setThresholdValue('135');
      setCustomMessage('Systolic BP higher than 135 mmHg. Rest in a quiet space and hydrate.');
    } else if (type === 'blood_glucose') {
      setTitle('Fasting Blood Glucose Alert');
      setUnit('mg/dL');
      setThresholdValue('125');
      setCustomMessage('Blood glucose exceeded 125 mg/dL. Log carbs and alert primary physician if persistent.');
    } else if (type === 'heart_rate') {
      setTitle('Tachycardia / Elevated Heart Rate Alert');
      setUnit('bpm');
      setThresholdValue('95');
      setCustomMessage('Resting heart rate exceeded 95 bpm.');
    } else if (type === 'oxygen_saturation') {
      setTitle('Low Blood Oxygen (SpO2) Caution');
      setUnit('%');
      setCondition('less_than');
      setThresholdValue('95');
      setCustomMessage('SpO2 lower than 95%. Ensure warm hands and re-check, or call 108/112 if breathless.');
    } else if (type === 'body_temperature') {
      setTitle('Fever / Elevated Body Temperature Alert');
      setUnit('°F');
      setThresholdValue('100.4');
      setCustomMessage('Body temperature above 100.4°F. Stay hydrated and monitor symptoms.');
    }
  };

  const handleToggle = async (alert: MetricThresholdAlert) => {
    try {
      const updated = await api.updateMetricThreshold(alert.id, {
        enabled: !alert.enabled
      });
      setThresholds(prev => prev.map(t => t.id === alert.id ? { ...t, enabled: !t.enabled } : t));
      if (onThresholdsUpdated) onThresholdsUpdated();
    } catch (err) {
      console.error('Error toggling threshold:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this threshold alert configuration?')) return;
    try {
      await api.deleteMetricThreshold(id);
      setThresholds(prev => prev.filter(t => t.id !== id));
      if (onThresholdsUpdated) onThresholdsUpdated();
    } catch (err) {
      console.error('Error deleting threshold:', err);
    }
  };

  const handleTestNotification = async (alert: MetricThresholdAlert) => {
    setTestingId(alert.id);
    if (alert.notifyChannels.soundChime) {
      playAlertChime(alert.severity);
    }

    try {
      await api.testMetricThreshold({
        metricType: alert.metricType,
        title: alert.title,
        thresholdValue: alert.thresholdValue,
        unit: alert.unit,
        severity: alert.severity
      });
      setFeedback(`Dispatched test alert for "${alert.title}". In-app notification & chime fired!`);
      setTimeout(() => setFeedback(null), 4000);
      if (onThresholdsUpdated) onThresholdsUpdated();
    } catch (err) {
      setFeedback('Test notification delivered locally.');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setTestingId(null);
    }
  };

  const handleCreateThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<MetricThresholdAlert> = {
        metricType,
        title: title.trim() || `${metricType.toUpperCase()} Threshold Alert`,
        condition,
        thresholdValue: parseFloat(thresholdValue),
        thresholdMax: condition === 'outside_range' ? parseFloat(thresholdMax) : undefined,
        unit,
        severity,
        enabled: true,
        notifyChannels: {
          inApp,
          soundChime,
          smsAlert,
          emailAlert
        },
        customMessage: customMessage.trim()
      };

      const res = await api.createMetricThreshold(payload);
      setThresholds(prev => [...prev, res.threshold]);
      setIsAddingNew(false);
      setFeedback(`Custom alert rule for ${metricType.replace('_', ' ')} configured successfully.`);
      setTimeout(() => setFeedback(null), 4000);
      if (onThresholdsUpdated) onThresholdsUpdated();
    } catch (err) {
      alert('Unable to save custom threshold alert.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 text-teal-800 flex items-center justify-center shadow-2xs">
              <Bell className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Custom Threshold Alert Configuration</h2>
              <p className="text-xs text-slate-500">
                Personalized notifications when biometrics like BMI, Weight, or BP cross your custom limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-teal-600 hover:text-teal-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 font-medium">
              <span className="font-bold text-slate-900">{thresholds.length}</span> Active Rules Configured
            </div>
            {!isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Threshold Rule</span>
              </button>
            )}
          </div>

          {/* Form to Add New Rule */}
          {isAddingNew && (
            <form onSubmit={handleCreateThreshold} className="bg-slate-50 border border-teal-200/80 rounded-xl p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  <span>Configure New Metric Threshold</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Health Metric</label>
                  <select
                    value={metricType}
                    onChange={(e) => handleMetricTypeChange(e.target.value as AlertMetricType)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="bmi">Body Mass Index (BMI)</option>
                    <option value="weight">Body Weight (kg)</option>
                    <option value="blood_pressure">Blood Pressure (Systolic mmHg)</option>
                    <option value="blood_glucose">Blood Glucose (mg/dL)</option>
                    <option value="heart_rate">Heart Rate (bpm)</option>
                    <option value="oxygen_saturation">Oxygen Saturation (SpO2 %)</option>
                    <option value="body_temperature">Body Temperature (°F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alert Rule Label</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. BMI Upper Limit Caution"
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Trigger Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as AlertCondition)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  >
                    <option value="greater_than">Exceeds Threshold (&gt;)</option>
                    <option value="less_than">Falls Below Threshold (&lt;)</option>
                    <option value="outside_range">Outside Range (&lt; Min or &gt; Max)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {condition === 'outside_range' ? 'Minimum Value' : 'Threshold Value'} ({unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                    placeholder="e.g. 25.0"
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                  />
                </div>

                {condition === 'outside_range' ? (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Maximum Value ({unit})</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={thresholdMax}
                      onChange={(e) => setThresholdMax(e.target.value)}
                      placeholder="e.g. 29.9"
                      className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alert Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as AlertSeverity)}
                      className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                    >
                      <option value="info">Informational (Blue)</option>
                      <option value="advisory">Advisory Caution (Amber)</option>
                      <option value="critical">Critical / Urgent (Red)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Notification Channels */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Dispatch Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inApp}
                      onChange={(e) => setInApp(e.target.checked)}
                      className="accent-teal-600"
                    />
                    <Bell className="w-3.5 h-3.5 text-teal-600" />
                    <span>In-App Banner</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundChime}
                      onChange={(e) => setSoundChime(e.target.checked)}
                      className="accent-teal-600"
                    />
                    <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sound Chime</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsAlert}
                      onChange={(e) => setSmsAlert(e.target.checked)}
                      className="accent-teal-600"
                    />
                    <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                    <span>SMS Alert</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlert}
                      onChange={(e) => setEmailAlert(e.target.checked)}
                      className="accent-teal-600"
                    />
                    <Mail className="w-3.5 h-3.5 text-teal-600" />
                    <span>Email Digest</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Custom Advisory Note</label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. Schedule review with physician if reading remains high"
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-teal-600 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                >
                  Save Alert Rule
                </button>
              </div>
            </form>
          )}

          {/* List of Configured Thresholds */}
          <div className="space-y-3">
            {thresholds.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No custom threshold alerts configured yet. Click &quot;Add Threshold Rule&quot; to set custom bounds for BMI, Weight, or Vitals.
              </div>
            ) : (
              thresholds.map((rule) => {
                const isCritical = rule.severity === 'critical';
                const isAdvisory = rule.severity === 'advisory';

                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border transition-all ${
                      rule.enabled
                        ? isCritical
                          ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                          : isAdvisory
                          ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                          : 'bg-white border-slate-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rule.title}</span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isAdvisory
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {rule.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                            {rule.metricType.toUpperCase()}
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">
                            {rule.condition === 'greater_than'
                              ? `Alert when value > ${rule.thresholdValue} ${rule.unit}`
                              : rule.condition === 'less_than'
                              ? `Alert when value < ${rule.thresholdValue} ${rule.unit}`
                              : `Alert when value < ${rule.thresholdValue} or > ${rule.thresholdMax} ${rule.unit}`}
                          </span>
                        </div>

                        {rule.customMessage && (
                          <p className="text-[11px] text-slate-600 italic">
                            &quot;{rule.customMessage}&quot;
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3 text-slate-400" />
                            {rule.notifyChannels.inApp ? 'In-App' : 'Off'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-slate-400" />
                            {rule.notifyChannels.soundChime ? 'Chime' : 'Mute'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" />
                            {rule.notifyChannels.smsAlert ? 'SMS (+91)' : 'No SMS'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {rule.notifyChannels.emailAlert ? 'Email' : 'No Email'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Test Button */}
                        <button
                          type="button"
                          onClick={() => handleTestNotification(rule)}
                          disabled={testingId === rule.id}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                          title="Simulate this alert right now"
                        >
                          <Play className="w-3 h-3 text-teal-600" />
                          <span>{testingId === rule.id ? 'Fired...' : 'Test'}</span>
                        </button>

                        {/* Toggle switch */}
                        <button
                          type="button"
                          onClick={() => handleToggle(rule)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            rule.enabled ? 'bg-teal-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              rule.enabled ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer with Move Back */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Rules evaluate automatically against all incoming vital records & Indian clinical standards.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors"
          >
            ← Move Back to Vitals
          </button>
        </div>
      </div>
    </div>
  );
};
